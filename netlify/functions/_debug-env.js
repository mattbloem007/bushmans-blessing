// Temporary — diagnosing why @netlify/blobs' automatic siteID/token
// injection isn't reaching this site's functions. Returns only env var
// NAMES (never values) so it's safe to leave password-gated. Delete once
// the Blobs config issue is resolved.
const ADMIN_SHIP_SECRET = process.env.ADMIN_SHIP_SECRET

exports.handler = async event => {
  const password = event.queryStringParameters?.password
  if (password !== ADMIN_SHIP_SECRET) {
    return { statusCode: 401, body: 'unauthorized' }
  }
  const keys = Object.keys(process.env)
    .filter(k => /netlify|site|blob|deploy|context|url/i.test(k))
    .sort()
  return { statusCode: 200, body: JSON.stringify(keys, null, 2) }
}
