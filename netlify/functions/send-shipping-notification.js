const RESEND_API_KEY = process.env.RESEND_API_KEY
const ORDER_EMAIL_FROM = process.env.ORDER_EMAIL_FROM || 'onboarding@resend.dev'
const ADMIN_SHIP_SECRET = process.env.ADMIN_SHIP_SECRET

function renderShippingEmailHtml({ customerName, orderReference, carrier, trackingNumber, trackingUrl }) {
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2b2620;">
      <h1 style="font-size:20px;">Your order is on its way!</h1>
      <p>Hi${customerName ? ` ${customerName}` : ''}, your Bushman's Blessing order has been dispatched.</p>
      ${orderReference ? `<p><strong>Order reference:</strong> ${orderReference}</p>` : ''}
      ${carrier ? `<p><strong>Carrier:</strong> ${carrier}</p>` : ''}
      ${trackingNumber ? `<p><strong>Tracking number:</strong> ${trackingNumber}</p>` : ''}
      ${trackingUrl ? `<p><a href="${trackingUrl}" style="color:#fe5101;">Track your package</a></p>` : ''}
      <p>Questions about your delivery? Just reply to this email.</p>
    </div>
  `
}

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!RESEND_API_KEY || !ADMIN_SHIP_SECRET) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Shipping notifications are not configured yet.' }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  const { password, customerEmail, customerName, orderReference, carrier, trackingNumber, trackingUrl } = body

  if (password !== ADMIN_SHIP_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Incorrect password' }) }
  }

  if (!customerEmail) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Customer email is required' }) }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Bushman's Blessing <${ORDER_EMAIL_FROM}>`,
      to: customerEmail,
      subject: "Your Bushman's Blessing order is on its way",
      html: renderShippingEmailHtml({ customerName, orderReference, carrier, trackingNumber, trackingUrl }),
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Failed to send shipping notification email:', res.status, errText)
    return { statusCode: 502, body: JSON.stringify({ error: 'Could not send email' }) }
  }

  return { statusCode: 200, body: JSON.stringify({ sent: true }) }
}
