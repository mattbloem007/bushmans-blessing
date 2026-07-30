import React, { useRef } from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/Layout'
import Seo from '../components/Seo'
import KannaSymbol from '../components/icons/KannaSymbol'
import { useInView } from '../hooks/useInView'

export default function ContactPage({ data }) {
  const settings = data.contentfulSiteSettings

  const bodyRef = useRef(null)
  const bodyInView = useInView(bodyRef)

  return (
    <Layout heroPage>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[50vh] flex items-center justify-center text-center px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, var(--color-black-950) 0%, var(--color-black-900) 100%)',
        }}
      >
        <div className="relative max-w-2xl mx-auto pt-28 pb-16">
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-6 font-medium">
            Get In Touch
          </p>
          <h1
            className="text-dust-grey-50 mb-6"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              lineHeight: '1.1',
              fontWeight: 600,
            }}
          >
            Contact Us
          </h1>
          <p className="text-dust-grey-200 text-lg leading-relaxed">
            Questions about your order, our Kanna, or anything else — we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ── Contact details ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-dust-grey-50">
        <div
          ref={bodyRef}
          className={`max-w-2xl mx-auto text-center fade-up ${bodyInView ? 'in-view' : ''}`}
        >
          <KannaSymbol size={48} color="#d0672f" className="mx-auto mb-10" />

          {settings?.contactEmail && (
            <div className="mb-12">
              <h2
                className="text-dust-grey-950 mb-3"
                style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
              >
                Email Us
              </h2>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="text-rusty-spice-500 hover:text-rusty-spice-600 underline text-lg transition-colors"
              >
                {settings.contactEmail}
              </a>
            </div>
          )}

          <div className="border-t border-dust-grey-950/10 pt-12">
            <h2
              className="text-dust-grey-950 mb-4"
              style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
            >
              Business Details
            </h2>
            <div className="text-dust-grey-800 leading-relaxed space-y-1">
              {settings?.legalBusinessName && <p className="font-medium">{settings.legalBusinessName}</p>}
              {settings?.businessAddress?.businessAddress && (
                <p>{settings.businessAddress.businessAddress}</p>
              )}
              {settings?.vatNumber && <p className="text-dust-grey-600 text-sm mt-3">VAT: {settings.vatNumber}</p>}
              {settings?.kvkNumber && <p className="text-dust-grey-600 text-sm">KvK: {settings.kvkNumber}</p>}
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
      title={`Contact Us | ${site.title}`}
      description="Get in touch with Bushman's Blessing — email us or find our business details here."
      canonical={canonical}
    />
  )
}

export const query = graphql`
  query ContactPageQuery {
    site {
      siteMetadata { title siteUrl description }
    }
    contentfulSiteSettings {
      contactEmail
      legalBusinessName
      businessAddress {
        businessAddress
      }
      vatNumber
      kvkNumber
      countryOfOperation
    }
  }
`
