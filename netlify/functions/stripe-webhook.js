const Stripe = require('stripe')

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ORDER_EMAIL_FROM = process.env.ORDER_EMAIL_FROM || 'onboarding@resend.dev'

function formatMoney(amountInCents, currency) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: currency.toUpperCase() }).format(
    amountInCents / 100
  )
}

function renderOrderEmailHtml(session, lineItems) {
  const currency = session.currency
  const address = session.shipping_details?.address || session.customer_details?.address
  const addressLines = address
    ? [address.line1, address.line2, `${address.postal_code || ''} ${address.city || ''}`.trim(), address.country]
        .filter(Boolean)
        .map(line => `<div>${line}</div>`)
        .join('')
    : ''

  const itemRows = lineItems
    .map(
      li => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e0d8;">${li.description}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e0d8;text-align:center;">${li.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e0d8;text-align:right;">${formatMoney(li.amount_total, currency)}</td>
        </tr>`
    )
    .join('')

  const shippingRow = session.shipping_cost
    ? `<tr><td colspan="2" style="padding:8px 0;text-align:right;">Shipping</td><td style="padding:8px 0;text-align:right;">${formatMoney(session.shipping_cost.amount_total, currency)}</td></tr>`
    : ''

  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2b2620;">
      <h1 style="font-size:20px;">Thank you for your order</h1>
      <p>Hi${session.customer_details?.name ? ` ${session.customer_details.name}` : ''}, your order from Bushman's Blessing is confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;border-bottom:2px solid #2b2620;">Item</th>
            <th style="text-align:center;padding:8px 0;border-bottom:2px solid #2b2620;">Qty</th>
            <th style="text-align:right;padding:8px 0;border-bottom:2px solid #2b2620;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          ${shippingRow}
          <tr>
            <td colspan="2" style="padding:8px 0;text-align:right;font-weight:bold;">Total</td>
            <td style="padding:8px 0;text-align:right;font-weight:bold;">${formatMoney(session.amount_total, currency)}</td>
          </tr>
        </tbody>
      </table>
      ${address ? `<p><strong>Shipping to:</strong><br/>${addressLines}</p>` : ''}
      <p>Order reference: ${session.id}</p>
      <p>Questions about your order? Just reply to this email.</p>
    </div>
  `
}

async function sendOrderConfirmationEmail(session, lineItems) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping order confirmation email')
    return
  }
  const to = session.customer_details?.email
  if (!to) return

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Bushman's Blessing <${ORDER_EMAIL_FROM}>`,
      to,
      subject: "Your Bushman's Blessing order confirmation",
      html: renderOrderEmailHtml(session, lineItems),
    }),
  })

  if (!res.ok) {
    console.error('Failed to send order confirmation email:', res.status, await res.text())
  }
}

// Verifies and acknowledges Stripe events so Stripe doesn't retry, and
// sends the customer their order confirmation email on completed checkouts.
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
    const sessionId = stripeEvent.data.object.id
    try {
      // Webhook payloads don't include line_items, so it's re-fetched here.
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items'],
      })
      console.log('checkout.session.completed', {
        id: session.id,
        amountTotal: session.amount_total,
        customerEmail: session.customer_details?.email,
      })
      await sendOrderConfirmationEmail(session, session.line_items?.data || [])
    } catch (err) {
      console.error('Failed to process checkout.session.completed:', err.message)
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
