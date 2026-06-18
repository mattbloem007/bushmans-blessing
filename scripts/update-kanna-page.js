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
    const entry = await client.entry.get({ ...ctx, entryId: 'kanna-page' })

    entry.fields.heroHeading = { 'en-US': 'The Plant That Remembers' }
    entry.fields.heroSubheading = { 'en-US': 'Kanna has been companion to the human story for longer than memory holds. Three chapters of what it carries.' }
    entry.fields.seoTitle = { 'en-US': "Kanna / Sceletium tortuosum | Bushman's Blessing" }
    entry.fields.seoDescription = { 'en-US': "The full story of Kanna — the oldest plant medicine known to the First People of Southern Africa, the science behind it, and the invitation it carries into the modern world." }

    entry.fields.traditionalUse = {
      'en-US': doc(
        p("Long before the word \"medicine\" existed, there was a practice."),
        p("In the desert heart of the Karoo and across the sun-scorched plains of Southern Africa, the First People had a relationship with a small, resilient succulent they called Kanna — or Kougoed, meaning \"something to chew.\" The relationship was intimate, practical, and sacred all at once."),
        p("Preparation was an art. Freshly harvested Kanna was fermented — leaves and stems packed together, pressed, and left to undergo a slow, deliberate transformation. Then sun-dried, sometimes for days. The process was as precise as it was ancient: a knowledge kept alive not in books but in practice, passed from hand to hand across generations, held in the bodies of those who worked with the plant."),
        p("The result was chewed slowly — held in the mouth, savoured, shared. Passed between people sitting together in circle. A medicine of gathering. Of conversation. Of the long, unhurried kind of presence that the Bushpeople seemed to understand as the foundation of a life well lived."),
        p("Kanna steadied the body on long hunts. It softened grief. It opened the channels of ceremony and of collective joy. A companion for the full range of human experience — a doorway deeper into life, offered freely among people who knew its value."),
        p("The fermentation technique, the harvesting knowledge, the ceremonial context — these are what Bushman's Blessing works to preserve. Through our partnership with Mantis Collective and the plant keepers of Southern Africa who still carry this tradition, we prepare Kanna as it was always prepared. The old way — because the old way is the right way.")
      ),
    }

    entry.fields.scienceSection = {
      'en-US': doc(
        p("Before there was a nervous system, there was a membrane."),
        p("The very first living cells — single, solitary, suspended in the primordial sea — communicated with the world through their outer walls. The membrane was the original sense organ: a permeable boundary deciding what to let in, what to keep out, what to pass along. The world's first act of feeling."),
        p("As life grew more complex and organisms became multicellular, those ancient membrane signals evolved into something extraordinary: nerves. A network of communication so sophisticated it eventually became capable of recognising itself — of wondering where it came from and what it is for."),
        p("Serotonin is part of that story. One of the oldest signalling molecules in nature, it exists in plants, in gut bacteria, in some of the simplest organisms alive today. Long before it was understood as a mood-regulating chemical in the human brain, it was simply a messenger — a way for cells to know they were not alone."),
        p("Kanna's primary alkaloid, mesembrine, interacts directly with this ancient system. It slows the reuptake of serotonin, extending its presence in the spaces between nerve cells — giving the body more time to receive the message that it is safe, that it is held, that the moment can be stayed in."),
        p("But there is something deeper in the plant's story. Sceletium tortuosum has spent millions of years learning to survive the Karoo — one of the harshest, driest environments on earth. The stress resilience encoded in its cells, the ability to endure intense pressure without losing form — this too is part of what the plant carries. And in some quiet, cellular way, that resilience is part of what it offers when shared."),
        p("The science is still catching up to what the First People already knew. But the direction is clear: Kanna speaks to something ancient in us. Something that existed long before the modern world invented the pressures we are now trying to manage.")
      ),
    }

    entry.fields.spiritualSection = {
      'en-US': doc(
        p("The modern world has done something remarkable and strange. It has connected more people to more information, more stimulation, and more of each other than any time in human history — and produced, alongside it, an epidemic of loneliness."),
        p("We carry devices that can summon almost anything in seconds. Our attention is constantly pulled — by notifications, by news cycles, by platforms designed to keep us scrolling. The nervous system, never built for this volume of input, adapts by going slightly numb. And in that numbness, something quietly erodes: the ability to sit with another person and actually be there. Undistracted. Unhurried. Present."),
        p("This is not a small thing to lose. For most of human history, this kind of presence — in circle, in genuine contact with one another — was simply how life was lived."),
        p("Something in the legacy of the First People — in the way Kanna was prepared and shared across thousands of years — speaks directly to this gap. Not as a solution, but as an opening."),
        p("Kanna settles the nervous system's background noise — the low-level vigilance and static that keeps a person slightly removed from the moment, from the room, from the people in it. There is a reason for that static: the modern world is largely built around dopamine — the brain's seeking and reward system, activated by every notification, every scroll, every small hit of novelty. Over time, that constant artificial activation pulls these systems out of their natural balance. Kanna works differently. Mesembrine, its primary alkaloid, supports serotonin — the chemistry of presence, of genuine contentment, of feeling connected to what is already here. Mesembrenone, another key alkaloid, supports healthy dopamine signalling through a separate pathway, helping restore the system's natural rhythm rather than hijacking it. Together, they bring the nervous system back toward equilibrium. In that quieter space, what was always present becomes available again: warmth, real curiosity, the capacity to look at the person across from you and actually see them."),
        p("This is where the medicine connects back to something older than its chemistry. What the First People seemed to live so naturally — full acceptance, deep ease in relation to the Earth and with one another — Kanna carries as its essential frequency. A quiet radiation of joy. The fire. The circle. People genuinely present with each other, with themselves, with the living world around them. The medicine does not manufacture this. It remembers it. And in that remembering, it offers us a way back.")
      ),
    }

    const updated = await client.entry.update({ ...ctx, entryId: 'kanna-page' }, entry)
    await client.entry.publish({ ...ctx, entryId: 'kanna-page' }, updated)
    console.log('✓  Kanna page updated and published')
  } catch (err) {
    console.error('✗  Failed:', err.message)
  }
}

run()
