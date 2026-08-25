const Stripe = require('stripe')
const { getOrCreateOrderNumber } = require('./lib/orderNumber')

const ADMIN_SHIP_SECRET = process.env.ADMIN_SHIP_SECRET

// Password-gated lookup used by /admin/ship to auto-fill the shipping-
// notification form from the "Ship this order" link in the internal order
// email, instead of the packer retyping the customer's email/name/reference.
exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!ADMIN_SHIP_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Order lookup is not configured yet.' }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  const { password, sessionId } = body

  if (password !== ADMIN_SHIP_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Incorrect password' }) }
  }

  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing sessionId' }) }
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })
    const orderNumber = await getOrCreateOrderNumber(session.id)
    const address = session.shipping_details?.address || session.customer_details?.address || null

    return {
      statusCode: 200,
      body: JSON.stringify({
        orderNumber,
        customerEmail: session.customer_details?.email || '',
        customerName: session.customer_details?.name || session.shipping_details?.name || '',
        shippingAddress: address
          ? [
              address.line1,
              address.line2,
              `${address.postal_code || ''} ${address.city || ''}`.trim(),
              address.country,
            ]
              .filter(Boolean)
              .join(', ')
          : null,
        lineItems: (session.line_items?.data || []).map(li => ({
          description: li.description,
          quantity: li.quantity,
        })),
      }),
    }
  } catch (err) {
    console.error('get-order-for-shipping error:', err)
    return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) }
  }
}
