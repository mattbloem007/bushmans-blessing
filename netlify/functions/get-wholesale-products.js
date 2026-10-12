const { getSessionEmail } = require('./lib/wholesaleAuth')
const { fetchAllWholesaleProducts } = require('./lib/contentful')

// Gated behind the session cookie as a second layer behind the
// wholesale-portal-gate edge function — pricing is never baked into the
// static Gatsby build (Gatsby's page-data JSON is a public, predictable
// URL regardless of the edge gate), so this is the only place the real
// wholesale catalog is ever served from.
exports.handler = async event => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const email = getSessionEmail(event)
  if (!email) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Not logged in' }) }
  }

  try {
    const products = await fetchAllWholesaleProducts()
    const bankTransferEnabled = process.env.WHOLESALE_BANK_TRANSFER_ENABLED === 'true'
    return { statusCode: 200, body: JSON.stringify({ products, bankTransferEnabled }) }
  } catch (err) {
    console.error('get-wholesale-products error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not load wholesale products' }) }
  }
}
