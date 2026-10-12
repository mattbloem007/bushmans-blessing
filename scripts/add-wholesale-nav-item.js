#!/usr/bin/env node
/**
 * Adds "Wholesale" to the site's Navigation entries (shows up in both the
 * header and footer, which both read allContentfulNavigation). Safe to
 * re-run — skips if the entry already exists.
 *
 *   node scripts/add-wholesale-nav-item.js
 */

require('dotenv').config({ path: '.env.development' })
const { createClient } = require('contentful-management')

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID
const MGMT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'

if (!SPACE_ID || !MGMT_TOKEN) {
  console.error('ERROR: CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set')
  process.exit(1)
}

const client = createClient({ accessToken: MGMT_TOKEN })
const ctx = { spaceId: SPACE_ID, environmentId: ENVIRONMENT }

async function run() {
  const entryId = 'nav-wholesale'
  try {
    await client.entry.get({ ...ctx, entryId })
    console.log(`  ⚠  Entry "${entryId}" already exists — skipping`)
    return
  } catch (err) {
    if (err.name !== 'NotFound') throw err
  }

  // Existing displayOrder values: Home 1, About 2, Kanna 3, Experiences/Shop
  // 4, Blog 5, Contact 7 — 6 slots it in right before Contact.
  const entry = await client.entry.createWithId(
    { ...ctx, contentTypeId: 'navigation', entryId },
    {
      fields: {
        label: { 'en-US': 'Wholesale' },
        linkDestination: { 'en-US': '/wholesale' },
        displayOrder: { 'en-US': 6 },
      },
    }
  )
  await client.entry.publish({ ...ctx, entryId }, entry)
  console.log(`  ✓  Created entry: ${entryId}`)
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
