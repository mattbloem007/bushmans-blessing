#!/usr/bin/env node
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
  try {
    const entry = await client.entry.get({ ...ctx, entryId: 'home-page' })

    entry.fields.heroHeading = { 'en-US': 'The Oldest Medicine. The Simplest Truth.' }
    entry.fields.heroSubheading = { 'en-US': 'Kanna — rooted in the ancient knowledge of the First People of Southern Africa. Prepared as it always was, carried into the modern age. Evolving with the modern world, its roots and spirit intact.' }
    entry.fields.seoTitle = { 'en-US': "Bushman's Blessing | Ancient Kanna Medicine" }
    entry.fields.seoDescription = { 'en-US': "Bushman's Blessing brings Kanna — the sacred plant medicine of Southern Africa's First People — to the modern world. Prepared the old way, roots and spirit intact." }

    const updated = await client.entry.update({ ...ctx, entryId: 'home-page' }, entry)
    await client.entry.publish({ ...ctx, entryId: 'home-page' }, updated)
    console.log('✓  Home page hero updated and published')
  } catch (err) {
    console.error('✗  Failed:', err.message)
  }
}

run()
