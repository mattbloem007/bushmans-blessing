const crypto = require('crypto')
const { getStore } = require('@netlify/blobs')

const AUTH_SECRET = process.env.WHOLESALE_AUTH_SECRET

const SESSION_COOKIE_NAME = 'bb_wholesale_session'
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60
const MAX_LOGIN_ATTEMPTS = 8
const LOGIN_ATTEMPT_WINDOW_SECONDS = 15 * 60

function base64url(input) {
  return Buffer.from(input).toString('base64url')
}

// Same explicit-credentials workaround as lib/orderNumber.js and
// lib/retailerLedger.js — this site's function runtime doesn't populate
// NETLIFY_BLOBS_CONTEXT.
function wholesaleStore(name) {
  if (process.env.SITE_ID && process.env.NETLIFY_BLOBS_TOKEN) {
    return getStore({
      name,
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN,
    })
  }
  return getStore(name)
}

// ── Password hashing (Node's built-in scrypt — no new dependency) ─────────

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return `${salt}:${derivedKey.toString('hex')}`
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hashHex] = stored.split(':')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  const storedKey = Buffer.from(hashHex, 'hex')
  if (derivedKey.length !== storedKey.length) return false
  return crypto.timingSafeEqual(derivedKey, storedKey)
}

// ── Signed, purpose-tagged tokens ──────────────────────────────────────────
// One secret signs every kind of token (approval links, signup links,
// session cookies); the purpose tag is part of the signed payload so a
// token minted for one purpose can never be replayed as another.

function signToken(purpose, payload, ttlSeconds) {
  if (!AUTH_SECRET) throw new Error('WHOLESALE_AUTH_SECRET is not configured')
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const body = JSON.stringify({ purpose, payload, exp })
  const encodedBody = base64url(body)
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(encodedBody).digest('base64url')
  return `${encodedBody}.${signature}`
}

function verifyToken(purpose, token) {
  if (!AUTH_SECRET || !token || typeof token !== 'string' || !token.includes('.')) return null
  const [encodedBody, signature] = token.split('.')
  const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(encodedBody).digest('base64url')

  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expectedSignature)
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null

  let decoded
  try {
    decoded = JSON.parse(Buffer.from(encodedBody, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  if (decoded.purpose !== purpose) return null
  if (!decoded.exp || Math.floor(Date.now() / 1000) > decoded.exp) return null

  return decoded.payload
}

// ── Session cookie ─────────────────────────────────────────────────────────

function serializeSessionCookie(email) {
  const token = signToken('session', { email }, SESSION_TTL_SECONDS)
  const secureAttr = process.env.CONTEXT === 'production' || process.env.NODE_ENV === 'production' ? ' Secure;' : ''
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly;${secureAttr} SameSite=Lax; Path=/wholesale; Max-Age=${SESSION_TTL_SECONDS}`
}

function serializeLogoutCookie() {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/wholesale; Max-Age=0`
}

function parseCookies(cookieHeader) {
  const out = {}
  if (!cookieHeader) return out
  for (const pair of cookieHeader.split(';')) {
    const idx = pair.indexOf('=')
    if (idx === -1) continue
    out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim()
  }
  return out
}

// Returns the logged-in wholesaler's email, or null — used by every
// function that must re-verify the session server-side rather than trust
// the edge-function gate alone.
function getSessionEmail(event) {
  const cookies = parseCookies(event.headers?.cookie || event.headers?.Cookie)
  const token = cookies[SESSION_COOKIE_NAME]
  if (!token) return null
  const payload = verifyToken('session', token)
  return payload?.email || null
}

// ── Login attempt throttle ─────────────────────────────────────────────────
// Same retry/etag style as lib/retailerLedger.js's counter, applied to a
// per-email failure count so a single login endpoint can't be trivially
// brute-forced — there's no other rate-limiting in this codebase.

async function recordFailedLogin(email) {
  const store = wholesaleStore('wholesalers')
  const key = `attempts:${email.toLowerCase()}`
  const now = Math.floor(Date.now() / 1000)

  for (let attempt = 0; attempt < 5; attempt++) {
    const entry = await store.getWithMetadata(key)
    const current = entry ? JSON.parse(entry.data) : { count: 0, windowStart: now }
    const withinWindow = now - current.windowStart < LOGIN_ATTEMPT_WINDOW_SECONDS
    const next = withinWindow ? { count: current.count + 1, windowStart: current.windowStart } : { count: 1, windowStart: now }

    const write = entry
      ? await store.set(key, JSON.stringify(next), { onlyIfMatch: entry.etag })
      : await store.set(key, JSON.stringify(next), { onlyIfNew: true })

    if (write.modified) return
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50))
  }
}

async function isLoginThrottled(email) {
  const store = wholesaleStore('wholesalers')
  const entry = await store.get(`attempts:${email.toLowerCase()}`)
  if (!entry) return false
  const { count, windowStart } = JSON.parse(entry)
  const now = Math.floor(Date.now() / 1000)
  if (now - windowStart >= LOGIN_ATTEMPT_WINDOW_SECONDS) return false
  return count >= MAX_LOGIN_ATTEMPTS
}

async function clearLoginAttempts(email) {
  const store = wholesaleStore('wholesalers')
  await store.delete(`attempts:${email.toLowerCase()}`)
}

module.exports = {
  wholesaleStore,
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  serializeSessionCookie,
  serializeLogoutCookie,
  getSessionEmail,
  recordFailedLogin,
  isLoginThrottled,
  clearLoginAttempts,
}
