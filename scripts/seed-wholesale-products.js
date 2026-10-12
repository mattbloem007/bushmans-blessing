#!/usr/bin/env node
/**
 * Creates the three wholesale SKUs: a Stripe Product + Price for each, and
 * a matching Contentful "wholesaleProduct" entry. Run once after
 * scripts/add-wholesale-content-type.js. Safe to re-run — skips any entry
 * that already exists.
 *
 *   node scripts/seed-wholesale-products.js
 */

require('dotenv').config({ path: '.env.development' })
const Stripe = require('stripe')
const { createClient } = require('contentful-management')

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID
const MGMT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'

if (!STRIPE_SECRET_KEY || !SPACE_ID || !MGMT_TOKEN) {
  console.error('ERROR: STRIPE_SECRET_KEY, CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY)
const cma = createClient({ accessToken: MGMT_TOKEN })
const ctx = { spaceId: SPACE_ID, environmentId: ENVIRONMENT }

const SKUS = [
  {
    entryId: 'kanna-bulk-500ml',
    name: 'Kanna Bulk — 500ml',
    sizeLabel: '500ml — unbottled & unlabelled',
    unitPriceInCents: 180000,
    minQuantity: 1,
    unbottled: true,
  },
  {
    entryId: 'kanna-bulk-1l',
    name: 'Kanna Bulk — 1L',
    sizeLabel: '1L — unbottled & unlabelled',
    unitPriceInCents: 330000,
    minQuantity: 1,
    unbottled: true,
  },
  {
    entryId: 'kanna-5ml-labelled-case',
    name: 'Kanna Tincture 5ml — Labelled',
    sizeLabel: '5ml, labelled, sold per bottle (30 minimum)',
    unitPriceInCents: 2200,
    minQuantity: 30,
    unbottled: false,
  },
]

async function run() {
  console.log(`Running against Stripe in ${STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST'} mode.\n`)

  for (const sku of SKUS) {
    try {
      await cma.entry.get({ ...ctx, entryId: sku.entryId })
      console.log(`  ⚠  Entry "${sku.entryId}" already exists — skipping`)
      continue
    } catch (err) {
      if (err.name !== 'NotFound') throw err
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
    console.log(`  ✓  Created Stripe price for "${sku.name}": ${price.id} (€${(sku.unitPriceInCents / 100).toFixed(2)})`)

    const entry = await cma.entry.createWithId(
      { ...ctx, contentTypeId: 'wholesaleProduct', entryId: sku.entryId },
      {
        fields: {
          name: { 'en-US': sku.name },
          slug: { 'en-US': sku.entryId },
          sizeLabel: { 'en-US': sku.sizeLabel },
          unitPriceInCents: { 'en-US': sku.unitPriceInCents },
          minQuantity: { 'en-US': sku.minQuantity },
          unbottled: { 'en-US': sku.unbottled },
          stripePriceId: { 'en-US': price.id },
          active: { 'en-US': true },
        },
      }
    )
    await cma.entry.publish({ ...ctx, entryId: sku.entryId }, entry)
    console.log(`  ✓  Created + published Contentful entry: ${sku.entryId}`)
  }
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
