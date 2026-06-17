#!/usr/bin/env node
/**
 * One-time script to create all Contentful content types and sample entries.
 * Run once after filling in .env.development with your credentials:
 *   npm run contentful:setup
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

// ── Field helpers ──────────────────────────────────────────────────────────

const symbol = (id, name, required = false) => ({ id, name, type: 'Symbol', required })
const text = (id, name) => ({ id, name, type: 'Text' })
const richText = (id, name) => ({ id, name, type: 'RichText' })
const dateField = (id, name) => ({ id, name, type: 'Date' })
const boolField = (id, name) => ({ id, name, type: 'Boolean' })
const intField = (id, name) => ({ id, name, type: 'Integer' })
const assetLink = (id, name) => ({ id, name, type: 'Link', linkType: 'Asset', validations: [] })
const assetArray = (id, name) => ({
  id, name, type: 'Array',
  items: { type: 'Link', linkType: 'Asset', validations: [] },
})
const symbolArray = (id, name) => ({
  id, name, type: 'Array',
  items: { type: 'Symbol', validations: [] },
})

// ── Content type creator ───────────────────────────────────────────────────

async function upsertContentType(id, name, displayField, fields) {
  try {
    const existing = await client.contentType.get({ ...ctx, contentTypeId: id })
    console.log(`  ⚠  Content type "${id}" already exists — skipping`)
    return existing
  } catch (err) {
    if (err.name !== 'NotFound') throw err
  }
  const ct = await client.contentType.createWithId(
    { ...ctx, contentTypeId: id },
    { name, displayField, fields }
  )
  await client.contentType.publish({ ...ctx, contentTypeId: id }, ct)
  console.log(`  ✓  Created content type: ${id}`)
  return ct
}

// ── Entry creator ──────────────────────────────────────────────────────────

async function upsertEntry(contentTypeId, entryId, fields) {
  try {
    await client.entry.get({ ...ctx, entryId })
    console.log(`  ⚠  Entry "${entryId}" already exists — skipping`)
    return
  } catch (err) {
    if (err.name !== 'NotFound') throw err
  }
  const entry = await client.entry.createWithId(
    { ...ctx, contentTypeId, entryId },
    { fields }
  )
  await client.entry.publish({ ...ctx, entryId }, entry)
  console.log(`  ✓  Created entry: ${entryId}`)
}

// ── Main ───────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\nConnecting to Contentful space: ${SPACE_ID} / ${ENVIRONMENT}\n`)
  console.log('── Creating content types ──────────────────────────────────────\n')

  await upsertContentType('page', 'Page', 'title', [
    symbol('title', 'Title', true),
    symbol('slug', 'Slug', true),
    symbol('heroHeading', 'Hero Heading'),
    symbol('heroSubheading', 'Hero Subheading'),
    assetLink('heroImage', 'Hero Image'),
    richText('bodyContent', 'Body Content'),
    symbol('seoTitle', 'SEO Title'),
    symbol('seoDescription', 'SEO Description'),
  ])

  await upsertContentType('kannaPage', 'Kanna Page', 'title', [
    symbol('title', 'Title', true),
    symbol('slug', 'Slug', true),
    symbol('heroHeading', 'Hero Heading'),
    symbol('heroSubheading', 'Hero Subheading'),
    assetLink('heroImage', 'Hero Image'),
    richText('traditionalUse', 'Traditional Use'),
    richText('scienceSection', 'Science Section'),
    richText('spiritualSection', 'Spiritual Section'),
    assetArray('productImages', 'Product Images'),
    symbol('seoTitle', 'SEO Title'),
    symbol('seoDescription', 'SEO Description'),
  ])

  await upsertContentType('blogPost', 'Blog Post', 'title', [
    symbol('title', 'Title', true),
    symbol('slug', 'Slug', true),
    symbol('authorName', 'Author Name'),
    dateField('publishDate', 'Publish Date'),
    assetLink('featuredImage', 'Featured Image'),
    richText('body', 'Body'),
    symbolArray('tags', 'Tags'),
    symbol('seoTitle', 'SEO Title'),
    symbol('seoDescription', 'SEO Description'),
  ])

  await upsertContentType('experience', 'Experience', 'authorName', [
    symbol('authorName', 'Author Name', true),
    symbol('location', 'Location'),
    text('story', 'Story'),
    dateField('dateFeatured', 'Date Featured'),
    boolField('featured', 'Featured'),
  ])

  await upsertContentType('navigation', 'Navigation', 'label', [
    symbol('label', 'Label', true),
    symbol('linkDestination', 'Link Destination', true),
    intField('displayOrder', 'Display Order'),
  ])

  await upsertContentType('siteSettings', 'Site Settings', 'siteName', [
    symbol('siteName', 'Site Name', true),
    assetLink('logo', 'Logo'),
    symbol('footerText', 'Footer Text'),
    symbolArray('socialMediaLinks', 'Social Media Links'),
  ])

  console.log('\n── Creating sample entries ──────────────────────────────────────\n')

  await upsertEntry('page', 'home-page', {
    title: { 'en-US': "Bushman's Blessing" },
    slug: { 'en-US': '/' },
    heroHeading: { 'en-US': 'Ancient Wisdom, Living Medicine' },
    heroSubheading: { 'en-US': 'Sceletium tortuosum — Kanna — the sacred plant of the San Bushmen' },
    seoTitle: { 'en-US': "Bushman's Blessing | Ancient Wisdom, Living Medicine" },
    seoDescription: { 'en-US': 'Discover Kanna, the sacred plant medicine of the San Bushmen of South Africa.' },
  })

  await upsertEntry('kannaPage', 'kanna-page', {
    title: { 'en-US': 'Kanna / Sceletium tortuosum' },
    slug: { 'en-US': '/kanna' },
    heroHeading: { 'en-US': 'The Plant That Speaks to the Cells' },
    heroSubheading: { 'en-US': 'Thousands of years of San wisdom, confirmed by modern science' },
    seoTitle: { 'en-US': 'Kanna | Sceletium tortuosum' },
    seoDescription: { 'en-US': 'The full story of Kanna — traditional use, cellular science, and spiritual reconnection.' },
  })

  await upsertEntry('blogPost', 'sample-blog-post', {
    title: { 'en-US': "Welcome to the Bushman's Blessing Blog" },
    slug: { 'en-US': 'welcome' },
    authorName: { 'en-US': "Bushman's Blessing" },
    publishDate: { 'en-US': new Date().toISOString() },
    tags: { 'en-US': ['News'] },
    seoTitle: { 'en-US': "Welcome | Bushman's Blessing Blog" },
    seoDescription: { 'en-US': "The first post on the Bushman's Blessing blog." },
  })

  await upsertEntry('experience', 'sample-experience', {
    authorName: { 'en-US': 'A.N.' },
    location: { 'en-US': 'Cape Town, South Africa' },
    story: { 'en-US': 'For the first time in years, I felt genuinely still. Not numb — still. Like the noise in my head finally had somewhere to go.' },
    dateFeatured: { 'en-US': new Date().toISOString().split('T')[0] },
    featured: { 'en-US': true },
  })

  const navItems = [
    { label: 'Home', linkDestination: '/', displayOrder: 1 },
    { label: 'About', linkDestination: '/about', displayOrder: 2 },
    { label: 'Kanna', linkDestination: '/kanna', displayOrder: 3 },
    { label: 'Experiences', linkDestination: '/experiences', displayOrder: 4 },
    { label: 'Blog', linkDestination: '/blog', displayOrder: 5 },
  ]
  for (const item of navItems) {
    await upsertEntry('navigation', `nav-${item.label.toLowerCase()}`, {
      label: { 'en-US': item.label },
      linkDestination: { 'en-US': item.linkDestination },
      displayOrder: { 'en-US': item.displayOrder },
    })
  }

  await upsertEntry('siteSettings', 'site-settings', {
    siteName: { 'en-US': "Bushman's Blessing" },
    footerText: { 'en-US': `© ${new Date().getFullYear()} Bushman's Blessing. Rooted in ancient wisdom.` },
    socialMediaLinks: { 'en-US': [] },
  })

  console.log('\n✅  Setup complete. All content types and sample entries created.\n')
  console.log('Next steps:')
  console.log('  1. Run: npm run develop')
  console.log('  2. Visit http://localhost:8000 — should show text from Contentful')
  console.log('  3. Check http://localhost:8000/__graphql to see all 6 content types\n')
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  if (err.details) console.error(JSON.stringify(err.details, null, 2))
  process.exit(1)
})
