const Stripe = require('stripe')
const { getSessionEmail, wholesaleStore } = require('./lib/wholesaleAuth')
const { fetchWholesaleProductBySlug } = require('./lib/contentful')

const SITE_URL = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888'

// Wholesale orders are placed WITH Bushman's Blessing on the platform's own
// Stripe account (unlike create-retailer-checkout-session.js, which charges
// a retailer's own connected account) — so real Stripe Price objects can be
// used directly, same as the main create-checkout-session.js.
exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe is not configured yet.' }) }
  }

  const email = getSessionEmail(event)
  if (!email) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Not logged in' }) }
  }

  let items, packagingAcknowledged
  try {
    ;({ items, packagingAcknowledged } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Cart is empty' }) }
  }

  try {
    const wholesalerStore = wholesaleStore('wholesalers')
    const raw = await wholesalerStore.get(email)
    const wholesaler = raw ? JSON.parse(raw) : null
    if (!wholesaler || wholesaler.status !== 'active') {
      return { statusCode: 401, body: JSON.stringify({ error: 'Not logged in' }) }
    }

    const lineItems = []
    let hasUnbottledItem = false

    for (const { slug, quantity } of items) {
      const qty = Number(quantity)
      if (!slug || !Number.isInteger(qty) || qty < 1) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid cart item' }) }
      }

      const product = await fetchWholesaleProductBySlug(slug)
      if (!product || !product.active) {
        return { statusCode: 400, body: JSON.stringify({ error: `"${slug}" is unavailable` }) }
      }
      if (!product.stripePriceId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `"${product.name}" is not yet available for purchase` }),
        }
      }
      // Re-enforced here even though the portal UI also checks this — a
      // tampered client request must not be able to buy fewer than the
      // minimum, same "never trust the client" principle as the rest of
      // this codebase's checkout functions.
      if (qty < product.minQuantity) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `"${product.name}" requires a minimum order of ${product.minQuantity}` }),
        }
      }

      if (product.unbottled) hasUnbottledItem = true
      lineItems.push({ price: product.stripePriceId, quantity: qty })
    }

    if (hasUnbottledItem && packagingAcknowledged !== true) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Please acknowledge the packaging note before checking out' }),
      }
    }

    const session = await stripeCheckoutSession({
      lineItems,
      email,
      companyName: wholesaler.companyName,
      packagingAcknowledged: hasUnbottledItem && packagingAcknowledged === true,
    })

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) }
  } catch (err) {
    console.error('create-wholesale-checkout-session error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not start checkout' }) }
  }
}

// Requesting customer_balance (bank transfer) on a Checkout Session fails
// the WHOLE session — card included — if that payment method isn't yet
// enabled in the Stripe Dashboard (Settings > Payment methods). Gated
// behind this flag so going live with card-only doesn't require touching
// this file again later — flip WHOLESALE_BANK_TRANSFER_ENABLED to "true"
// (and redeploy) once the Dashboard toggle is on.
const BANK_TRANSFER_ENABLED = process.env.WHOLESALE_BANK_TRANSFER_ENABLED === 'true'

async function stripeCheckoutSession({ lineItems, email, companyName, packagingAcknowledged }) {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

  const sessionConfig = {
    mode: 'payment',
    line_items: lineItems,
    success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/wholesale/portal/`,
    billing_address_collection: 'required',
    phone_number_collection: { enabled: true },
    customer_creation: 'always',
    customer_email: email,
    payment_method_types: BANK_TRANSFER_ENABLED ? ['card', 'customer_balance'] : ['card'],
    metadata: {
      orderType: 'wholesale',
      wholesalerEmail: email,
      companyName,
      packagingAcknowledged: String(packagingAcknowledged),
    },
  }

  if (BANK_TRANSFER_ENABLED) {
    sessionConfig.payment_method_options = {
      customer_balance: {
        funding_type: 'bank_transfer',
        bank_transfer: { type: 'eu_bank_transfer', eu_bank_transfer: { country: 'NL' } },
      },
    }
  }

  return stripe.checkout.sessions.create(sessionConfig)
}
