// Gates /wholesale/portal/* at the CDN edge, same declarative-path style as
// geo-retailer-redirect.js. This can't require() netlify/functions/lib/wholesaleAuth.js
// (Deno runtime, not Node), so it carries its own small HMAC-verify using
// Web Crypto — the same kind of intentional duplication already accepted
// for retailer-map.js. Real pricing/catalog data is never served from a
// statically-built page, so this gate is a UX redirect, not the only layer:
// get-wholesale-products.js and create-wholesale-checkout-session.js both
// re-verify the same cookie server-side independently.

const SESSION_COOKIE_NAME = 'bb_wholesale_session'

function base64urlToBytes(input) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function bytesToBase64url(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function verifySessionCookie(token, secret) {
  if (!token || !token.includes('.')) return false
  const [encodedBody, signature] = token.split('.')

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const expectedSigBytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encodedBody)))
  const expectedSignature = bytesToBase64url(expectedSigBytes)
  if (expectedSignature !== signature) return false

  let decoded
  try {
    decoded = JSON.parse(new TextDecoder().decode(base64urlToBytes(encodedBody)))
  } catch {
    return false
  }

  if (decoded.purpose !== 'session') return false
  if (!decoded.exp || Math.floor(Date.now() / 1000) > decoded.exp) return false

  return true
}

function getCookie(request, name) {
  const header = request.headers.get('cookie') || ''
  for (const pair of header.split(';')) {
    const idx = pair.indexOf('=')
    if (idx === -1) continue
    if (pair.slice(0, idx).trim() === name) return pair.slice(idx + 1).trim()
  }
  return null
}

export default async (request, context) => {
  const secret = Deno.env.get('WHOLESALE_AUTH_SECRET')
  const token = getCookie(request, SESSION_COOKIE_NAME)

  const valid = secret && token ? await verifySessionCookie(token, secret) : false

  if (!valid) {
    return Response.redirect(new URL('/wholesale/login', request.url), 302)
  }

  return context.next()
}

export const config = {
  path: '/wholesale/portal/*',
}
