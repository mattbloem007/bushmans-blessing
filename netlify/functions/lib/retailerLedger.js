const { getStore } = require('@netlify/blobs')

const STORE_NAME = 'retailer-ledger'
const MAX_ATTEMPTS = 10

// Keyed by Stripe Connect account id rather than the Contentful retailer
// slug — both the checkout function and the Connect webhook already have
// the account id in hand (checkout resolves it from the retailer entry;
// the webhook gets it from the event itself), so no extra Contentful
// lookup is needed on the hot path.
function ledgerStore() {
  // Same explicit-credentials workaround as lib/orderNumber.js — this
  // site's function runtime doesn't populate NETLIFY_BLOBS_CONTEXT.
  if (process.env.SITE_ID && process.env.NETLIFY_BLOBS_TOKEN) {
    return getStore({
      name: STORE_NAME,
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN,
    })
  }
  return getStore(STORE_NAME)
}

async function getPaidCents(stripeAccountId) {
  const store = ledgerStore()
  const value = await store.get(`paid:${stripeAccountId}`)
  return value ? parseInt(value, 10) || 0 : 0
}

// Adds amountCents to a retailer's running total toward their licensing
// fee, retrying on concurrent-write conflicts (e.g. two sales completing
// close together) the same way lib/orderNumber.js's counter does. Returns
// the new total.
async function addPaidCents(stripeAccountId, amountCents) {
  if (!(amountCents > 0)) return getPaidCents(stripeAccountId)

  const store = ledgerStore()
  const key = `paid:${stripeAccountId}`

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const entry = await store.getWithMetadata(key)
    const current = entry ? parseInt(entry.data, 10) || 0 : 0
    const next = current + amountCents

    const write = entry
      ? await store.set(key, String(next), { onlyIfMatch: entry.etag })
      : await store.set(key, String(next), { onlyIfNew: true })

    if (write.modified) return next
    // Lost the race to another concurrent sale on the same retailer — back
    // off with jitter before retrying, so competing writers don't just
    // collide again on the next attempt in lockstep.
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50))
  }

  throw new Error(`Could not update retailer ledger for "${stripeAccountId}" after retries`)
}

module.exports = { getPaidCents, addPaidCents }
