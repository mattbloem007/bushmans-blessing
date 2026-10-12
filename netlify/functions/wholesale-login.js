const {
  wholesaleStore,
  verifyPassword,
  serializeSessionCookie,
  isLoginThrottled,
  recordFailedLogin,
  clearLoginAttempts,
} = require('./lib/wholesaleAuth')

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let email, password
  try {
    ;({ email, password } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  if (!email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email and password are required' }) }
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    if (await isLoginThrottled(normalizedEmail)) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Too many failed attempts — please try again in 15 minutes' }),
      }
    }

    const store = wholesaleStore('wholesalers')
    const raw = await store.get(normalizedEmail)
    const wholesaler = raw ? JSON.parse(raw) : null

    if (!wholesaler || wholesaler.status !== 'active' || !verifyPassword(password, wholesaler.passwordHash)) {
      await recordFailedLogin(normalizedEmail)
      return { statusCode: 401, body: JSON.stringify({ error: 'Incorrect email or password' }) }
    }

    await clearLoginAttempts(normalizedEmail)

    return {
      statusCode: 200,
      headers: { 'Set-Cookie': serializeSessionCookie(normalizedEmail) },
      body: JSON.stringify({ ok: true, companyName: wholesaler.companyName }),
    }
  } catch (err) {
    console.error('wholesale-login error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not log in' }) }
  }
}
