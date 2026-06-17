#!/usr/bin/env node
/**
 * Seeds Milestone 2 Contentful content:
 * - Updates home-page entry with bodyContent
 * - Creates About page entry with rich text body
 * - Updates kanna-page with three story sections
 *
 * Run: node scripts/seed-m2-content.js
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

// RichText document builders — returns the raw document object (not the Gatsby raw/references format)
const p = (text) => ({
  nodeType: 'paragraph',
  data: {},
  content: [{ nodeType: 'text', value: text, marks: [], data: {} }],
})
const h2 = (text) => ({
  nodeType: 'heading-2',
  data: {},
  content: [{ nodeType: 'text', value: text, marks: [], data: {} }],
})
const doc = (...nodes) => ({ nodeType: 'document', data: {}, content: nodes })

async function run() {
  console.log(`\nSeeding Milestone 2 content to: ${SPACE_ID} / ${ENVIRONMENT}\n`)

  // ── Update home-page bodyContent ──────────────────────────────────────────
  try {
    const entry = await client.entry.get({ ...ctx, entryId: 'home-page' })
    entry.fields.bodyContent = {
      'en-US': doc(
        p("Bushman's Blessing is rooted in the living traditions of the San people — the oldest continuous culture on earth. For tens of thousands of years, the San Bushmen of southern Africa have used Sceletium tortuosum, known as Kanna or Kougoed, as a sacred medicine: to connect, to endure, to feel."),
        p("We source our Kanna from wild, sustainably harvested plants and prepare it using traditional fermentation methods passed down through generations. What you receive is not an extract or an isolate — it is the whole plant, whole medicine, prepared in right relationship with the land and the people who have tended it since the beginning."),
        p("In a world that asks you to speed up, numb out, and disconnect — Kanna invites you to do the opposite. To slow down. To feel more, not less. To come home to yourself and to the people around you.")
      ),
    }
    const updated = await client.entry.update({ ...ctx, entryId: 'home-page' }, entry)
    await client.entry.publish({ ...ctx, entryId: 'home-page' }, updated)
    console.log('  ✓  Updated home-page bodyContent')
  } catch (err) {
    console.error('  ✗  Failed to update home-page:', err.message)
  }

  // ── Create About page entry ───────────────────────────────────────────────
  try {
    await client.entry.get({ ...ctx, entryId: 'about-page' })
    console.log('  ⚠  about-page already exists — skipping')
  } catch {
    const entry = await client.entry.createWithId(
      { ...ctx, contentTypeId: 'page', entryId: 'about-page' },
      {
        fields: {
          title: { 'en-US': "About Bushman's Blessing" },
          slug: { 'en-US': '/about' },
          heroHeading: { 'en-US': 'Where Ancient Wisdom Meets Modern Living' },
          heroSubheading: { 'en-US': 'The story behind the medicine, the people, and the purpose' },
          bodyContent: {
            'en-US': doc(
              h2("The San People — The First Humans"),
              p("The San Bushmen of southern Africa are widely recognised as the oldest continuous culture in human history. Genetic research traces an unbroken lineage reaching back over 100,000 years — to the very dawn of Homo sapiens. Their knowledge of plants, animals, weather, and the invisible world is not primitive. It is ancient. There is a difference."),
              h2("Kanna — The Medicine of the Desert"),
              p("Growing in the arid, rocky terrain of the Karoo and Namaqualand, Sceletium tortuosum — known to the San as Kanna or Kougoed — has been used for as long as their oral history can remember. Traditionally prepared by slow fermentation and sun-drying, Kanna was chewed, smoked, or taken as a tea to relieve exhaustion, thirst, and hunger — and to enter states of deep connection in ceremony."),
              h2("Why Now"),
              p("The modern world has created a pandemic of disconnection. We are more reachable and less felt than ever before. Kanna does not fix this — but it opens a door. It invites the nervous system to soften, the guard to drop, and the heart to remember what it is like to be genuinely present with another person."),
              p("Bushman's Blessing exists to bring this medicine to people who are ready to receive it — with full knowledge of where it comes from, who carries it, and what it asks of us in return.")
            ),
          },
          seoTitle: { 'en-US': "About | Bushman's Blessing" },
          seoDescription: { 'en-US': "The story of Bushman's Blessing — the San people, Kanna medicine, and why ancient wisdom matters now." },
        },
      }
    )
    await client.entry.publish({ ...ctx, entryId: 'about-page' }, entry)
    console.log('  ✓  Created about-page entry')
  }

  // ── Update kanna-page with three story sections ───────────────────────────
  try {
    const entry = await client.entry.get({ ...ctx, entryId: 'kanna-page' })
    entry.fields.traditionalUse = {
      'en-US': doc(
        p("For the San, Kanna was not a supplement. It was a companion for life's hardest miles — carried on long hunts across the Karoo, shared in ceremony around the fire, offered to the grieving and the exhausted. The plant was chewed slowly, its juices allowed to absorb, its effects arriving quietly: a lifting of the weight, a warmth behind the eyes, a willingness to speak of things usually left unsaid."),
        p("Traditional preparation involved cutting the green plant and leaving it to ferment — sometimes for weeks — in a sealed skin or clay vessel. This process, unique to the San tradition, activates and concentrates the plant's active constituents in ways that raw or dried plant cannot replicate. It is a form of knowledge encoded in time and patience.")
      ),
    }
    entry.fields.scienceSection = {
      'en-US': doc(
        p("Long before there were brains, there were membranes. The first living cell faced the same fundamental challenge all life faces: how to tell the difference between self and world, signal and noise, danger and safety. The answer was the cell membrane — a semi-permeable boundary that could sense, respond, and adapt."),
        p("Sceletium tortuosum contains a family of alkaloids — mesembrine, mesembrenone, and their relatives — that interact with precisely the systems your nervous system uses to regulate mood, stress response, and social openness. Mesembrine acts as a selective serotonin reuptake inhibitor. Mesembrenone inhibits phosphodiesterase-4, extending the duration of calm."),
        p("The desert teaches resilience. Kanna, having survived millennia of extremity, carries that lesson in its chemistry. When you work with it, you are, in a sense, borrowing the plant's long memory of how to be okay.")
      ),
    }
    entry.fields.spiritualSection = {
      'en-US': doc(
        p("There is a quality of presence that most of us have felt — briefly, unexpectedly — that we spend the rest of our lives trying to return to. A conversation that went somewhere real. A moment with a child where time stopped. A night around a fire when no one wanted to leave."),
        p("Kanna does not manufacture these experiences. It removes the interference that prevents them. The background noise softens. The need to perform relaxes. What remains is something closer to how you actually are — curious, open, capable of being moved."),
        p("The San did not separate medicine from ceremony, or ceremony from daily life. Everything was connected. Kanna was one thread in that fabric — a plant that helped people remember their belonging, to each other and to the living world around them. That invitation is still open.")
      ),
    }
    const updated = await client.entry.update({ ...ctx, entryId: 'kanna-page' }, entry)
    await client.entry.publish({ ...ctx, entryId: 'kanna-page' }, updated)
    console.log('  ✓  Updated kanna-page section content')
  } catch (err) {
    console.error('  ✗  Failed to update kanna-page:', err.message)
  }

  console.log('\n✅  Milestone 2 content seeded.\n')
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  process.exit(1)
})
