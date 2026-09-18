#!/usr/bin/env node
/**
 * One-off script to create the "retailer" content type for the exclusive
 * regional retailer program. Safe to re-run — skips if the type already
 * exists.
 *
 *   node scripts/add-retailer-content-type.js
 */

require('dotenv').config({ path: '.env.development' })
const { createClient } = require('contentful-management')

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID
const MGMT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'

if (!SPACE_ID || !MGMT_TOKEN) {
  console.error('ERROR: CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env.development')
  process.exit(1)
}

const client = createClient({ accessToken: MGMT_TOKEN })
const ctx = { spaceId: SPACE_ID, environmentId: ENVIRONMENT }

// ── Field helpers (same shapes as scripts/contentful-setup.js) ─────────────

const symbol = (id, name, required = false) => ({ id, name, type: 'Symbol', required })
const boolField = (id, name) => ({ id, name, type: 'Boolean' })
const intField = (id, name) => ({ id, name, type: 'Integer' })
const numberField = (id, name) => ({ id, name, type: 'Number' })
const symbolArray = (id, name) => ({
  id, name, type: 'Array',
  items: { type: 'Symbol', validations: [] },
})

async function upsertContentType(id, name, displayField, fields) {
  try {
    await client.contentType.get({ ...ctx, contentTypeId: id })
    console.log(`  ⚠  Content type "${id}" already exists — skipping`)
    return
  } catch (err) {
    if (err.name !== 'NotFound') throw err
  }
  const ct = await client.contentType.createWithId(
    { ...ctx, contentTypeId: id },
    { name, displayField, fields }
  )
  await client.contentType.publish({ ...ctx, contentTypeId: id }, ct)
  console.log(`  ✓  Created content type: ${id}`)
}

async function run() {
  await upsertContentType('retailer', 'Retailer', 'name', [
    symbol('name', 'Name', true),
    symbol('slug', 'Slug', true), // used in the page path: /retailers/<slug>/
    symbolArray('countries', 'Countries'), // ISO 3166-1 alpha-2 codes this retailer is exclusive for
    symbol('stripeAccountId', 'Stripe Connect Account ID', true), // acct_...
    intField('priceOverrideInCents', 'Price Override (cents, EUR)'), // optional — falls back to the product's own price
    intField('shippingCents', 'Shipping Cost (cents, EUR)'), // flat rate for their own region; unset/0 = free
    boolField('active', 'Active'),
    intField('totalFeeCents', 'Total Licensing Fee (cents, EUR)'), // 0 for flat-rate-paid-upfront retailers
    numberField('perSaleFeePercent', 'Per-Sale Fee Percent'), // applied via application_fee_amount until totalFeeCents is paid off
    symbol('tagline', 'Tagline'),
  ])
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
