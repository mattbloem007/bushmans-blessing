#!/usr/bin/env node
/**
 * Updates the three wholesale SKU prices to new VAT-inclusive amounts.
 * Stripe Prices are immutable, so this creates a new Price on each SKU's
 * existing Stripe Product, archives the old Price, and repoints the
 * Contentful "wholesaleProduct" entry's stripePriceId + unitPriceInCents.
 * Safe to re-run — skips any SKU already at the target amount.
 *
 * Run once per Stripe mode (test and live use separate Price ids):
 *   node scripts/update-wholesale-prices.js                        # test mode (STRIPE_SECRET_KEY)
 *   STRIPE_SECRET_KEY_LIVE=sk_live_... node scripts/update-wholesale-prices.js --live
 */

require('dotenv').config({ path: '.env.development' })
const Stripe = require('stripe')
const { createClient } = require('contentful-management')

const isLive = process.argv.includes('--live')
const STRIPE_SECRET_KEY = isLive ? process.env.STRIPE_SECRET_KEY_LIVE : process.env.STRIPE_SECRET_KEY
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID
const MGMT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'

if (!STRIPE_SECRET_KEY || !SPACE_ID || !MGMT_TOKEN) {
  console.error(
    `ERROR: ${isLive ? 'STRIPE_SECRET_KEY_LIVE' : 'STRIPE_SECRET_KEY'}, CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set`
  )
  process.exit(1)
}
if (isLive && !STRIPE_SECRET_KEY.startsWith('sk_live_')) {
  console.error('ERROR: --live requires STRIPE_SECRET_KEY_LIVE to be a live-mode key (sk_live_...)')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY)
const cma = createClient({ accessToken: MGMT_TOKEN })
const ctx = { spaceId: SPACE_ID, environmentId: ENVIRONMENT }

// New ex-VAT amounts with 21% VAT added, rounded to the nearest cent:
//   500ml  €1750 ex VAT -> €2117.50 incl VAT
//   1L     €3250 ex VAT -> €3932.50 incl VAT
//   5ml    €20   ex VAT -> €24.20   incl VAT
const SKUS = [
  { entryId: 'kanna-bulk-500ml', unitPriceInCents: 211750 },
  { entryId: 'kanna-bulk-1l', unitPriceInCents: 393250 },
  { entryId: 'kanna-5ml-labelled-case', unitPriceInCents: 2420 },
]

async function run() {
  console.log(`Running against Stripe in ${isLive ? 'LIVE' : 'TEST'} mode.\n`)

  for (const sku of SKUS) {
    const entry = await cma.entry.get({ ...ctx, entryId: sku.entryId })
    const currentPriceId = entry.fields.stripePriceId?.['en-US']
    if (!currentPriceId) {
      console.log(`  ⚠  "${sku.entryId}" has no stripePriceId — skipping`)
      continue
    }

    const currentPrice = await stripe.prices.retrieve(currentPriceId)
    if (currentPrice.unit_amount === sku.unitPriceInCents) {
      console.log(`  ⚠  "${sku.entryId}" already at €${(sku.unitPriceInCents / 100).toFixed(2)} — skipping`)
      continue
    }

    const newPrice = await stripe.prices.create({
      product: currentPrice.product,
      unit_amount: sku.unitPriceInCents,
      currency: 'eur',
    })
    await stripe.prices.update(currentPrice.id, { active: false })
    console.log(
      `  ✓  "${sku.entryId}": ${currentPrice.id} (€${(currentPrice.unit_amount / 100).toFixed(2)}) -> ${newPrice.id} (€${(sku.unitPriceInCents / 100).toFixed(2)})`
    )

    entry.fields.unitPriceInCents = { 'en-US': sku.unitPriceInCents }
    entry.fields.stripePriceId = { 'en-US': newPrice.id }
    const updated = await cma.entry.update({ ...ctx, entryId: sku.entryId }, entry)
    await cma.entry.publish({ ...ctx, entryId: sku.entryId }, updated)
    console.log(`  ✓  Updated + published Contentful entry: ${sku.entryId}`)
  }
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
