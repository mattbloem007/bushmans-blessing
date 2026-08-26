const RESEND_API_KEY = process.env.RESEND_API_KEY
const ORDER_EMAIL_FROM = process.env.ORDER_EMAIL_FROM || 'onboarding@resend.dev'
const ORDER_NOTIFICATION_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL
const SITE_URL = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888'

function formatMoney(amountInCents, currency) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: currency.toUpperCase() }).format(
    amountInCents / 100
  )
}

function renderInternalNotificationHtml(session, lineItems, orderNumber) {
  const currency = session.currency
  const address = session.shipping_details?.address || session.customer_details?.address
  const addressLines = address
    ? [address.line1, address.line2, `${address.postal_code || ''} ${address.city || ''}`.trim(), address.country]
        .filter(Boolean)
        .join(', ')
    : 'No shipping address on file'

  const itemRows = lineItems
    .map(
      li => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #ddd;">${li.description}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:center;">${li.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right;">${formatMoney(li.amount_total, currency)}</td>
        </tr>`
    )
    .join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h1 style="font-size:18px;">New order ${orderNumber} — ${formatMoney(session.amount_total, currency)}</h1>
      <p><strong>Order number:</strong> ${orderNumber}</p>
      <p><strong>Customer:</strong> ${session.customer_details?.name || '(no name)'} — ${session.customer_details?.email || '(no email)'}</p>
      <p><strong>Ship to:</strong> ${addressLines}</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #333;">Item</th>
            <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #333;">Qty</th>
            <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #333;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p><a href="${SITE_URL}/admin/ship?session=${session.id}" style="color:#fe5101;font-weight:bold;">Ship this order →</a></p>
      <p style="color:#777;font-size:12px;">Stripe session: ${session.id} — use the <a href="https://dashboard.stripe.com/payments">Stripe dashboard</a> to look up full payment details.</p>
    </div>
  `
}

async function sendInternalOrderNotification(session, lineItems, orderNumber) {
  if (!RESEND_API_KEY || !ORDER_NOTIFICATION_EMAIL) {
    console.warn('RESEND_API_KEY or ORDER_NOTIFICATION_EMAIL not set — skipping internal order notification')
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Bushman's Blessing Orders <${ORDER_EMAIL_FROM}>`,
      to: ORDER_NOTIFICATION_EMAIL,
      subject: `New order ${orderNumber} — ${session.customer_details?.name || session.customer_details?.email || orderNumber}`,
      html: renderInternalNotificationHtml(session, lineItems, orderNumber),
    }),
  })

  if (!res.ok) {
    console.error('Failed to send internal order notification:', res.status, await res.text())
  }
}

module.exports = { formatMoney, renderInternalNotificationHtml, sendInternalOrderNotification }
