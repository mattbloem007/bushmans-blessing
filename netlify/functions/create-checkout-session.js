const Stripe = require('stripe')

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN
const CONTENTFUL_ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'
const SITE_URL = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888'

// EU + UK — the two shipping zones the business currently ships to.
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
]

// Re-resolves each cart item against Contentful by slug — the client's
// submitted price/type is never trusted for the actual Stripe line item.
async function fetchProductBySlug(slug) {
  const url = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries?content_type=product&fields.slug=${encodeURIComponent(slug)}&limit=1`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}` },
  })
  if (!res.ok) throw new Error(`Contentful lookup failed for "${slug}"`)
  const data = await res.json()
  const entry = data.items?.[0]
  if (!entry) return null
  return {
    name: entry.fields.name,
    slug: entry.fields.slug,
    productType: entry.fields.productType || 'physical',
    stripePriceId: entry.fields.stripePriceId,
    inStock: entry.fields.inStock !== false,
  }
}

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe is not configured yet.' }) }
  }

  let items
  try {
    ;({ items } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Cart is empty' }) }
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const lineItems = []
    let hasPhysicalItem = false

    for (const { slug, quantity } of items) {
      const qty = Number(quantity)
      if (!slug || !Number.isInteger(qty) || qty < 1) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid cart item' }) }
      }

      const product = await fetchProductBySlug(slug)
      if (!product || !product.inStock) {
        return { statusCode: 400, body: JSON.stringify({ error: `"${slug}" is unavailable` }) }
      }
      if (!product.stripePriceId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `"${product.name}" is not yet available for purchase` }),
        }
      }

      if (product.productType === 'physical' || product.productType === 'bundle') {
        hasPhysicalItem = true
      }

      lineItems.push({ price: product.stripePriceId, quantity: qty })
    }

    const sessionConfig = {
      mode: 'payment',
      line_items: lineItems,
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/checkout/cancel`,
    }

    // Digital-only carts skip shipping entirely. Physical/bundle carts get
    // two named flat rates — the customer picks the one matching their
    // country, since Stripe Checkout doesn't auto-restrict rate-by-country
    // without the paid Stripe Tax add-on.
    if (hasPhysicalItem) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: [...EU_COUNTRIES, 'GB'],
      }
      sessionConfig.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 850, currency: 'eur' },
            display_name: 'EU Shipping — €8.50',
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1400, currency: 'eur' },
            display_name: 'UK Shipping — €14.00',
          },
        },
      ]
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) }
  } catch (err) {
    console.error('create-checkout-session error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not start checkout' }) }
  }
}
