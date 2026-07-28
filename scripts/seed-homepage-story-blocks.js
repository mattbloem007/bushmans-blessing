#!/usr/bin/env node
/**
 * Uploads the three Baviaanskloof story images as Contentful assets and
 * populates the home-page entry's new story-block fields + the
 * "explore more" teaser text (with inline links to /about, /kanna, /blog).
 *
 *   node scripts/seed-homepage-story-blocks.js
 */

require('dotenv').config({ path: '.env.development' })
const fs = require('fs')
const path = require('path')
const { createClient } = require('contentful-management')

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID
const MGMT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'

const client = createClient({ accessToken: MGMT_TOKEN })
const ctx = { spaceId: SPACE_ID, environmentId: ENVIRONMENT }

const IMAGE_DIR = '/private/tmp/claude-501/-Users-gabriel-Documents-claude/5f0116d2-8bc1-440e-8f31-cde662d0f72e/scratchpad/story-images'

async function uploadImage(assetId, filename, title, description) {
  try {
    const existing = await client.asset.get({ ...ctx, assetId })
    console.log(`  ⚠  Asset "${assetId}" already exists — skipping upload`)
    return existing
  } catch (err) {
    if (err.name !== 'NotFound') throw err
  }

  const fileBuffer = fs.readFileSync(path.join(IMAGE_DIR, filename))
  const upload = await client.upload.create(ctx, { file: fileBuffer })

  let asset = await client.asset.createWithId(
    { ...ctx, assetId },
    {
      fields: {
        title: { 'en-US': title },
        description: { 'en-US': description },
        file: {
          'en-US': {
            contentType: 'image/jpeg',
            fileName: filename,
            uploadFrom: { sys: { type: 'Link', linkType: 'Upload', id: upload.sys.id } },
          },
        },
      },
    }
  )

  await client.asset.processForLocale({ ...ctx, assetId: asset.sys.id }, asset, 'en-US')
  for (let i = 0; i < 15; i++) {
    asset = await client.asset.get({ ...ctx, assetId: asset.sys.id })
    if (asset.fields.file['en-US'].url) break
    await new Promise(r => setTimeout(r, 1000))
  }
  asset = await client.asset.publish({ ...ctx, assetId: asset.sys.id }, asset)
  console.log(`  ✓  Uploaded asset: ${assetId}`)
  return asset
}

const p = (...content) => ({ nodeType: 'paragraph', data: {}, content })
const t = (value) => ({ nodeType: 'text', value, marks: [], data: {} })
const link = (value, uri) => ({
  nodeType: 'hyperlink',
  data: { uri },
  content: [{ nodeType: 'text', value, marks: [], data: {} }],
})
const doc = (...content) => ({ nodeType: 'document', data: {}, content })

async function run() {
  const landAsset = await uploadImage(
    'story-the-land',
    'the-land.jpg',
    'Baviaanskloof landscape',
    'The Baviaanskloof mountains, where this Kanna is sourced.'
  )
  const plantAsset = await uploadImage(
    'story-the-plant',
    'the-plant.jpg',
    'Kanna seedlings',
    'Young Sceletium tortuosum (Kanna) plants.'
  )
  const traditionAsset = await uploadImage(
    'story-the-tradition',
    'the-tradition.jpg',
    'San rock art, Baviaanskloof',
    'Original San rock art in the Baviaanskloof.'
  )

  const assetLink = (asset) => ({ sys: { type: 'Link', linkType: 'Asset', id: asset.sys.id } })

  const entry = await client.entry.get({ ...ctx, entryId: 'home-page' })

  entry.fields.storyBlock1Heading = { 'en-US': 'Where It Grows' }
  entry.fields.storyBlock1Text = {
    'en-US':
      "Deep in the Baviaanskloof — the “valley of baboons” — this Kanna grows wild among fynbos and rock, in a landscape that has changed little in ten thousand years. It isn't farmed in neat rows. It's found, respected, and harvested the way it always has been.",
  }
  entry.fields.storyBlock1Image = { 'en-US': assetLink(landAsset) }

  entry.fields.storyBlock2Heading = { 'en-US': 'The Plant Itself' }
  entry.fields.storyBlock2Text = {
    'en-US':
      'Sceletium tortuosum is a small, unassuming succulent — easy to miss, easy to underestimate. For thousands of years it has been chewed, fermented, and shared as one of Southern Africa’s oldest plant medicines, prized long before it had a Latin name.',
  }
  entry.fields.storyBlock2Image = { 'en-US': assetLink(plantAsset) }

  entry.fields.storyBlock3Heading = { 'en-US': 'A Living Lineage' }
  entry.fields.storyBlock3Text = {
    'en-US':
      "The San people who once painted these rock walls were the same custodians who first understood Kanna's gifts. That knowledge never vanished — it passed hand to hand, kept alive by the plant keepers of Southern Africa who still prepare it the traditional way today.",
  }
  entry.fields.storyBlock3Image = { 'en-US': assetLink(traditionAsset) }

  entry.fields.exploreMoreText = {
    'en-US': doc(
      p(
        t('This is only a glimpse. If you’d like to go further, read the '),
        link('fuller story of Bushman’s Blessing', '/about'),
        t(', walk through '),
        link('Kanna’s traditional use and the science behind it', '/kanna'),
        t(', or explore the '),
        link('blog', '/blog'),
        t(' for firsthand accounts from the community.')
      )
    ),
  }

  const updated = await client.entry.update({ ...ctx, entryId: 'home-page' }, entry)
  await client.entry.publish({ ...ctx, entryId: 'home-page' }, updated)
  console.log('  ✓  home-page entry updated with story blocks + explore-more text, published.')
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
