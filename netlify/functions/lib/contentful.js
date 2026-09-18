const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN
const CONTENTFUL_ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'

async function fetchEntryByField(contentType, field, value) {
  const url = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries?content_type=${contentType}&fields.${field}=${encodeURIComponent(value)}&limit=1`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}` },
  })
  if (!res.ok) throw new Error(`Contentful lookup failed for ${contentType} "${value}"`)
  const data = await res.json()
  return data.items?.[0] || null
}

// Re-resolves a cart item against Contentful by slug — the client's
// submitted price/type is never trusted for the actual Stripe line item.
async function fetchProductBySlug(slug) {
  const entry = await fetchEntryByField('product', 'slug', slug)
  if (!entry) return null
  return {
    name: entry.fields.name,
    slug: entry.fields.slug,
    productType: entry.fields.productType || 'physical',
    priceInCents: entry.fields.priceInCents,
    stripePriceId: entry.fields.stripePriceId,
    inStock: entry.fields.inStock !== false,
  }
}

// Resolves an exclusive regional retailer by their page slug (e.g. the
// "netherlands" in /retailers/netherlands/) — used to route checkout to
// their own connected Stripe account instead of the platform account.
async function fetchRetailerBySlug(slug) {
  const entry = await fetchEntryByField('retailer', 'slug', slug)
  if (!entry) return null
  return {
    name: entry.fields.name,
    slug: entry.fields.slug,
    countries: entry.fields.countries || [],
    stripeAccountId: entry.fields.stripeAccountId,
    priceOverrideInCents: entry.fields.priceOverrideInCents ?? null,
    shippingCents: entry.fields.shippingCents || 0,
    active: entry.fields.active !== false,
    totalFeeCents: entry.fields.totalFeeCents || 0,
    perSaleFeePercent: entry.fields.perSaleFeePercent || 0,
    tagline: entry.fields.tagline || null,
  }
}

module.exports = { fetchProductBySlug, fetchRetailerBySlug }
