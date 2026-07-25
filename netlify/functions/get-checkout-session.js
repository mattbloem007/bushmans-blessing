const Stripe = require('stripe')

exports.handler = async event => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe is not configured yet.' }) }
  }

  const sessionId = event.queryStringParameters?.session_id
  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing session_id' }) }
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email,
        shippingAddress: session.shipping_details?.address || session.customer_details?.address || null,
        lineItems: (session.line_items?.data || []).map(li => ({
          description: li.description,
          quantity: li.quantity,
          amountTotal: li.amount_total,
        })),
      }),
    }
  } catch (err) {
    console.error('get-checkout-session error:', err)
    return { statusCode: 404, body: JSON.stringify({ error: 'Session not found' }) }
  }
}
