const Stripe = require('stripe')
const { fetchProductBySlug, fetchRetailerBySlug } = require('./lib/contentful')
const { getPaidCents } = require('./lib/retailerLedger')

const SITE_URL = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888'

// Checkout for an exclusive regional retailer's own storefront. Unlike
// create-checkout-session.js (which charges Bushman's Blessing's own
// platform Stripe account, with an optional partial transfer to Mantis
// Collective), this creates a Stripe Connect DIRECT CHARGE on the
// retailer's own connected account — the retailer is merchant of record,
// and the payment settles in their account, not the platform's.
//
// Price objects are scoped to a single Stripe account, so a Price ID from
// the platform account can't be charged on a connected account — line
// items are built inline with price_data instead, sourced from the same
// Contentful price the main site trusts (with an optional per-retailer
// override).
exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe is not configured yet.' }) }
  }

  let retailerSlug, items
  try {
    ;({ retailerSlug, items } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  if (!retailerSlug) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing retailerSlug' }) }
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Cart is empty' }) }
  }

  const retailer = await fetchRetailerBySlug(retailerSlug)
  if (!retailer || !retailer.active) {
    return { statusCode: 400, body: JSON.stringify({ error: 'This retailer is not currently available' }) }
  }
  if (!retailer.stripeAccountId) {
    return { statusCode: 500, body: JSON.stringify({ error: 'This retailer is not yet set up for payments' }) }
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const lineItems = []
    let hasPhysicalItem = false
    let subtotalCents = 0

    for (const { slug, quantity } of items) {
      const qty = Number(quantity)
      if (!slug || !Number.isInteger(qty) || qty < 1) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid cart item' }) }
      }

      const product = await fetchProductBySlug(slug)
      if (!product || !product.inStock) {
        return { statusCode: 400, body: JSON.stringify({ error: `"${slug}" is unavailable` }) }
      }

      const unitAmount = retailer.priceOverrideInCents || product.priceInCents
      if (!unitAmount) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `"${product.name}" is not yet available for purchase` }),
        }
      }

      // Same fail-safe as create-checkout-session.js: only an explicitly
      // "digital" product skips shipping collection.
      if (product.productType !== 'digital') {
        hasPhysicalItem = true
      }

      subtotalCents += unitAmount * qty
      lineItems.push({
        quantity: qty,
        price_data: {
          currency: 'eur',
          unit_amount: unitAmount,
          product_data: { name: product.name },
        },
      })
    }

    const sessionConfig = {
      mode: 'payment',
      line_items: lineItems,
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&account=${retailer.stripeAccountId}`,
      cancel_url: `${SITE_URL}/retailers/${retailer.slug}/`,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
    }

    if (hasPhysicalItem) {
      if (retailer.countries.length === 0) {
        console.error(`Retailer "${retailer.slug}" has a physical item in cart but no countries configured`)
        return { statusCode: 500, body: JSON.stringify({ error: 'This retailer is not yet fully configured' }) }
      }
      sessionConfig.shipping_address_collection = {
        allowed_countries: retailer.countries,
      }
      sessionConfig.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: retailer.shippingCents, currency: 'eur' },
            display_name:
              retailer.shippingCents > 0
                ? `${retailer.name} Shipping — €${(retailer.shippingCents / 100).toFixed(2)}`
                : `${retailer.name} Shipping — Free`,
          },
        },
      ]
    }

    // Licensing-fee payment plan: while the retailer hasn't yet paid off
    // their totalFeeCents (a flat-rate retailer leaves this at 0 and never
    // hits this branch), each sale carries an application fee — collected
    // by Stripe as part of the same charge, routed to the platform account
    // automatically. Applied to the product subtotal only, not shipping.
    // "Paid off" is derived live from the ledger vs. the contract terms, so
    // there's no separate status flag that could drift out of sync.
    if (retailer.totalFeeCents > 0) {
      const paidCents = await getPaidCents(retailer.stripeAccountId)
      const remainingOwed = Math.max(0, retailer.totalFeeCents - paidCents)
      if (remainingOwed > 0) {
        const feeCents = Math.min(
          remainingOwed,
          Math.round((subtotalCents * retailer.perSaleFeePercent) / 100)
        )
        if (feeCents > 0) {
          sessionConfig.payment_intent_data = { application_fee_amount: feeCents }
        }
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig, {
      stripeAccount: retailer.stripeAccountId,
    })

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) }
  } catch (err) {
    console.error('create-retailer-checkout-session error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not start checkout' }) }
  }
}
