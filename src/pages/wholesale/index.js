import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../../components/Layout'
import Seo from '../../components/Seo'
import KannaSymbol from '../../components/icons/KannaSymbol'
import WavyDivider from '../../components/WavyDivider'

// Pricing is deliberately not shown here — it's only sent to applicants
// once their application is approved (see wholesale-approve.js), so they
// can decide whether to move forward before it's public.
const SKUS = [
  { name: '500ml Bulk', detail: 'Unbottled & unlabelled' },
  { name: '1L Bulk', detail: 'Unbottled & unlabelled' },
  { name: '5ml Labelled Case', detail: 'Pre-labelled, sold per bottle — 30 minimum' },
]

export default function WholesalePage() {
  return (
    <Layout heroPage>
      <section
        className="relative min-h-[60vh] flex items-center justify-center text-center px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, var(--color-black-950) 0%, var(--color-black-900) 70%, color-mix(in srgb, var(--color-rusty-spice-600) 15%, var(--color-black-900)) 100%)',
        }}
      >
        <KannaSymbol size={360} color="#fe5101" className="absolute inset-0 m-auto opacity-5 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto pt-28 pb-16">
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-6 font-medium">
            Wholesale
          </p>
          <h1
            className="text-dust-grey-50 mb-6"
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: '1.1', fontWeight: 600 }}
          >
            Bring Kanna to your brand.
          </h1>
          <p className="text-dust-grey-200 text-lg leading-relaxed max-w-xl mx-auto">
            Bulk kanna, unbottled and unlabelled for your own packaging, or pre-labelled 5ml bottles ready to sell as-is.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6 bg-dust-grey-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 md:grid-cols-3 mb-16">
            {SKUS.map(sku => (
              <div key={sku.name} className="bg-white border border-dust-grey-200 rounded-sm p-8 text-center">
                <h2
                  className="text-dust-grey-950 mb-2"
                  style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}
                >
                  {sku.name}
                </h2>
                <p className="text-dust-grey-600 text-sm">{sku.detail}</p>
              </div>
            ))}
          </div>

          <div className="mb-12 opacity-15">
            <WavyDivider color="var(--color-dust-grey-950)" />
          </div>

          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2
              className="text-dust-grey-950 mb-4"
              style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
            >
              One story, many bottles.
            </h2>
            <p className="text-dust-grey-800 leading-relaxed">
              If you're repackaging our bulk kanna under your own brand, we'd love a mention of
              Bushman's Blessing on your label or packaging — something like "Kanna sourced in
              partnership with Bushman's Blessing." It's not a requirement, just an invitation to
              work from the same philosophy.
            </p>
          </div>

          <div className="max-w-md mx-auto text-center">
            <p className="text-dust-grey-800 mb-6">
              Pricing is shared once your application is reviewed, so you can decide if it's a fit
              before setting up an account.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/wholesale/apply"
                className="bg-rusty-spice-500 hover:bg-rusty-spice-600 text-white font-medium px-8 py-4 rounded transition-colors uppercase tracking-widest text-sm no-underline"
              >
                Apply for Access
              </Link>
              <Link
                to="/wholesale/login"
                className="border border-dust-grey-950 text-dust-grey-950 hover:bg-dust-grey-950 hover:text-white font-medium px-8 py-4 rounded transition-colors uppercase tracking-widest text-sm no-underline"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export function Head({ data, location }) {
  const site = data.site.siteMetadata
  const canonical = `${site.siteUrl}${location.pathname}`
  return (
    <Seo
      title={`Wholesale | ${site.title}`}
      description="Bulk kanna for your own brand, and pre-labelled 5ml cases — wholesale access by verified account."
      canonical={canonical}
    />
  )
}

export const query = graphql`
  query WholesalePageQuery {
    site {
      siteMetadata { title siteUrl description }
    }
  }
`
