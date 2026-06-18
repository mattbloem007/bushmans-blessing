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

async function update(entryId, fields) {
  const entry = await client.entry.get({ ...ctx, entryId })
  Object.assign(entry.fields, fields)
  const updated = await client.entry.update({ ...ctx, entryId }, entry)
  await client.entry.publish({ ...ctx, entryId }, updated)
  console.log(`✓  Updated and published: ${entryId}`)
}

async function run() {
  // ── Post 1 — Culture ───────────────────────────────────────────────────────
  await update('post-san-people-kanna', {
    title: { 'en-US': 'Kanna and the First People: A Relationship Without Beginning' },
    slug: { 'en-US': 'kanna-and-the-first-people' },
    authorName: { 'en-US': "Bushman's Blessing" },
    seoTitle: { 'en-US': 'Kanna and the First People: A Relationship Without Beginning | Bushman\'s Blessing' },
    seoDescription: { 'en-US': 'The relationship between Kanna and the First People of Southern Africa stretches back further than recorded history. The medicine, the preparation, and what remains.' },
    body: {
      'en-US': doc(
        p("There is a moment, somewhere in the deep past of Southern Africa, that we will never be able to pinpoint."),
        p("A person — one of the First People of this land — bent toward a small, fleshy plant growing in the desert of the Karoo. Perhaps it was hunger that led them there. Perhaps curiosity. Perhaps something closer to the knowing that comes from living so intimately with a landscape that the plants begin to speak."),
        p("Whatever led them there, what followed was a relationship. One of the oldest between a human being and a plant that we are aware of, anywhere on earth."),
        h2("The Name Itself"),
        p("The plant has been known by many names across many generations. Sceletium tortuosum to the botanists. Kanna to those who first gathered it. Kougoed — \"something to chew\" — in the language of the people who worked with it daily."),
        p("That last name says something. This was not a rare medicine locked away for special occasions. It was a companion — passed between hands in ordinary moments as much as sacred ones."),
        h2("Preparation as Practice"),
        p("What distinguished the use of Kanna among the First People was not simply that they used it, but how carefully they prepared it."),
        p("Freshly harvested leaves and stems were fermented — pressed together and left to undergo a slow, deliberate transformation. Days of patience. A process that required knowledge passed from hand to hand: when to harvest, how to press, how long to wait, how to read the plant's readiness."),
        p("This is not a small detail. Fermentation changes the plant's alkaloid profile — transforming raw compounds into something the body receives more openly. The First People arrived at this not through chemistry, but through relationship. Through generations of paying close attention."),
        p("After fermentation, the plant was sun-dried and chewed. Held in the mouth. Savoured. Shared."),
        h2("What It Was For"),
        p("Kanna eased the weight of long hunts — sustaining the body and the spirit across great distances. It softened grief. It opened conversations that needed opening. It made sitting together around a fire feel like exactly the right thing to do."),
        p("A medicine of arrival, not escape."),
        h2("What Remains"),
        p("The culture that carried this knowledge was fractured almost beyond recognition through colonisation. Much was lost. But not everything."),
        p("Mantis Collective — our partners on the ground in Southern Africa — works directly with the plant keepers and healers who still carry fragments of this tradition. What Bushman's Blessing prepares today is prepared in direct conversation with that living knowledge: the fermentation technique, the harvesting wisdom, the understanding that the process itself is part of the medicine."),
        p("We do not claim to replicate what the First People knew in full. We carry what remains, as carefully as we can, into a world that is beginning to understand why it matters.")
      ),
    },
  })

  // ── Post 2 — Science ───────────────────────────────────────────────────────
  await update('post-mesembrine', {
    title: { 'en-US': 'Mesembrine, Mesembrenone, and the Ancient Chemistry of Kanna' },
    slug: { 'en-US': 'the-science-of-kanna' },
    authorName: { 'en-US': "Bushman's Blessing" },
    seoTitle: { 'en-US': 'Mesembrine, Mesembrenone, and the Ancient Chemistry of Kanna | Bushman\'s Blessing' },
    seoDescription: { 'en-US': 'Mesembrine and mesembrenone — the two key alkaloids in Kanna, how they work with serotonin and dopamine, and why traditional preparation matters.' },
    body: {
      'en-US': doc(
        p("There is a question that comes up whenever people encounter Kanna for the first time: what does it actually do?"),
        p("The honest answer depends on how you ask. Talk to a chemist and they will point to alkaloids. Talk to someone who has worked with the plant for years and they will reach for different language entirely. The remarkable thing about Kanna is that both answers are pointing toward the same truth."),
        h2("The Two Key Alkaloids"),
        p("Sceletium tortuosum contains a number of active compounds, but two are central to understanding its effects."),
        p("Mesembrine is the primary alkaloid and the most studied. It works as a serotonin reuptake inhibitor — slowing the rate at which serotonin is cleared from the spaces between nerve cells, extending the time the brain has to receive its signal. Serotonin is associated with mood stability, genuine wellbeing, and the capacity to feel present and connected. In clinical terms, mesembrine does what pharmaceutical SSRIs do — but as part of a whole plant, in relationship with everything else Kanna contains."),
        p("Mesembrenone, the second key alkaloid, works through an entirely different mechanism. It is a PDE4 inhibitor — meaning it supports healthy dopamine signalling. Where mesembrine works with serotonin, mesembrenone works with dopamine. Together, they bring two of the most important neurochemical systems in the body toward a more balanced state."),
        p("This matters. Most pharmaceutical interventions target one system at a time. Kanna, through its natural alkaloid profile, supports both simultaneously — not by flooding either system, but by helping each find its own equilibrium."),
        h2("An Ancient Messenger"),
        p("Serotonin is older than the nervous system itself. It exists in plants, in gut bacteria, in organisms with no brain to speak of. Long before it was understood as a mood-regulating chemical, it was simply a messenger — a way for cells to know they were not alone."),
        p("Kanna's relationship with this system is not new. The plant and the molecule have been in conversation for a very long time. What the First People discovered through generations of careful use, science is now beginning to describe in precise terms."),
        h2("Whole Plant, Whole Effect"),
        p("The alkaloids do not work in isolation. The traditional fermentation process — which Bushman's Blessing preserves — transforms the plant's chemistry in ways that improve how the body receives it. It is not simply a delivery mechanism for mesembrine. The whole plant, prepared with care, produces a whole effect."),
        p("This is why Bushman's Blessing works with the full plant rather than extracts or isolates. The science supports what tradition always knew: the preparation is part of the medicine. What makes Kanna what it is cannot be separated from how it was made."),
        h2("A Different Kind of Balance"),
        p("We live in a world largely optimised for dopamine — the brain's seeking and reward system, activated by every notification, every scroll, every small hit of novelty. Over time, that constant stimulation pulls the system out of its natural balance."),
        p("Kanna works with both sides of that equation. Supporting the chemistry of presence and genuine connection through serotonin, while helping restore healthy dopamine signalling through mesembrenone. The result is not sedation or suppression — it is equilibrium. The nervous system finding its way back to itself."),
        p("The science is relatively new. The relationship is ancient. They are pointing toward the same thing.")
      ),
    },
  })
}

run().catch(err => console.error('✗  Script failed:', err.message))
