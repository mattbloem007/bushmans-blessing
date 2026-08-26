const Stripe = require('stripe')
const { getOrCreateOrderNumber } = require('./lib/orderNumber')
const { sendInternalOrderNotification } = require('./lib/orderEmails')

const ADMIN_SHIP_SECRET = process.env.ADMIN_SHIP_SECRET
const DEFAULT_COUNT = 3
const MAX_COUNT = 10

// Re-sends the internal "new order" notification for the most recent
// completed Stripe checkouts, with the current template (order number,
// "Ship this order" link) — lets the packer see/test the new flow without
// waiting for a real order. Only ever touches the internal notification;
// never re-sends the customer-facing confirmation email.
exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!ADMIN_SHIP_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Resend is not configured yet.' }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  if (body.password !== ADMIN_SHIP_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Incorrect password' }) }
  }

  const count = Math.min(MAX_COUNT, Math.max(1, parseInt(body.count, 10) || DEFAULT_COUNT))
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const list = await stripe.checkout.sessions.list({ limit: count, status: 'complete' })
    const results = []

    // Sequential, not Promise.all — this is a low-volume admin action, and
    // keeping it serial avoids bursting the Resend API and unnecessary
    // Blobs write retries on the order-number counter.
    for (const summary of list.data) {
      const session = await stripe.checkout.sessions.retrieve(summary.id, { expand: ['line_items'] })
      const lineItems = session.line_items?.data || []
      const orderNumber = await getOrCreateOrderNumber(session.id)
      await sendInternalOrderNotification(session, lineItems, orderNumber)
      results.push({
        sessionId: session.id,
        orderNumber,
        customerEmail: session.customer_details?.email || null,
      })
    }

    return { statusCode: 200, body: JSON.stringify({ resent: results }) }
  } catch (err) {
    console.error('resend-order-notifications error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not resend order notifications' }) }
  }
}
