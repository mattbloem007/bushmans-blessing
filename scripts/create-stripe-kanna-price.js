#!/usr/bin/env node
/**
 * Creates the Stripe (test-mode) Product + Price for the Kanna Tincture,
 * then updates the Contentful "kanna-tincture" entry with the real
 * stripePriceId and priceInCents.
 *
 *   node scripts/create-stripe-kanna-price.js
 */

require('dotenv').config({ path: '.env.development' })
const Stripe = require('stripe')
const { createClient } = require('contentful-management')

const PRICE_EUR_CENTS = 4495 // €44.95

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID
const MGMT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'

if (!STRIPE_SECRET_KEY || !SPACE_ID || !MGMT_TOKEN) {
  console.error('ERROR: STRIPE_SECRET_KEY, CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set')
  process.exit(1)
}

if (!STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.error('ERROR: refusing to run against a non-test-mode Stripe secret key')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY)
const cma = createClient({ accessToken: MGMT_TOKEN })
const ctx = { spaceId: SPACE_ID, environmentId: ENVIRONMENT }

async function run() {
  const product = await stripe.products.create({
    name: 'Kanna Tincture',
    metadata: { contentfulSlug: 'kanna-tincture' },
  })
  console.log(`  ✓  Created Stripe product: ${product.id}`)

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: PRICE_EUR_CENTS,
    currency: 'eur',
  })
  console.log(`  ✓  Created Stripe price: ${price.id} (€${(PRICE_EUR_CENTS / 100).toFixed(2)})`)

  const entry = await cma.entry.get({ ...ctx, entryId: 'kanna-tincture' })
  entry.fields.stripePriceId = { 'en-US': price.id }
  entry.fields.priceInCents = { 'en-US': PRICE_EUR_CENTS }
  const updated = await cma.entry.update({ ...ctx, entryId: 'kanna-tincture' }, entry)
  await cma.entry.publish({ ...ctx, entryId: 'kanna-tincture' }, updated)
  console.log('  ✓  Updated + published Contentful entry "kanna-tincture"')
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
