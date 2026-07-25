#!/usr/bin/env node
/**
 * Creates the initial Kanna Tincture product entry. Run once after
 * `npm run contentful:setup` has created the `product` content type.
 *
 *   node scripts/seed-kanna-tincture-product.js
 *
 * priceInCents and stripePriceId are placeholders — update them once a
 * real Stripe account exists and a Price object has been created there.
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

const p = (text) => ({
  nodeType: 'paragraph',
  data: {},
  content: [{ nodeType: 'text', value: text, marks: [], data: {} }],
})
const doc = (...nodes) => ({ nodeType: 'document', data: {}, content: nodes })

async function run() {
  const entryId = 'kanna-tincture'
  try {
    await client.entry.get({ ...ctx, entryId })
    console.log(`  ⚠  Entry "${entryId}" already exists — skipping`)
    return
  } catch (err) {
    if (err.name !== 'NotFound') throw err
  }

  const entry = await client.entry.createWithId(
    { ...ctx, contentTypeId: 'product', entryId },
    {
      fields: {
        name: { 'en-US': 'Kanna Tincture' },
        slug: { 'en-US': 'kanna-tincture' },
        productType: { 'en-US': 'physical' },
        description: {
          'en-US': doc(
            p('A slow-prepared Sceletium tortuosum tincture, fermented and finished using the traditional methods carried by the plant keepers of Southern Africa.'),
            p('Price and product photography are placeholders — update this entry once real pricing and images are ready.')
          ),
        },
        priceInCents: { 'en-US': 3500 },
        inStock: { 'en-US': true },
        stripePriceId: { 'en-US': '' },
        seoTitle: { 'en-US': "Kanna Tincture | Bushman's Blessing" },
        seoDescription: { 'en-US': 'A traditionally prepared Sceletium tortuosum (Kanna) tincture.' },
      },
    }
  )
  await client.entry.publish({ ...ctx, entryId }, entry)
  console.log(`  ✓  Created entry: ${entryId}`)
  console.log('\nReminder: priceInCents is a placeholder and stripePriceId is empty.')
  console.log('Create a real Price in Stripe (test mode) and copy its ID into this entry before going live.\n')
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
