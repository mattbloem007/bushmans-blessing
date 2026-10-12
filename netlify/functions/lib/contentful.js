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

async function fetchEntries(contentType, query = '') {
  const url = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries?content_type=${contentType}${query}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}` },
  })
  if (!res.ok) throw new Error(`Contentful lookup failed for ${contentType}`)
  const data = await res.json()
  return data.items || []
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

// Resolves one wholesale SKU by slug — used by
// create-wholesale-checkout-session.js to re-validate price and minimum
// order quantity server-side rather than trusting the portal's cart.
async function fetchWholesaleProductBySlug(slug) {
  const entry = await fetchEntryByField('wholesaleProduct', 'slug', slug)
  if (!entry) return null
  return {
    name: entry.fields.name,
    slug: entry.fields.slug,
    sizeLabel: entry.fields.sizeLabel || '',
    unitPriceInCents: entry.fields.unitPriceInCents,
    minQuantity: entry.fields.minQuantity || 1,
    unbottled: entry.fields.unbottled === true,
    stripePriceId: entry.fields.stripePriceId,
    active: entry.fields.active !== false,
  }
}

// Returns every active wholesale SKU — used by get-wholesale-products.js to
// populate the gated portal catalog.
async function fetchAllWholesaleProducts() {
  const entries = await fetchEntries('wholesaleProduct')
  return entries
    .map(entry => ({
      name: entry.fields.name,
      slug: entry.fields.slug,
      sizeLabel: entry.fields.sizeLabel || '',
      unitPriceInCents: entry.fields.unitPriceInCents,
      minQuantity: entry.fields.minQuantity || 1,
      unbottled: entry.fields.unbottled === true,
      active: entry.fields.active !== false,
    }))
    .filter(product => product.active)
}

module.exports = {
  fetchProductBySlug,
  fetchRetailerBySlug,
  fetchWholesaleProductBySlug,
  fetchAllWholesaleProducts,
}
