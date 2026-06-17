import React, { useRef } from 'react'
import { graphql } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import Layout from '../components/Layout'
import RichText from '../components/RichText'
import EyeSymbol from '../components/icons/EyeSymbol'
import ElandSilhouette from '../components/icons/ElandSilhouette'
import { useInView } from '../hooks/useInView'

export default function KannaPage({ data }) {
  const page = data.contentfulKannaPage
  const productImages = page?.productImages || []

  const traditRef = useRef(null)
  const traditInView = useInView(traditRef)

  const scienceRef = useRef(null)
  const scienceInView = useInView(scienceRef)

  const spiritRef = useRef(null)
  const spiritInView = useInView(spiritRef)

  return (
    <Layout heroPage>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center text-center px-6"
        style={{
          background: 'linear-gradient(160deg, var(--color-black-950) 0%, var(--color-black-900) 70%, color-mix(in srgb, var(--color-rusty-spice-600) 15%, var(--color-black-900)) 100%)',
        }}
      >
        <EyeSymbol
          size={400}
          color="#fe5101"
          className="absolute inset-0 m-auto opacity-5 pointer-events-none"
        />
        <div className="relative max-w-4xl mx-auto pt-28 pb-16">
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-6 font-medium">
            Sceletium tortuosum
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
          <p className="text-dust-grey-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {page?.heroSubheading}
          </p>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center text-dust-grey-600">
          <p className="text-xs uppercase tracking-[0.2em] mb-2">The Story</p>
          <div className="w-px h-12 bg-gradient-to-b from-dust-grey-600 to-transparent mx-auto" />
        </div>
      </section>

      {/* ── Traditional Use ──────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-dust-grey-50">
        <div
          ref={traditRef}
          className={`max-w-6xl mx-auto fade-up ${traditInView ? 'in-view' : ''}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-4 font-medium">
                Chapter One
              </p>
              <h2
                className="text-dust-grey-950 mb-8"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  lineHeight: '1.2',
                }}
              >
                The Ancestral Medicine
              </h2>
              {page?.traditionalUse && (
                <RichText content={page.traditionalUse} className="text-base md:text-lg" />
              )}
            </div>
            <div className="flex justify-center lg:justify-end">
              <ElandSilhouette size={260} color="#d0672f" className="opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Science Section ───────────────────────────────────────────────── */}
      <section
        className="grain py-24 md:py-32 px-6"
        style={{ background: 'var(--color-black-900)' }}
      >
        <div
          ref={scienceRef}
          className={`max-w-6xl mx-auto fade-up ${scienceInView ? 'in-view' : ''}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <EyeSymbol size={180} color="#fe5101" className="opacity-60" />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-4 font-medium">
                Chapter Two
              </p>
              <h2
                className="text-dust-grey-50 mb-8"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  lineHeight: '1.2',
                }}
              >
                How Kanna Speaks to the Cell
              </h2>
              {page?.scienceSection && (
                <RichText
                  content={page.scienceSection}
                  className="text-base md:text-lg [&_p]:text-dust-grey-200"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Spiritual Section ─────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-dust-grey-50">
        <div
          ref={spiritRef}
          className={`max-w-3xl mx-auto text-center fade-up ${spiritInView ? 'in-view' : ''}`}
        >
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-4 font-medium">
            Chapter Three
          </p>
          <h2
            className="text-dust-grey-950 mb-12"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              lineHeight: '1.2',
            }}
          >
            Slow Down. Come Home.
          </h2>
          {page?.spiritualSection && (
            <RichText
              content={page.spiritualSection}
              className="text-left text-base md:text-lg"
            />
          )}
        </div>
      </section>

      {/* ── Product Gallery ───────────────────────────────────────────────── */}
      {productImages.length > 0 && (
        <section className="py-16 px-6 bg-dust-grey-100">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-center text-dust-grey-950 mb-12"
              style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}
            >
              The Plant
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productImages.map((img, i) => {
                const image = getImage(img)
                return image ? (
                  <GatsbyImage
                    key={i}
                    image={image}
                    alt={img.title || ''}
                    className="rounded-md"
                  />
                ) : null
              })}
            </div>
          </div>
        </section>
      )}
    </Layout>
  )
}

export const query = graphql`
  query KannaPageQuery {
    contentfulKannaPage(slug: { eq: "/kanna" }) {
      heroHeading
      heroSubheading
      traditionalUse { raw }
      scienceSection { raw }
      spiritualSection { raw }
      productImages {
        gatsbyImageData(width: 800, placeholder: BLURRED)
        title
      }
    }
  }
`
