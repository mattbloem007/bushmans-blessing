const Stripe = require('stripe')

// Verifies and acknowledges Stripe events so Stripe doesn't retry. Logs
// completed checkouts for now — this is the hook point for order
// confirmation emails / inventory updates once those systems exist.
exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return { statusCode: 500, body: 'Stripe is not configured yet.' }
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
  const signature = event.headers['stripe-signature']
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body

  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return { statusCode: 400, body: `Webhook Error: ${err.message}` }
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object
    console.log('checkout.session.completed', {
      id: session.id,
      amountTotal: session.amount_total,
      customerEmail: session.customer_details?.email,
    })
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
