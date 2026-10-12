const { wholesaleStore, signToken, verifyToken } = require('./lib/wholesaleAuth')
const { sendSignupInvite } = require('./lib/wholesaleEmails')
const { fetchAllWholesaleProducts } = require('./lib/contentful')

function htmlResponse(statusCode, message) {
  return {
    statusCode,
    headers: { 'Content-Type': 'text/html' },
    body: `<!doctype html><html><body style="font-family:sans-serif;max-width:480px;margin:80px auto;text-align:center;">${message}</body></html>`,
  }
}

// Clicked from the "new wholesale application" email — a one-click
// approval, no Contentful editing or admin login required. Idempotent: a
// second click on an already-approved application is a harmless no-op.
exports.handler = async event => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const token = event.queryStringParameters?.token
  const payload = verifyToken('approve', token)
  if (!payload?.applicationId) {
    return htmlResponse(400, '<h1>Link expired or invalid</h1><p>This approval link is no longer valid.</p>')
  }

  try {
    const store = wholesaleStore('wholesale-applications')
    const raw = await store.get(payload.applicationId)
    if (!raw) {
      return htmlResponse(404, '<h1>Application not found</h1>')
    }

    const application = JSON.parse(raw)

    if (application.status !== 'approved') {
      application.status = 'approved'
      application.approvedAt = new Date().toISOString()
      await store.set(payload.applicationId, JSON.stringify(application))
    }

    // Tracked separately from `status` so that if the invite email failed
    // to send (e.g. a Resend error), re-clicking this same approval link
    // retries just the send instead of being a permanent no-op.
    if (!application.inviteSentAt) {
      const signupToken = signToken(
        'signup',
        { applicationId: application.id, email: application.email, companyName: application.companyName },
        7 * 24 * 60 * 60
      )
      const products = await fetchAllWholesaleProducts()
      await sendSignupInvite(application.email, application.companyName, signupToken, products)
      application.inviteSentAt = new Date().toISOString()
      await store.set(payload.applicationId, JSON.stringify(application))
    }

    return htmlResponse(
      200,
      `<h1>Approved</h1><p><strong>${application.companyName}</strong> has been approved and emailed a link to set up their account.</p>`
    )
  } catch (err) {
    console.error('wholesale-approve error:', err)
    return htmlResponse(500, '<h1>Something went wrong</h1>')
  }
}
