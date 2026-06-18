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
const doc = (...nodes) => ({ nodeType: 'document', data: {}, content: nodes })

async function run() {
  try {
    const entry = await client.entry.get({ ...ctx, entryId: 'about-page' })

    entry.fields.heroHeading = { 'en-US': 'Ancient Roots. Modern Hands.' }
    entry.fields.heroSubheading = { 'en-US': 'A bridge between the oldest wisdom and the world that is beginning to seek it.' }
    entry.fields.seoTitle = { 'en-US': "About | Bushman's Blessing" }
    entry.fields.seoDescription = { 'en-US': "The story behind Bushman's Blessing — the medicine, the name, and the people who carry it forward." }
    entry.fields.bodyContent = {
      'en-US': doc(
        p("Bushman's Blessing was born from reverence. Deep respect for what the First People of Southern Africa understood about living — about the land, about one another, about the invisible threads that hold a person and a community together. We carry that wisdom forward with the sincerity it deserves, sharing it in a way that honours the source at every step."),
        p("We are a bridge — and a bridge exists only to carry something through."),
        p("The word \"Bushman\" carries history. Rooted in Dutch colonial language, it was once a term of dismissal — a way to name the First People as outlaws in their own land, to push them to the margins of a world being rewritten without them. That wound is real, and we face it directly."),
        p("But language shifts when people choose to shift it. Words can be reclaimed. Turned around. Made to face a different direction."),
        p("We use the word \"Bushman\" with full intention — to call forward a spirit the modern world urgently needs. The spirit of the Bushman and Bushwoman: togetherness, deep relationship with the land, the understanding that a person is only as whole as the community around them and the earth beneath their feet. In using the name, we are making a call, not a claim."),
        p("That call is grounded in a real partnership. Mantis Collective is a South African alliance of healers, herbalists, and cultural custodians — the living bridge between the indigenous plant wisdom of this land and the world that is now seeking it. Founded as a direct response to the extractive models that have long shaped the Kanna industry — hollow agreements that claim to represent the First People while rarely reaching the communities who matter — Mantis Collective works differently. On the ground, directly with the people and the land: protecting traditional knowledge, empowering those who carry it, ensuring that what leaves South Africa gives something real back."),
        p("Bushman's Blessing exists in full partnership with Mantis Collective. That is not a footnote. It is the foundation."),
        p("Something is shifting. The modern world — for all its speed and noise — has left people deeply, quietly alone. And in that loneliness, something is turning: away from acceleration, toward depth. Toward plant medicine. Toward the ways of living that were practised for tens of thousands of years before the industrial age rewrote the story."),
        p("Africa — the cradle of the human story — holds more of that wisdom than anywhere else on earth. The First People of Southern Africa were among its most profound keepers. And while that culture was fractured almost beyond recognition, something persists. In the plants. In the land. In the hands of the people who still remember."),
        p("Bushman's Blessing is here for this moment — to carry what endures, forward. As faithfully and as honestly as we can, so that what the first humans understood about being alive together can find its way back into the world."),
        p("Kanna is where we begin. And through it — the fire, the togetherness, the presence, the feeling of being genuinely alive with other people — is what we are carrying back.")
      ),
    }

    const updated = await client.entry.update({ ...ctx, entryId: 'about-page' }, entry)
    await client.entry.publish({ ...ctx, entryId: 'about-page' }, updated)
    console.log('✓  About page updated and published')
  } catch (err) {
    console.error('✗  Failed:', err.message)
  }
}

run()
