import React, { useRef } from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/Layout'
import Seo from '../components/Seo'
import RichText from '../components/RichText'
import KannaSymbol from '../components/icons/KannaSymbol'
import ElandSilhouette from '../components/icons/ElandSilhouette'
import BushmanFigure from '../components/icons/BushmanFigure'
import LeapingHornedFigure from '../components/icons/LeapingHornedFigure'
import WavyDivider from '../components/WavyDivider'
import { useInView } from '../hooks/useInView'
import BuyNowButton from '../components/BuyNowButton'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default function AboutPage({ data }) {
  const page = data.contentfulPage
  const product = data.allContentfulProduct.nodes[0]

  const storyRef = useRef(null)
  const storyInView = useInView(storyRef)

  const quoteRef = useRef(null)
  const quoteInView = useInView(quoteRef)

  const buyRef = useRef(null)
  const buyInView = useInView(buyRef)

  return (
    <Layout heroPage>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center text-center px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, var(--color-black-950) 0%, var(--color-black-900) 100%)',
        }}
      >
        {/* Eland decorative */}
        <ElandSilhouette
          size={300}
          color="#fe5101"
          className="absolute right-0 bottom-0 opacity-5 pointer-events-none"
        />
        {/* San figures in background */}
        <BushmanFigure
          size={180}
          color="#fe5101"
          className="absolute left-8 bottom-12 opacity-[0.07] pointer-events-none"
        />
        <BushmanFigure
          size={120}
          color="#fe5101"
          className="absolute left-36 bottom-20 opacity-[0.04] pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />
        <LeapingHornedFigure
          size={200}
          color="#fe5101"
          className="absolute right-10 top-10 opacity-[0.05] pointer-events-none"
        />

        <div className="relative max-w-3xl mx-auto pt-28 pb-16">
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-6 font-medium">
            Our Story
          </p>
          <h1
            className="text-dust-grey-50 mb-6"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: '1.1',
              fontWeight: 600,
            }}
          >
            {page?.heroHeading}
          </h1>
          <p className="text-dust-grey-200 text-lg md:text-xl leading-relaxed">
            {page?.heroSubheading}
          </p>
        </div>
      </section>

      {/* ── Story body ───────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-dust-grey-50 px-6">
        <div
          ref={storyRef}
          className={`max-w-3xl mx-auto fade-up ${storyInView ? 'in-view' : ''}`}
        >
          {page?.bodyContent && (
            <RichText
              content={page.bodyContent}
              className="text-lg leading-relaxed"
            />
          )}

          {/* Wavy ornament before pull-quote section */}
          <div className="mt-10 opacity-20">
            <WavyDivider color="var(--color-saddle-brown-500)" />
          </div>
        </div>
      </section>

      {/* ── Pull quote ───────────────────────────────────────────────────── */}
      <section
        className="grain py-24 md:py-32 px-6 relative overflow-hidden"
        style={{ background: 'var(--color-black-900)' }}
      >
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <BushmanFigure
            size={260}
            color="#fe5101"
            className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-[0.05]"
          />
        </div>
        <div
          ref={quoteRef}
          className={`max-w-4xl mx-auto text-center fade-up ${quoteInView ? 'in-view' : ''}`}
        >
          <KannaSymbol size={56} color="#fe5101" className="mx-auto mb-10" />
          <blockquote
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: '1.2',
              fontStyle: 'italic',
              color: 'var(--color-dust-grey-50)',
            }}
          >
            "The oldest culture.<br />The oldest tradition."
          </blockquote>
          <p className="text-dust-grey-600 text-sm uppercase tracking-widest mt-8">
            San Bushmen · Southern Africa · 100,000+ years
          </p>
        </div>
      </section>

      {/* ── Buy Now CTA ──────────────────────────────────────────────────── */}
      {product && (
        <section className="py-20 md:py-28 px-6 bg-dust-grey-50 text-center">
          <div
            ref={buyRef}
            className={`max-w-xl mx-auto fade-up ${buyInView ? 'in-view' : ''}`}
          >
            <KannaSymbol size={40} color="#d0672f" className="mx-auto mb-6" />
            <h2
              className="text-dust-grey-950 mb-4"
              style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
            >
              Experience {product.name}
            </h2>
            <p className="text-dust-grey-600 text-xl mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
              {formatPrice(product.priceInCents)}
            </p>
            <BuyNowButton
              slug={product.slug}
              disabled={product.inStock === false}
              className="bg-rusty-spice-500 hover:bg-rusty-spice-600 disabled:opacity-50 text-white font-medium px-8 py-4 rounded transition-colors uppercase tracking-widest text-sm"
            >
              {product.inStock === false ? 'Out of Stock' : 'Buy Now'}
            </BuyNowButton>
          </div>
        </section>
      )}
    </Layout>
  )
}

export function Head({ data, location }) {
  const site = data.site.siteMetadata
  const page = data.contentfulPage
  const title = page?.seoTitle || site.title
  const description = page?.seoDescription || site.description
  const canonical = `${site.siteUrl}${location.pathname}`
  return <Seo title={title} description={description} canonical={canonical} />
}

export const query = graphql`
  query AboutPageQuery {
    site {
      siteMetadata { title siteUrl description }
    }
    contentfulPage(slug: { eq: "/about" }) {
      heroHeading
      heroSubheading
      bodyContent {
        raw
      }
      seoTitle
      seoDescription
    }
    allContentfulProduct(limit: 1, filter: { inStock: { eq: true } }) {
      nodes {
        name
        slug
        priceInCents
        inStock
      }
    }
  }
`
