#!/usr/bin/env node
/**
 * One-off script to create the "wholesaleProduct" content type for the
 * wholesale portal (bulk unbottled/unlabelled kanna, and labelled 5ml
 * cases). Safe to re-run — skips if the type already exists.
 *
 *   node scripts/add-wholesale-content-type.js
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

// ── Field helpers (same shapes as scripts/add-retailer-content-type.js) ────

const symbol = (id, name, required = false) => ({ id, name, type: 'Symbol', required })
const boolField = (id, name) => ({ id, name, type: 'Boolean' })
const intField = (id, name) => ({ id, name, type: 'Integer' })

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
  await upsertContentType('wholesaleProduct', 'Wholesale Product', 'name', [
    symbol('name', 'Name', true),
    symbol('slug', 'Slug', true), // looked up by Netlify Functions, never built into a page route
    symbol('sizeLabel', 'Size Label', true), // e.g. "500ml — unbottled & unlabelled"
    intField('unitPriceInCents', 'Unit Price (cents, EUR)'),
    intField('minQuantity', 'Minimum Order Quantity'),
    boolField('unbottled', 'Unbottled / Unlabelled'), // drives the packaging-branding ask in the portal + checkout
    symbol('stripePriceId', 'Stripe Price ID', true), // price_... — sold on the platform's own Stripe account
    boolField('active', 'Active'),
  ])
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
