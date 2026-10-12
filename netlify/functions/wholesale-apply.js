const crypto = require('crypto')
const { wholesaleStore, signToken } = require('./lib/wholesaleAuth')
const { sendApplicationNotification } = require('./lib/wholesaleEmails')

const REQUIRED_FIELDS = ['companyName', 'contactName', 'email', 'country', 'intendedUse']

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: `Missing required field: ${field}` }) }
    }
  }

  const email = body.email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email address' }) }
  }

  const application = {
    id: crypto.randomUUID(),
    companyName: body.companyName.trim(),
    contactName: body.contactName.trim(),
    email,
    country: body.country.trim(),
    vatOrRegNumber: (body.vatOrRegNumber || '').trim(),
    intendedUse: body.intendedUse.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  try {
    const store = wholesaleStore('wholesale-applications')
    await store.set(application.id, JSON.stringify(application), { onlyIfNew: true })

    const approveToken = signToken('approve', { applicationId: application.id }, 14 * 24 * 60 * 60)
    await sendApplicationNotification(application, approveToken)

    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('wholesale-apply error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not submit application' }) }
  }
}
