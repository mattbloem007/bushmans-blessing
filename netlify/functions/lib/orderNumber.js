const { getStore } = require('@netlify/blobs')

const STORE_NAME = 'orders'
const COUNTER_KEY = 'counter'
const MAX_ATTEMPTS = 5

// Assigns a short, sequential, customer-facing order number (e.g. "BB-0007")
// to a Stripe checkout session the first time it's seen, and returns the
// same number on every later call for that session — so a retried Stripe
// webhook delivery, or the ship-form looking up the same order twice, never
// mints two numbers for one order.
function orderNumberStore() {
  // This site's function runtime doesn't populate NETLIFY_BLOBS_CONTEXT, so
  // getStore()'s zero-config auto-detection throws MissingBlobsEnvironmentError.
  // NETLIFY_FUNCTIONS_TOKEN isn't Blobs-scoped (401s), so this site has its
  // own NETLIFY_BLOBS_TOKEN (a Netlify access token) configured instead.
  if (process.env.SITE_ID && process.env.NETLIFY_BLOBS_TOKEN) {
    return getStore({
      name: STORE_NAME,
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN,
    })
  }
  return getStore(STORE_NAME)
}

async function getOrCreateOrderNumber(sessionId) {
  const store = orderNumberStore()
  const sessionKey = `session:${sessionId}`

  const existing = await store.get(sessionKey)
  if (existing) return existing

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const counterEntry = await store.getWithMetadata(COUNTER_KEY)
    const current = counterEntry ? parseInt(counterEntry.data, 10) || 0 : 0
    const next = current + 1

    const counterWrite = counterEntry
      ? await store.set(COUNTER_KEY, String(next), { onlyIfMatch: counterEntry.etag })
      : await store.set(COUNTER_KEY, String(next), { onlyIfNew: true })

    if (!counterWrite.modified) continue // lost the race to another concurrent order — retry

    const orderNumber = `BB-${String(next).padStart(4, '0')}`
    const claim = await store.set(sessionKey, orderNumber, { onlyIfNew: true })
    if (claim.modified) return orderNumber

    // A concurrent call for this exact session (e.g. a retried webhook
    // delivery) claimed a number first — use theirs. The number we just
    // incremented to goes unused, which just leaves a harmless gap.
    return await store.get(sessionKey)
  }

  throw new Error('Could not allocate an order number after retries')
}

module.exports = { getOrCreateOrderNumber }
