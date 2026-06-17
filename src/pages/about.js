import React, { useRef } from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/Layout'
import RichText from '../components/RichText'
import EyeSymbol from '../components/icons/EyeSymbol'
import ElandSilhouette from '../components/icons/ElandSilhouette'
import { useInView } from '../hooks/useInView'

export default function AboutPage({ data }) {
  const page = data.contentfulPage

  const storyRef = useRef(null)
  const storyInView = useInView(storyRef)

  const quoteRef = useRef(null)
  const quoteInView = useInView(quoteRef)

  return (
    <Layout heroPage>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center text-center px-6"
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
        </div>
      </section>

      {/* ── Pull quote ───────────────────────────────────────────────────── */}
      <section
        className="grain py-24 md:py-32 px-6"
        style={{ background: 'var(--color-black-900)' }}
      >
        <div
          ref={quoteRef}
          className={`max-w-4xl mx-auto text-center fade-up ${quoteInView ? 'in-view' : ''}`}
        >
          <EyeSymbol size={56} color="#fe5101" className="mx-auto mb-10" />
          <blockquote
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: '1.2',
              fontStyle: 'italic',
              color: 'var(--color-dust-grey-50)',
            }}
          >
            "The oldest culture.<br />The oldest medicine."
          </blockquote>
          <p className="text-dust-grey-600 text-sm uppercase tracking-widest mt-8">
            San Bushmen · Southern Africa · 100,000+ years
          </p>
        </div>
      </section>
    </Layout>
  )
}

export const query = graphql`
  query AboutPageQuery {
    contentfulPage(slug: { eq: "/about" }) {
      heroHeading
      heroSubheading
      bodyContent {
        raw
      }
    }
  }
`
