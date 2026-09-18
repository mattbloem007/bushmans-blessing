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

  // Retailer checkouts (create-retailer-checkout-session.js) create the
  // session directly on the retailer's connected account, so it has to be
  // retrieved from that same account — it doesn't exist on the platform
  // account. The account id travels through success_url's query string.
  const account = event.queryStringParameters?.account
  const requestOptions = account && /^acct_/.test(account) ? { stripeAccount: account } : undefined

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const session = await stripe.checkout.sessions.retrieve(
      sessionId,
      { expand: ['line_items'] },
      requestOptions
    )

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
