#!/usr/bin/env node
/**
 * One-off migration: adds business/legal info fields to the existing
 * "siteSettings" content type (upsertContentType only creates content
 * types, it never patches fields onto ones that already exist).
 *
 *   node scripts/add-business-info-fields.js
 */

require('dotenv').config({ path: '.env.development' })
const { createClient } = require('contentful-management')

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID
const MGMT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'

const client = createClient({ accessToken: MGMT_TOKEN })
const ctx = { spaceId: SPACE_ID, environmentId: ENVIRONMENT }

const symbol = (id, name) => ({ id, name, type: 'Symbol' })
const text = (id, name) => ({ id, name, type: 'Text' })

const newFields = [
  symbol('legalBusinessName', 'Legal Business Name'),
  text('businessAddress', 'Business Address'),
  symbol('contactEmail', 'Contact Email'),
  symbol('vatNumber', 'VAT Number'),
  symbol('kvkNumber', 'KvK / Company Registration Number'),
  symbol('countryOfOperation', 'Country of Operation'),
]

async function run() {
  const contentType = await client.contentType.get({ ...ctx, contentTypeId: 'siteSettings' })
  const existingIds = new Set(contentType.fields.map(f => f.id))
  const toAdd = newFields.filter(f => !existingIds.has(f.id))

  if (toAdd.length === 0) {
    console.log('  ⚠  All fields already present — nothing to do')
    return
  }

  contentType.fields.push(...toAdd)
  const updated = await client.contentType.update({ ...ctx, contentTypeId: 'siteSettings' }, contentType)
  await client.contentType.publish({ ...ctx, contentTypeId: 'siteSettings' }, updated)
  console.log(`  ✓  Added ${toAdd.length} fields to "siteSettings": ${toAdd.map(f => f.id).join(', ')}`)
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
