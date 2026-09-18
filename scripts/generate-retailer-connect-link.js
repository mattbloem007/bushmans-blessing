#!/usr/bin/env node
/**
 * Prints a "Connect with Stripe" OAuth link for a specific retailer.
 * Unlike the old accounts.create() approach, this lets the retailer log
 * into their OWN existing Stripe account and authorize this platform to
 * connect to it — no new Stripe account is created for them. If they
 * don't have one yet, this flow prompts them to create one on Stripe's
 * side before it will let them continue, which is exactly the
 * "must already have or create a real Stripe account first" rule we want.
 *
 * Usage:
 *   node scripts/generate-retailer-connect-link.js <retailer-slug>
 *
 * Run against whichever STRIPE_CONNECT_CLIENT_ID/STRIPE_SECRET_KEY are
 * active — .env.development's test values by default, or override for a
 * real retailer going live:
 *   STRIPE_CONNECT_CLIENT_ID=ca_live_... node scripts/generate-retailer-connect-link.js uk
 *
 * Once the retailer finishes on Stripe's side, they land on
 * stripe-connect-oauth-callback, which shows their new stripeAccountId to
 * copy into their Retailer entry in Contentful.
 */

require('dotenv').config({ path: '.env.development' })

const SITE_URL = process.env.URL || process.env.DEPLOY_URL || 'https://bushmansblessing.com'
const slug = process.argv[2]

if (!slug) {
  console.error('Usage: node scripts/generate-retailer-connect-link.js <retailer-slug>')
  process.exit(1)
}

if (!process.env.STRIPE_CONNECT_CLIENT_ID) {
  console.error('ERROR: STRIPE_CONNECT_CLIENT_ID must be set (from Stripe Dashboard > Settings > Connect > OAuth settings)')
  process.exit(1)
}

// state carries the retailer slug through the round trip to Stripe and
// back, plus a random nonce for basic CSRF hygiene — this is an
// admin-triggered, single-use link, not a public-facing form, so a
// signed/stored token isn't needed.
const nonce = require('crypto').randomBytes(12).toString('hex')
const state = `${slug}:${nonce}`

const redirectUri = `${SITE_URL}/.netlify/functions/stripe-connect-oauth-callback`

const url = new URL('https://connect.stripe.com/oauth/authorize')
url.searchParams.set('response_type', 'code')
url.searchParams.set('client_id', process.env.STRIPE_CONNECT_CLIENT_ID)
url.searchParams.set('scope', 'read_write')
url.searchParams.set('redirect_uri', redirectUri)
url.searchParams.set('state', state)

console.log(`\n  Send this link to the "${slug}" retailer to connect their existing Stripe account:\n`)
console.log(`  ${url.toString()}\n`)
console.log(`  redirect_uri must be registered exactly in Stripe Dashboard > Settings > Connect > OAuth settings:`)
console.log(`  ${redirectUri}\n`)
