const { wholesaleStore, verifyToken, hashPassword } = require('./lib/wholesaleAuth')

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let token, password
  try {
    ;({ token, password } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Password must be at least 8 characters' }) }
  }

  const payload = verifyToken('signup', token)
  if (!payload?.email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'This signup link has expired or is invalid' }) }
  }

  try {
    const store = wholesaleStore('wholesalers')
    const key = payload.email.toLowerCase()

    const existing = await store.get(key)
    if (existing) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'This account is already set up — please log in instead' }),
      }
    }

    const wholesaler = {
      email: key,
      companyName: payload.companyName,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      status: 'active',
    }
    await store.set(key, JSON.stringify(wholesaler), { onlyIfNew: true })

    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('wholesale-complete-signup error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not complete signup' }) }
  }
}
