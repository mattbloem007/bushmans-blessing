const { config, listParticipants, markJoinLinkSent } = require('./lib/kannaOnline')
const { sendExperienceJoinLink } = require('./lib/experienceEmails')

const ADMIN_SHIP_SECRET = process.env.ADMIN_SHIP_SECRET

function csvCell(value) {
  const text = value == null ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

// Password-gated tools for the temporary Kanna Online page, used from
// /admin/experience: list everyone who has a place, export the mailing
// list, and send the Jitsi link on the day of the gathering.
exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!ADMIN_SHIP_SECRET) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Admin tools are not configured yet.' }) }
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

  try {
    const participants = await listParticipants()

    if (body.action === 'list') {
      const rows = [
        ['Name', 'Email', 'Option', 'Amount', 'Purchased', 'Join link sent', 'Address'],
        ...participants.map(p => [
          p.name,
          p.email,
          p.optionLabel,
          (p.amountPaid / 100).toFixed(2),
          p.purchasedAt,
          p.joinLinkSentAt || '',
          p.shippingAddress
            ? [p.shippingAddress.line1, p.shippingAddress.line2, p.shippingAddress.postal_code, p.shippingAddress.city, p.shippingAddress.country]
                .filter(Boolean)
                .join(', ')
            : '',
        ]),
      ]

      return {
        statusCode: 200,
        body: JSON.stringify({
          participants,
          counts: {
            total: participants.length,
            experience: participants.filter(p => p.optionId === 'experience').length,
            sample: participants.filter(p => p.optionId === 'experience-sample').length,
            bottle: participants.filter(p => p.optionId === 'experience-bottle').length,
            parcels: participants.filter(p => p.requiresShipping).length,
            linkSent: participants.filter(p => p.joinLinkSentAt).length,
          },
          emailsCsv: rows.map(row => row.map(csvCell).join(',')).join('\n'),
        }),
      }
    }

    if (body.action === 'send-join-link') {
      const joinUrl = String(body.joinUrl || config.event.joinUrl).trim()
      if (!/^https:\/\/[^\s]+$/.test(joinUrl)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Join link must be a valid https URL' }) }
      }

      const message = String(body.message || '').trim()
      const resendAll = body.resendAll === true
      const recipients = participants.filter(p => resendAll || !p.joinLinkSentAt)

      const sent = []
      const failed = []

      for (const participant of recipients) {
        try {
          await sendExperienceJoinLink(participant, { joinUrl, message })
          sent.push(participant.sessionId)
        } catch (err) {
          console.error('Join link failed for', participant.email, err.message)
          failed.push(participant.email || participant.sessionId)
        }
      }

      await markJoinLinkSent(sent)

      return {
        statusCode: 200,
        body: JSON.stringify({
          sent: sent.length,
          skipped: participants.length - recipients.length,
          failed,
        }),
      }
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) }
  } catch (err) {
    console.error('experience-admin error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Something went wrong' }) }
  }
}
