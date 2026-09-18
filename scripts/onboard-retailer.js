#!/usr/bin/env node
/**
 * Creates a Stripe Connect "standard" account for a new exclusive regional
 * retailer and prints a hosted onboarding link for them to complete
 * themselves (business details, bank account, ToS acceptance — Stripe's
 * own flow, not something this platform collects or stores).
 *
 * Standard accounts (not Express/Custom) match the direct-charge model
 * this program uses: the retailer is merchant of record, fully owns their
 * own Stripe dashboard, and is liable for their own charges/refunds/tax.
 *
 * Run against whichever STRIPE_SECRET_KEY is active — .env.development's
 * test key by default, or override for a real retailer going live:
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/onboard-retailer.js
 *
 * After the retailer finishes onboarding, take the printed account id
 * (acct_...) and add it as `stripeAccountId` on their new Retailer entry
 * in Contentful, along with their slug/countries/pricing.
 */

require('dotenv').config({ path: '.env.development' })
const Stripe = require('stripe')

const SITE_URL = process.env.URL || process.env.DEPLOY_URL || 'https://bushmansblessing.com'

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY must be set')
  process.exit(1)
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

async function run() {
  const account = await stripe.accounts.create({ type: 'standard' })
  console.log(`\n  ✓  Created Stripe Connect account: ${account.id}`)

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${SITE_URL}/admin/retailer-onboarding-refresh`,
    return_url: `${SITE_URL}/admin/retailer-onboarding-done`,
    type: 'account_onboarding',
  })

  console.log(`\n  Send this link to the retailer to complete onboarding (expires in a few minutes):\n`)
  console.log(`  ${accountLink.url}\n`)
  console.log(`  Once they're done, add this as "Stripe Connect Account ID" on their Retailer entry:`)
  console.log(`  ${account.id}\n`)
}

run().catch(err => {
  console.error('\nScript failed:', err.message || err)
  process.exit(1)
})
