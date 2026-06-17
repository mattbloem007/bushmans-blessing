import React, { useRef } from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/Layout'
import RichText from '../components/RichText'
import EyeSymbol from '../components/icons/EyeSymbol'
import { useInView } from '../hooks/useInView'

function FeaturedQuote({ authorName, location, story, delay = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref)
  return (
    <div
      ref={ref}
      className={`bg-white/5 border border-white/10 rounded-lg p-8 fade-up ${delay} ${inView ? 'in-view' : ''}`}
    >
      <p className="text-dust-grey-100 italic leading-relaxed mb-6" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem' }}>
        "{story}"
      </p>
      <div>
        <span className="text-rusty-spice-500 font-medium text-sm">{authorName}</span>
        {location && (
          <span className="text-dust-grey-600 text-sm"> — {location}</span>
        )}
      </div>
    </div>
  )
}

export default function HomePage({ data }) {
  const page = data.contentfulPage
  const experiences = data.allContentfulExperience.nodes

  const introRef = useRef(null)
  const introInView = useInView(introRef)

  const expRef = useRef(null)
  const expInView = useInView(expRef)

  return (
    <Layout heroPage>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center text-center px-6"
        style={{
          background: 'linear-gradient(160deg, var(--color-black-950) 0%, var(--color-black-900) 60%, color-mix(in srgb, var(--color-saddle-brown-500) 25%, var(--color-black-900)) 100%)',
        }}
      >
        {/* Decorative eye symbol */}
        <EyeSymbol
          size={320}
          color="#fe5101"
          className="absolute inset-0 m-auto opacity-5 pointer-events-none"
        />

        <div className="relative max-w-4xl mx-auto pt-24">
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-6 font-medium">
            Sceletium tortuosum · Kanna · Kougoed
          </p>
          <h1
            className="text-dust-grey-50 mb-6"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              lineHeight: '1.1',
              fontWeight: 600,
            }}
          >
            {page?.heroHeading}
          </h1>
          <p className="text-dust-grey-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {page?.heroSubheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/kanna"
              className="inline-block bg-rusty-spice-500 hover:bg-rusty-spice-600 text-white font-medium px-8 py-4 rounded transition-colors no-underline text-sm uppercase tracking-widest"
            >
              Discover Kanna
            </Link>
            <Link
              to="/experiences"
              className="inline-block border border-dust-grey-200/40 hover:border-rusty-spice-500 text-dust-grey-200 hover:text-rusty-spice-500 font-medium px-8 py-4 rounded transition-colors no-underline text-sm uppercase tracking-widest"
            >
              Read Stories
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dust-grey-600">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-dust-grey-600 to-transparent" />
        </div>
      </section>

      {/* ── Introduction ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-dust-grey-50 px-6">
        <div
          ref={introRef}
          className={`max-w-3xl mx-auto fade-up ${introInView ? 'in-view' : ''}`}
        >
          {page?.bodyContent && (
            <RichText
              content={page.bodyContent}
              className="text-lg leading-relaxed"
            />
          )}
        </div>

        {/* Eye symbol divider */}
        <div className="flex justify-center mt-16">
          <EyeSymbol size={48} color="#d0672f" />
        </div>
      </section>

      {/* ── Featured Experiences ──────────────────────────────────────────── */}
      {experiences.length > 0 && (
        <section
          className="grain py-24 md:py-32 px-6"
          style={{ background: 'var(--color-black-900)' }}
        >
          <div className="max-w-6xl mx-auto">
            <div
              ref={expRef}
              className={`text-center mb-16 fade-up ${expInView ? 'in-view' : ''}`}
            >
              <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-4">Community</p>
              <h2
                className="text-dust-grey-50"
                style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                What People Are Saying
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {experiences.map((exp, i) => (
                <FeaturedQuote
                  key={i}
                  authorName={exp.authorName}
                  location={exp.location}
                  story={exp.story?.story || ''}
                  delay={i === 1 ? 'delay-1' : i === 2 ? 'delay-2' : ''}
                />
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/experiences"
                className="inline-block border border-rusty-spice-500/60 hover:border-rusty-spice-500 text-rusty-spice-500 hover:bg-rusty-spice-500 hover:text-white font-medium px-8 py-3 rounded transition-all no-underline text-sm uppercase tracking-widest"
              >
                Share Your Story
              </Link>
            </div>
          </div>
        </section>
      )}
    </Layout>
  )
}

export const query = graphql`
  query HomePageQuery {
    contentfulPage(slug: { eq: "/" }) {
      heroHeading
      heroSubheading
      bodyContent {
        raw
      }
    }
    allContentfulExperience(filter: { featured: { eq: true } }) {
      nodes {
        authorName
        location
        story { story }
      }
    }
  }
`
