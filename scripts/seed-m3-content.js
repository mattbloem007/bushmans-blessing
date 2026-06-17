require('dotenv').config({ path: '.env.development' })
const { createClient } = require('contentful-management')

const client = createClient({ accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN })
const spaceId = process.env.CONTENTFUL_SPACE_ID
const environmentId = process.env.CONTENTFUL_ENVIRONMENT || 'master'

function richText(paragraphs) {
  return {
    nodeType: 'document',
    data: {},
    content: paragraphs.map(text => ({
      nodeType: 'paragraph',
      data: {},
      content: [{ nodeType: 'text', value: text, marks: [], data: {} }],
    })),
  }
}

const posts = [
  {
    id: 'post-san-people-kanna',
    slug: 'san-people-and-kanna',
    title: 'The San People and Kanna: A Relationship Older Than History',
    authorName: "Bushman's Blessing",
    publishDate: '2025-07-15',
    tags: ['Culture'],
    seoTitle: 'The San People and Kanna',
    seoDescription: 'For thousands of years, the San Bushmen of southern Africa worked with Kanna — not as a medicine, but as a companion plant. This is the story of that relationship.',
    body: richText([
      'For more than ten thousand years, the San people of southern Africa have lived in one of the most demanding environments on Earth. The Karoo — a vast semi-desert stretching across what is now South Africa — demanded a deep understanding of the land, its plants, its rhythms. Among the hundreds of species the San knew intimately, one plant held a particular place in their lives: Sceletium tortuosum, the plant they called Kanna.',
      'The San did not distinguish sharply between medicine and food, between the sacred and the practical. Kanna was used after a long hunt to ease the weight of the journey home. It was passed between elders during times of grief. It was chewed before difficult conversations. This was not intoxication — it was relationship. A quiet dialogue between a people and a plant that had grown together through millennia of mutual adaptation.',
    ]),
  },
  {
    id: 'post-mesembrine',
    slug: 'mesembrine-the-molecule',
    title: "Mesembrine: The Molecule Behind Kanna's Calm",
    authorName: "Bushman's Blessing",
    publishDate: '2025-08-20',
    tags: ['Science'],
    seoTitle: 'Mesembrine: The Active Alkaloid in Kanna',
    seoDescription: "Modern research has identified mesembrine as the key alkaloid responsible for Kanna's mood-lifting effects. Here's what the science says.",
    body: richText([
      "When researchers first began studying Kanna in earnest in the early 2000s, they were looking for a single compound — a molecule that could explain the plant's effects on mood, anxiety, and mental clarity. What they found was mesembrine: a naturally occurring alkaloid that acts as a serotonin reuptake inhibitor, similar in mechanism to some pharmaceutical antidepressants but structurally distinct and found nowhere else on Earth.",
      'Mesembrine works gently. Unlike synthetic SSRIs, which can take weeks to show effect and carry significant side-effect profiles, mesembrine seems to act quickly and leave the system relatively cleanly. Early human trials have shown improvements in stress response and cognitive performance. The research is still young, but what it confirms is something the San already knew: this plant does something remarkable in the human nervous system.',
    ]),
  },
]

async function seed() {
  console.log('Seeding M3 blog posts...\n')
  for (const post of posts) {
    try {
      process.stdout.write(`Creating: ${post.title} ... `)
      const entry = await client.entry.createWithId(
        { spaceId, environmentId, contentTypeId: 'blogPost', entryId: post.id },
        {
          fields: {
            title: { 'en-US': post.title },
            slug: { 'en-US': post.slug },
            authorName: { 'en-US': post.authorName },
            publishDate: { 'en-US': post.publishDate },
            tags: { 'en-US': post.tags },
            seoTitle: { 'en-US': post.seoTitle },
            seoDescription: { 'en-US': post.seoDescription },
            body: { 'en-US': post.body },
          },
        }
      )
      await client.entry.publish({ spaceId, environmentId, entryId: post.id }, entry)
      console.log('✓')
    } catch (err) {
      if (err.status === 409) {
        console.log('already exists, skipping')
      } else {
        console.log(`ERROR: ${err.message}`)
      }
    }
  }
  console.log('\nDone!')
}

seed()
