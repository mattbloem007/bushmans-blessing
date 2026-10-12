#!/usr/bin/env node
/**
 * Creates LIVE-mode Stripe Products + Prices for the three wholesale SKUs
 * (scripts/seed-wholesale-products.js only created test-mode ones — test
 * and live are separate namespaces, so there is no live Product to attach
 * a new Price to yet, unlike scripts/update-kanna-price-44.js), then
 * repoints the existing Contentful "wholesaleProduct" entries at the new
 * live Price ids. Does not touch the test-mode objects.
 *
 *   STRIPE_SECRET_KEY_LIVE=sk_live_... node scripts/promote-wholesale-products-to-live.js
 */

require('dotenv').config({ path: '.env.development' })
const Stripe = require('stripe')
const { createClient } = require('contentful-management')

const LIVE_KEY = process.env.STRIPE_SECRET_KEY_LIVE
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID
const MGMT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'

if (!LIVE_KEY || !SPACE_ID || !MGMT_TOKEN) {
  console.error('ERROR: STRIPE_SECRET_KEY_LIVE, CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set')
  process.exit(1)
}
if (!LIVE_KEY.startsWith('sk_live_')) {
  console.error('ERROR: STRIPE_SECRET_KEY_LIVE must be a live-mode key (sk_live_...)')
  process.exit(1)
}

const stripe = new Stripe(LIVE_KEY)
const cma = createClient({ accessToken: MGMT_TOKEN })
const ctx = { spaceId: SPACE_ID, environmentId: ENVIRONMENT }

// Same three SKUs as scripts/seed-wholesale-products.js — kept in sync by
// hand since this only ever runs once per SKU.
const SKUS = [
  { entryId: 'kanna-bulk-500ml', name: 'Kanna Bulk — 500ml', unitPriceInCents: 211750 },
  { entryId: 'kanna-bulk-1l', name: 'Kanna Bulk — 1L', unitPriceInCents: 393250 },
  { entryId: 'kanna-5ml-labelled-case', name: 'Kanna Tincture 5ml — Labelled', unitPriceInCents: 2420 },
]

async function isLivePrice(priceId) {
  try {
    await stripe.prices.retrieve(priceId)
    return true
  } catch {
    return false
  }
}

async function run() {
  console.log('Running against Stripe in LIVE mode.\n')

  for (const sku of SKUS) {
    const entry = await cma.entry.get({ ...ctx, entryId: sku.entryId })
    const currentPriceId = entry.fields.stripePriceId?.['en-US']

    if (currentPriceId?.startsWith('price_') && (await isLivePrice(currentPriceId))) {
      console.log(`  ⚠  "${sku.entryId}" already points at a live price (${currentPriceId}) — skipping`)
      continue
    }

    const product = await stripe.products.create({
      name: sku.name,
      metadata: { contentfulSlug: sku.entryId },
    })
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: sku.unitPriceInCents,
      currency: 'eur',
    })
    console.log(`  ✓  Created LIVE Stripe price for "${sku.name}": ${price.id} (€${(sku.unitPriceInCents / 100).toFixed(2)})`)

    entry.fields.stripePriceId = { 'en-US': price.id }
    const updated = await cma.entry.update({ ...ctx, entryId: sku.entryId }, entry)
    await cma.entry.publish({ ...ctx, entryId: sku.entryId }, updated)
    console.log(`  ✓  Repointed + published Contentful entry: ${sku.entryId}`)
  }
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
