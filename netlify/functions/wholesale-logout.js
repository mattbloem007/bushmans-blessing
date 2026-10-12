const { serializeLogoutCookie } = require('./lib/wholesaleAuth')

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  return {
    statusCode: 200,
    headers: { 'Set-Cookie': serializeLogoutCookie() },
    body: JSON.stringify({ ok: true }),
  }
}
