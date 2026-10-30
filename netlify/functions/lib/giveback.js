// Mantis Collective's per-unit community giveback (currently the "Vee/Ra
// Botanicals" Stripe account) — shared by both create-checkout-session.js
// (main site) and create-retailer-checkout-session.js (retailer
// storefronts), so the two can't drift to different amounts.
const MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID = process.env.MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID

const COMMUNITY_GIVEBACK_CENTS_BY_SLUG = {
  'kanna-tincture': 400,
}

// Wholesale's giveback is per-unit too, but at different (lower, per-order-
// size) rates than retail, so it's a separate table keyed by the
// wholesaleProduct slugs rather than sharing COMMUNITY_GIVEBACK_CENTS_BY_SLUG:
//   5ml labelled bottle -> €2/bottle
//   500ml bulk          -> €100/unit (that bulk unit repackages into ~100
//                           5ml bottles, so this works out to €1/bottle)
//   1L bulk              -> €150/unit (~200 bottles, €0.75/bottle)
const WHOLESALE_GIVEBACK_CENTS_BY_SLUG = {
  'kanna-5ml-labelled-case': 200,
  'kanna-bulk-500ml': 10000,
  'kanna-bulk-1l': 15000,
}

module.exports = {
  MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID,
  COMMUNITY_GIVEBACK_CENTS_BY_SLUG,
  WHOLESALE_GIVEBACK_CENTS_BY_SLUG,
}
