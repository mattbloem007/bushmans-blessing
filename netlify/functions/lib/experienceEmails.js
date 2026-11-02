const { config, formatEuro } = require('./kannaOnline')

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ORDER_EMAIL_FROM = process.env.ORDER_EMAIL_FROM || 'onboarding@resend.dev'
const NOTIFICATION_EMAIL = process.env.EXPERIENCE_NOTIFICATION_EMAIL || process.env.ORDER_NOTIFICATION_EMAIL
const SITE_URL = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888'

const EVENT = config.event
const WHEN = `${EVENT.dateLabel} · ${EVENT.timeLabel}`

const SIGN_OFF = `
  <p style="margin-top:24px;">With care,<br />Bushman's Blessing</p>
  <p style="color:#8a7f72;font-size:12px;line-height:1.5;margin-top:24px;">
    Kanna is a botanical preparation, not a medicine. It is not intended to diagnose, treat, cure or
    prevent any disease, and nothing in this email is medical advice. If you are pregnant, breastfeeding,
    or taking prescribed medication, please speak to your doctor before trying it.
  </p>
`

async function sendEmail({ to, subject, html, replyTo }) {
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
    body: JSON.stringify({
      from: `Bushman's Blessing <${ORDER_EMAIL_FROM}>`,
      to,
      subject,
      html,
      ...(replyTo && { reply_to: replyTo }),
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`Failed to send email "${subject}":`, res.status, body)
    throw new Error(`Resend API error sending "${subject}" (${res.status})`)
  }
}

function parcelLine(participant) {
  if (!participant.requiresShipping) return ''
  const what = participant.optionId === 'experience-sample' ? 'sample' : 'bottle'
  return `
    <p>Your ${what} ships separately to:</p>
    <p style="color:#4a423a;">${formatAddress(participant.shippingAddress)}</p>
    <p>It should reach you before the evening. If it hasn't arrived by the day before, reply to this
    email and we'll chase it.</p>
  `
}

function formatAddress(address) {
  if (!address) return '(no shipping address on file)'
  return [
    address.line1,
    address.line2,
    `${address.postal_code || ''} ${address.city || ''}`.trim(),
    address.country,
  ]
    .filter(Boolean)
    .join('<br />')
}

// Sent the moment a place is paid for.
async function sendExperienceConfirmation(participant) {
  if (!participant.email) return

  await sendEmail({
    to: participant.email,
    subject: `You're in — ${EVENT.title}, ${EVENT.dateLabel}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2b2620;line-height:1.6;">
        <h1 style="font-size:22px;margin-bottom:4px;">You're in.</h1>
        <p style="color:#8a7f72;margin-top:0;">${participant.optionLabel}</p>
        <p>Hi${participant.name ? ` ${participant.name.split(' ')[0]}` : ''}, your place at
        <strong>${EVENT.title}</strong> is confirmed.</p>

        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr>
            <td style="padding:10px 0;border-top:1px solid #e5e0d8;border-bottom:1px solid #e5e0d8;">
              <strong>When</strong><br />${WHEN}<br />
              <span style="color:#8a7f72;">${EVENT.durationLabel}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #e5e0d8;">
              <strong>Where</strong><br />Online, on ${EVENT.platform}. No account or app needed — the
              link opens in your browser.
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #e5e0d8;">
              <strong>Paid</strong><br />${formatEuro(participant.amountPaid)} — ${participant.optionLabel}
            </td>
          </tr>
        </table>

        ${parcelLine(participant)}

        <p><strong>On the day</strong>, we'll send the join link to this address a few hours before we
        begin. Nothing else is required of you — camera and microphone both optional, and you're welcome
        to simply listen.</p>

        ${SIGN_OFF}
      </div>
    `,
  })
}

// Sent to the business so the parcel can be packed and the mailing list kept.
async function sendExperienceInternalNotification(participant) {
  if (!NOTIFICATION_EMAIL) {
    console.warn('ORDER_NOTIFICATION_EMAIL not set — skipping Kanna Online internal notification')
    return
  }

  const option = config.options.find(o => o.id === participant.optionId)

  await sendEmail({
    to: NOTIFICATION_EMAIL,
    replyTo: participant.email || undefined,
    subject: `Kanna Online signup — ${participant.optionLabel} — ${participant.email}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#2b2620;">
        <h1 style="font-size:18px;">New ${EVENT.title} signup</h1>
        <p><strong>Name:</strong> ${participant.name || '(no name)'}</p>
        <p><strong>Email:</strong> ${participant.email || '(no email)'}</p>
        <p><strong>Option:</strong> ${participant.optionLabel}${option ? ` — ${formatEuro(option.priceInCents)}` : ''}</p>
        <p><strong>Paid:</strong> ${formatEuro(participant.amountPaid)}</p>
        ${
          participant.mantisShareCents > 0
            ? `<p><strong>Mantis Collective share:</strong> ${formatEuro(participant.mantisShareCents)} — sent automatically with the payment.</p>`
            : ''
        }
        ${
          participant.requiresShipping
            ? `<p><strong>Post to:</strong> ${formatAddress(participant.shippingAddress)}</p>
               <p style="color:#a3541f;"><strong>Action:</strong> this one includes a parcel — it needs to
               be posted so it lands before ${EVENT.dateLabel}.</p>`
            : '<p><strong>Post:</strong> nothing to ship — ticket only.</p>'
        }
        <p style="color:#777;font-size:12px;">Stripe session: ${participant.sessionId}<br />
        Purchased: ${participant.purchasedAt}</p>
      </div>
    `,
  })
}

// Sent from /admin/experience on the day of the gathering.
async function sendExperienceJoinLink(participant, { joinUrl, message }) {
  if (!participant.email) return

  await sendEmail({
    to: participant.email,
    subject: `Joining details — ${EVENT.title}, ${EVENT.dateLabel}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2b2620;line-height:1.6;">
        <h1 style="font-size:22px;">Tonight's link</h1>
        <p>${EVENT.title} begins at <strong>${EVENT.timeLabel}</strong> (${EVENT.dateLabel}).</p>

        <p style="margin:24px 0;">
          <a href="${joinUrl}"
             style="background:#fe5101;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:4px;font-family:sans-serif;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;">
            Join the gathering
          </a>
        </p>
        <p style="color:#8a7f72;font-size:13px;word-break:break-all;">${joinUrl}</p>

        ${message ? `<p>${message}</p>` : ''}

        <p><strong>A few practical things.</strong> Come as you are — camera optional, microphone
        optional, no need to prepare anything. Find somewhere quiet if you can, and give yourself five
        minutes before we begin to arrive.</p>

        ${SIGN_OFF}
      </div>
    `,
  })
}

module.exports = {
  sendExperienceConfirmation,
  sendExperienceInternalNotification,
  sendExperienceJoinLink,
}
