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
    const entry = await client.entry.get({ ...ctx, entryId: 'home-page' })
    entry.fields.bodyContent = {
      'en-US': doc(
        p("Of all the relationships between human and plant, Kanna's may be the oldest."),
        p("In the sun-scorched desert of the Karoo, this resilient succulent has been companion to the First People of this land since before history had a language to record it. Fermented with care, dried in open sun, passed between hands in the firelight — Kanna was medicine for the things that matter most: for gathering close, for softening into real presence with one another, for feeling the kind of connection that reminds a person they are part of something larger than themselves."),
        p("Kanna holds the oldest stories. In its chemistry and its ancient relationship with the human body, it remembers what we have forgotten to practise."),
        p("Those who first tended it knew something. Not something complicated — something simple, and therefore rare. That togetherness is a practice. That connection to the land and to each other is what keeps a person whole."),
        p("Bushman's Blessing is a bridge to that knowing. Born from deep respect for the wisdom that lives in this medicine and the land it comes from, and built in partnership with Mantis Collective — a South African alliance of healers and plant keepers dedicated to protecting, preserving, and empowering the indigenous plant wisdom of this land and the communities who carry it."),
        p("Kanna is the thread. We are here to follow it.")
      ),
    }
    const updated = await client.entry.update({ ...ctx, entryId: 'home-page' }, entry)
    await client.entry.publish({ ...ctx, entryId: 'home-page' }, updated)
    console.log('✓  Home page intro updated and published')
  } catch (err) {
    console.error('✗  Failed:', err.message)
  }
}

run()
