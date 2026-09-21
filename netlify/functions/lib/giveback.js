// Mantis Collective's per-unit community giveback (currently the "Vee/Ra
// Botanicals" Stripe account) — shared by both create-checkout-session.js
// (main site) and create-retailer-checkout-session.js (retailer
// storefronts), so the two can't drift to different amounts.
const MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID = process.env.MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID

const COMMUNITY_GIVEBACK_CENTS_BY_SLUG = {
  'kanna-tincture': 400,
}

module.exports = { MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID, COMMUNITY_GIVEBACK_CENTS_BY_SLUG }
