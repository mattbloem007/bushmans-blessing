const { getStore } = require('@netlify/blobs')
const config = require('../../../shared/kanna-online.json')

// Single source of truth for the temporary Kanna Online page lives in
// shared/kanna-online.json — the Gatsby page imports the same file, so the
// prices shown and the prices charged can never drift apart.
const PARTICIPANT_STORE = 'kanna-experience-participants'

// Same explicit-credentials workaround as lib/wholesaleAuth.js — this site's
// function runtime doesn't populate NETLIFY_BLOBS_CONTEXT.
function participantStore() {
  if (process.env.SITE_ID && process.env.NETLIFY_BLOBS_TOKEN) {
    return getStore({
      name: PARTICIPANT_STORE,
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN,
    })
  }
  return getStore(PARTICIPANT_STORE)
}

function getOption(id) {
  return config.options.find(option => option.id === id) || null
}

function bundleCutoffPassed(now = Date.now()) {
  return now > Date.parse(config.bundleCutoff.atISO)
}

function formatEuro(cents) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function participantFromSession(session, option) {
  const address = session.shipping_details?.address || session.customer_details?.address || null
  return {
    sessionId: session.id,
    email: (session.customer_details?.email || session.metadata?.participantEmail || '').toLowerCase(),
    name: session.customer_details?.name || '',
    optionId: option.id,
    optionLabel: option.label,
    amountPaid: session.amount_total,
    currency: session.currency,
    purchasedAt: new Date().toISOString(),
    requiresShipping: option.requiresShipping,
    shippingAddress: option.requiresShipping ? address : null,
    joinLinkSentAt: null,
  }
}

// Keyed by Stripe session so a webhook retry (Stripe delivers at least once)
// can't create a second participant record — or send a second set of emails.
async function recordParticipant(session, option) {
  const store = participantStore()
  const key = `participant:${session.id}`

  const existing = await store.get(key)
  if (existing) {
    return { participant: JSON.parse(existing), duplicate: true }
  }

  const participant = participantFromSession(session, option)
  await store.set(key, JSON.stringify(participant))
  return { participant, duplicate: false }
}

async function listParticipants() {
  const store = participantStore()
  const { blobs } = await store.list({ prefix: 'participant:' })

  const rows = []
  for (const blob of blobs) {
    const raw = await store.get(blob.key)
    if (raw) rows.push(JSON.parse(raw))
  }

  return rows.sort((a, b) => Date.parse(b.purchasedAt) - Date.parse(a.purchasedAt))
}

async function markJoinLinkSent(sessionIds) {
  const store = participantStore()
  const sentAt = new Date().toISOString()

  for (const sessionId of sessionIds) {
    const key = `participant:${sessionId}`
    const raw = await store.get(key)
    if (!raw) continue
    const participant = JSON.parse(raw)
    participant.joinLinkSentAt = sentAt
    await store.set(key, JSON.stringify(participant))
  }
}

module.exports = {
  config,
  getOption,
  bundleCutoffPassed,
  formatEuro,
  recordParticipant,
  listParticipants,
  markJoinLinkSent,
}
