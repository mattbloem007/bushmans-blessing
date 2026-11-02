const Stripe = require('stripe')
const { config, getOption, bundleCutoffPassed, formatEuro } = require('./lib/kannaOnline')
const { MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID } = require('./lib/giveback')

const SITE_URL = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888'

const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
]

// Checkout for the temporary Kanna Online page. Unlike the shop, these
// aren't Contentful products with Stripe Price objects — the page is
// temporary, so the session is built from inline price_data straight out of
// shared/kanna-online.json. Prices there are in cents.
exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe is not configured yet.' }) }
  }

  let optionId
  try {
    ;({ option: optionId } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  const option = getOption(optionId)
  if (!option) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown ticket option' }) }
  }

  // The server, not the page, decides whether a bundle can still be bought.
  // After the cut-off the bottles can't reach anyone in time, so only the
  // experience-only ticket remains — and a stale browser tab can't sneak a
  // bundle through.
  if (option.requiresShipping && bundleCutoffPassed()) {
    return {
      statusCode: 409,
      body: JSON.stringify({
        error: `The ${formatEuro(option.priceInCents)} option is no longer available — the last date for posting a bundle was ${config.bundleCutoff.label}. The experience on its own is still open.`,
      }),
    }
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

  const sessionConfig = {
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: config.currency,
          unit_amount: option.priceInCents,
          product_data: {
            name: option.checkoutName,
            description: option.checkoutDescription,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${SITE_URL}/kanna-online/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/kanna-online/`,
    // "always" so every participant becomes a real Stripe Customer — that's
    // the record the mailing list and the join-link send are built from.
    customer_creation: 'always',
    billing_address_collection: 'required',
    custom_text: {
      submit: {
        message:
          "We'll use this email to send your confirmation, the event details and the join link on the day. You can unsubscribe at any time.",
      },
    },
    metadata: {
      orderType: 'experience',
      experienceOption: option.id,
      experienceOptionLabel: option.label,
      experienceDate: config.event.dateLabel,
      experienceTime: config.event.timeLabel,
    },
  }

  if (option.requiresShipping) {
    sessionConfig.shipping_address_collection = {
      allowed_countries: [...EU_COUNTRIES, 'GB'],
    }
    sessionConfig.phone_number_collection = { enabled: true }
    sessionConfig.shipping_options = [
      { name: 'Netherlands', amount: 550 },
      { name: 'EU', amount: 850 },
      { name: 'UK', amount: 1400 },
    ].map(({ name, amount }) => ({
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount, currency: 'eur' },
        display_name: `${name} Shipping — €${(amount / 100).toFixed(2)}`,
      },
    }))
  }

  // The experience itself is delivered with Mantis Collective, so the cost of
  // a place (mantisShareCents in shared/kanna-online.json) is sent straight
  // to their connected account as part of the same payment. Whatever the
  // sample or bottle adds stays with the company — this page deliberately
  // carries no per-bottle giveback on top.
  if (option.mantisShareCents > 0) {
    if (MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID) {
      sessionConfig.payment_intent_data = {
        transfer_data: {
          destination: MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID,
          amount: option.mantisShareCents,
        },
      }
    } else {
      console.warn(
        'Kanna Online carries a Mantis Collective share but MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID is not set — skipping transfer'
      )
    }
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionConfig)
    return { statusCode: 200, body: JSON.stringify({ url: session.url }) }
  } catch (err) {
    console.error('create-experience-checkout-session error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not start checkout' }) }
  }
}
