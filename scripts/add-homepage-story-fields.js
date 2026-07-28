#!/usr/bin/env node
/**
 * One-off migration: adds the new homepage story-block fields to the
 * existing "page" content type (upsertContentType in contentful-setup.js
 * only creates content types, it never patches fields onto ones that
 * already exist).
 *
 *   node scripts/add-homepage-story-fields.js
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
const richText = (id, name) => ({ id, name, type: 'RichText' })
const assetLink = (id, name) => ({ id, name, type: 'Link', linkType: 'Asset', validations: [] })

const newFields = [
  symbol('storyBlock1Heading', 'Story Block 1 — Heading'),
  text('storyBlock1Text', 'Story Block 1 — Text'),
  assetLink('storyBlock1Image', 'Story Block 1 — Image'),
  symbol('storyBlock2Heading', 'Story Block 2 — Heading'),
  text('storyBlock2Text', 'Story Block 2 — Text'),
  assetLink('storyBlock2Image', 'Story Block 2 — Image'),
  symbol('storyBlock3Heading', 'Story Block 3 — Heading'),
  text('storyBlock3Text', 'Story Block 3 — Text'),
  assetLink('storyBlock3Image', 'Story Block 3 — Image'),
  richText('exploreMoreText', 'Explore More — Teaser Text (with inline links)'),
]

async function run() {
  const contentType = await client.contentType.get({ ...ctx, contentTypeId: 'page' })
  const existingIds = new Set(contentType.fields.map(f => f.id))
  const toAdd = newFields.filter(f => !existingIds.has(f.id))

  if (toAdd.length === 0) {
    console.log('  ⚠  All fields already present — nothing to do')
    return
  }

  contentType.fields.push(...toAdd)
  const updated = await client.contentType.update({ ...ctx, contentTypeId: 'page' }, contentType)
  await client.contentType.publish({ ...ctx, contentTypeId: 'page' }, updated)
  console.log(`  ✓  Added ${toAdd.length} fields to "page": ${toAdd.map(f => f.id).join(', ')}`)
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
