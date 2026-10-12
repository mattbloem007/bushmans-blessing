const { formatMoney } = require('./orderEmails')

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ORDER_EMAIL_FROM = process.env.ORDER_EMAIL_FROM || 'onboarding@resend.dev'
const WHOLESALE_NOTIFICATION_EMAIL = process.env.WHOLESALE_NOTIFICATION_EMAIL || process.env.ORDER_NOTIFICATION_EMAIL
const SITE_URL = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888'

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.warn(`RESEND_API_KEY not set — skipping email "${subject}" to ${to}`)
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: `Bushman's Blessing <${ORDER_EMAIL_FROM}>`, to, subject, html }),
  })
  if (!res.ok) {
    console.error(`Failed to send email "${subject}":`, res.status, await res.text())
  }
}

// Sent to the business when a new wholesale application comes in — includes
// a one-click, signed approval link so no Contentful editing is required.
async function sendApplicationNotification(application, approveToken) {
  if (!WHOLESALE_NOTIFICATION_EMAIL) {
    console.warn('WHOLESALE_NOTIFICATION_EMAIL/ORDER_NOTIFICATION_EMAIL not set — skipping application notification')
    return
  }
  const approveUrl = `${SITE_URL}/.netlify/functions/wholesale-approve?token=${encodeURIComponent(approveToken)}`

  await sendEmail({
    to: WHOLESALE_NOTIFICATION_EMAIL,
    subject: `New wholesale application — ${application.companyName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="font-size:18px;">New wholesale application</h1>
        <p><strong>Company:</strong> ${application.companyName}</p>
        <p><strong>Contact:</strong> ${application.contactName} — ${application.email}</p>
        <p><strong>Country:</strong> ${application.country}</p>
        <p><strong>VAT / registration number:</strong> ${application.vatOrRegNumber || '(not provided)'}</p>
        <p><strong>Intended use:</strong></p>
        <p style="white-space:pre-wrap;background:#f5f2ec;padding:12px;border-radius:4px;">${application.intendedUse}</p>
        <p style="margin-top:24px;">
          <a href="${approveUrl}" style="background:#fe5101;color:#fff;padding:12px 20px;border-radius:4px;text-decoration:none;font-weight:bold;">
            Approve this wholesaler →
          </a>
        </p>
        <p style="color:#777;font-size:12px;">If you don't want to approve them, just ignore this email — nothing happens until the link above is clicked.</p>
      </div>
    `,
  })
}

// Sent to the wholesaler once approved — a one-time link to set their own
// password. No password is ever emailed.
async function sendSignupInvite(email, companyName, signupToken) {
  const signupUrl = `${SITE_URL}/wholesale/signup?token=${encodeURIComponent(signupToken)}`

  await sendEmail({
    to: email,
    subject: "You're approved — set up your Bushman's Blessing wholesale account",
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2b2620;">
        <h1 style="font-size:20px;">Welcome, ${companyName}.</h1>
        <p>Your wholesale application has been approved. Set a password to access the wholesale portal and place orders.</p>
        <p style="margin-top:24px;">
          <a href="${signupUrl}" style="background:#fe5101;color:#fff;padding:12px 20px;border-radius:4px;text-decoration:none;font-weight:bold;">
            Set up your account →
          </a>
        </p>
        <p style="color:#777;font-size:12px;">This link expires in 7 days.</p>
      </div>
    `,
  })
}

function itemRows(lineItems, currency) {
  return lineItems
    .map(
      li => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #ddd;">${li.description}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:center;">${li.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right;">${formatMoney(li.amount_total, currency)}</td>
        </tr>`
    )
    .join('')
}

// Sent to the wholesaler once their order's payment has actually settled
// (immediately for card, or later via the async_payment_succeeded webhook
// event for bank transfer).
async function sendWholesaleOrderConfirmation(session, lineItems, orderNumber) {
  const to = session.customer_details?.email || session.metadata?.wholesalerEmail
  if (!to) return
  const companyName = session.metadata?.companyName || ''

  await sendEmail({
    to,
    subject: `Your Bushman's Blessing wholesale order ${orderNumber} is confirmed`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2b2620;">
        <h1 style="font-size:20px;">Thank you${companyName ? `, ${companyName}` : ''}.</h1>
        <p>Your wholesale order is confirmed and we'll begin preparing it.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px 0;border-bottom:2px solid #2b2620;">Item</th>
              <th style="text-align:center;padding:8px 0;border-bottom:2px solid #2b2620;">Qty</th>
              <th style="text-align:right;padding:8px 0;border-bottom:2px solid #2b2620;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows(lineItems, session.currency)}
            <tr>
              <td colspan="2" style="padding:8px 0;text-align:right;font-weight:bold;">Total</td>
              <td style="padding:8px 0;text-align:right;font-weight:bold;">${formatMoney(session.amount_total, session.currency)}</td>
            </tr>
          </tbody>
        </table>
        <p>Order reference: ${orderNumber}</p>
        ${
          session.metadata?.packagingAcknowledged === 'true'
            ? '<p>As a reminder — we\'d love a mention of Bushman\'s Blessing on your packaging. Thank you for being part of the same story.</p>'
            : ''
        }
        <p>Questions about your order? Just reply to this email.</p>
      </div>
    `,
  })
}

async function sendWholesaleInternalNotification(session, lineItems, orderNumber) {
  if (!WHOLESALE_NOTIFICATION_EMAIL) return
  const paid = session.payment_status === 'paid'

  await sendEmail({
    to: WHOLESALE_NOTIFICATION_EMAIL,
    subject: `New wholesale order ${orderNumber} — ${formatMoney(session.amount_total, session.currency)}${paid ? '' : ' (bank transfer pending)'}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="font-size:18px;">Wholesale order ${orderNumber} — ${formatMoney(session.amount_total, session.currency)}</h1>
        <p><strong>Company:</strong> ${session.metadata?.companyName || '(unknown)'}</p>
        <p><strong>Contact:</strong> ${session.customer_details?.name || ''} — ${session.customer_details?.email || session.metadata?.wholesalerEmail || ''}</p>
        <p><strong>Payment status:</strong> ${paid ? 'Paid' : 'Awaiting bank transfer'}</p>
        <p><strong>Packaging branding acknowledged:</strong> ${session.metadata?.packagingAcknowledged === 'true' ? 'Yes' : 'N/A'}</p>
        <table style="width:100%;border-collapse:collapse;margin:12px 0;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #333;">Item</th>
              <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #333;">Qty</th>
              <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #333;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows(lineItems, session.currency)}</tbody>
        </table>
        <p style="color:#777;font-size:12px;">Stripe session: ${session.id}</p>
      </div>
    `,
  })
}

module.exports = {
  sendApplicationNotification,
  sendSignupInvite,
  sendWholesaleOrderConfirmation,
  sendWholesaleInternalNotification,
}
