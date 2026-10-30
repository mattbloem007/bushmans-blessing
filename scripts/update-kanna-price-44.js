#!/usr/bin/env node
/**
 * Updates the Kanna Tincture price to €44.00.
 *
 * Stripe Prices are immutable, so this creates a new Price object,
 * archives the old one, and repoints the Contentful entry at the new price.
 *
 *   node scripts/update-kanna-price-44.js
 */

require('dotenv').config({ path: '.env.development' })
const Stripe = require('stripe')
const { createClient } = require('contentful-management')

const NEW_PRICE_EUR_CENTS = 4400 // €44.00

const LIVE_KEY = process.env.STRIPE_SECRET_KEY_LIVE
const STRIPE_SECRET_KEY = LIVE_KEY || process.env.STRIPE_SECRET_KEY
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID
const MGMT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'

if (!STRIPE_SECRET_KEY || !SPACE_ID || !MGMT_TOKEN) {
  console.error('ERROR: STRIPE_SECRET_KEY (or STRIPE_SECRET_KEY_LIVE), CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set')
  process.exit(1)
}

if (LIVE_KEY) {
  if (!LIVE_KEY.startsWith('sk_live_')) {
    console.error('ERROR: STRIPE_SECRET_KEY_LIVE must be a live-mode key (sk_live_...)')
    process.exit(1)
  }
  console.log('  !!  Running against LIVE Stripe mode !!')
} else if (!STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.error('ERROR: refusing to run against a non-test-mode Stripe secret key')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY)
const cma = createClient({ accessToken: MGMT_TOKEN })
const ctx = { spaceId: SPACE_ID, environmentId: ENVIRONMENT }

async function run() {
  const entry = await cma.entry.get({ ...ctx, entryId: 'kanna-tincture' })
  const oldPriceId = entry.fields.stripePriceId?.['en-US']
  const oldPriceCents = entry.fields.priceInCents?.['en-US']
  console.log(`  Current price: ${oldPriceId} (€${(oldPriceCents / 100).toFixed(2)})`)

  const oldPrice = await stripe.prices.retrieve(oldPriceId)

  const newPrice = await stripe.prices.create({
    product: oldPrice.product,
    unit_amount: NEW_PRICE_EUR_CENTS,
    currency: 'eur',
  })
  console.log(`  ✓  Created new Stripe price: ${newPrice.id} (€${(NEW_PRICE_EUR_CENTS / 100).toFixed(2)})`)

  await stripe.prices.update(oldPriceId, { active: false })
  console.log(`  ✓  Archived old Stripe price: ${oldPriceId}`)

  entry.fields.stripePriceId = { 'en-US': newPrice.id }
  entry.fields.priceInCents = { 'en-US': NEW_PRICE_EUR_CENTS }
  const updated = await cma.entry.update({ ...ctx, entryId: 'kanna-tincture' }, entry)
  await cma.entry.publish({ ...ctx, entryId: 'kanna-tincture' }, updated)
  console.log('  ✓  Updated + published Contentful entry "kanna-tincture"')
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
