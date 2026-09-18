import retailerMap from './data/retailer-map.js'

// Runs at the CDN edge on every request to "/" (the QR-code/canonical
// homepage URL) — before the static homepage is served, so unmatched
// visitors get it with zero added latency. A visitor whose country matches
// an active exclusive retailer is redirected to that retailer's storefront;
// everyone else passes straight through untouched.
//
// retailer-map.json is generated at build time by gatsby-node.js's
// onPostBuild from the Contentful "Retailer" entries — it can't be looked
// up here per-request without adding a network call (and its latency) to
// every single homepage visit.
export default async (request, context) => {
  const countryCode = context.geo?.country?.code
  const slug = countryCode && retailerMap[countryCode]

  if (slug) {
    return Response.redirect(new URL(`/retailers/${slug}/`, request.url), 302)
  }

  return context.next()
}

export const config = {
  path: '/',
}
