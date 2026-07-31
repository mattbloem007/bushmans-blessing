import React, { useRef, useState } from 'react'
import { graphql, Link } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import Layout from '../components/Layout'
import Seo from '../components/Seo'
import RichText from '../components/RichText'
import KannaSymbol from '../components/icons/KannaSymbol'
import BushmanFigure from '../components/icons/BushmanFigure'
import RunningSpottedFigure from '../components/icons/RunningSpottedFigure'
import WavyDivider from '../components/WavyDivider'
import { useInView } from '../hooks/useInView'
import { useCart } from '../context/CartContext'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

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

function FeaturedProduct({ product }) {
  const image = getImage(product.productImage)
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCart()
  const ref = useRef(null)
  const inView = useInView(ref)

  const handleAddToCart = () => {
    addItem({
      productId: product.slug,
      slug: product.slug,
      name: product.name,
      image: product.productImage?.url || null,
      unitPriceInCents: product.priceInCents,
      quantity: 1,
      productType: product.productType || 'physical',
    })
    setAdded(true)
    openCart()
  }

  return (
    <section className="py-20 md:py-28 px-6 bg-dust-grey-50">
      <div
        ref={ref}
        className={`max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center fade-up ${inView ? 'in-view' : ''}`}
      >
        {image && (
          <Link to={`/shop/${product.slug}`} className="block">
            <GatsbyImage
              image={image}
              alt={product.productImage?.title || product.name}
              className="rounded-md"
            />
          </Link>
        )}
        <div>
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-4 font-medium">
            Shop
          </p>
          <h2
            className="text-dust-grey-950 mb-3"
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: '1.15' }}
          >
            {product.name}
          </h2>
          <p className="text-dust-grey-600 text-xl mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
            {formatPrice(product.priceInCents)}
          </p>
          {product.description && (
            <RichText content={product.description} className="mb-8" />
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={product.inStock === false}
              className="bg-rusty-spice-500 hover:bg-rusty-spice-600 disabled:opacity-50 text-white font-medium px-8 py-4 rounded transition-colors uppercase tracking-widest text-sm"
            >
              {product.inStock === false ? 'Out of Stock' : added ? 'Added ✓' : 'Add to Cart'}
            </button>
            <Link
              to={`/shop/${product.slug}`}
              className="inline-flex items-center justify-center border border-dust-grey-950/20 hover:border-rusty-spice-500 text-dust-grey-950 hover:text-rusty-spice-500 font-medium px-8 py-4 rounded transition-colors no-underline text-sm uppercase tracking-widest"
            >
              View Details
            </Link>
          </div>
          <p className="text-dust-grey-500 text-xs mt-4 leading-relaxed">
            Botanical preparation, not evaluated for medical use. Not intended to diagnose, treat,
            cure, or prevent any disease.
          </p>
        </div>
      </div>
    </section>
  )
}

function StoryBlock({ heading, text, image, imageAlt, reverse }) {
  const ref = useRef(null)
  const inView = useInView(ref)
  const gatsbyImage = image ? getImage(image) : null
  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center fade-up ${inView ? 'in-view' : ''} ${
        reverse ? 'lg:[&>*:first-child]:order-2' : ''
      }`}
    >
      {gatsbyImage && (
        <GatsbyImage image={gatsbyImage} alt={imageAlt || ''} className="rounded-md" />
      )}
      <div>
        {heading && (
          <h3
            className="text-dust-grey-950 mb-4"
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          >
            {heading}
          </h3>
        )}
        {text &&
          text.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-lg leading-relaxed text-dust-grey-800 mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
      </div>
    </div>
  )
}

export default function HomePage({ data }) {
  const page = data.contentfulPage
  const experiences = data.allContentfulExperience.nodes
  const product = data.allContentfulProduct.nodes[0]

  const storyRef = useRef(null)
  const storyInView = useInView(storyRef)

  const expRef = useRef(null)
  const expInView = useInView(expRef)

  const exploreRef = useRef(null)
  const exploreInView = useInView(exploreRef)

  const storyBlocks = [
    {
      heading: page?.storyBlock1Heading,
      text: page?.storyBlock1Text?.storyBlock1Text,
      image: page?.storyBlock1Image,
    },
    {
      heading: page?.storyBlock2Heading,
      text: page?.storyBlock2Text?.storyBlock2Text,
      image: page?.storyBlock2Image,
    },
    {
      heading: page?.storyBlock3Heading,
      text: page?.storyBlock3Text?.storyBlock3Text,
      image: page?.storyBlock3Image,
    },
  ].filter(block => block.heading || block.text || block.image)

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
        <KannaSymbol
          size={320}
          color="#fe5101"
          className="absolute inset-0 m-auto opacity-5 pointer-events-none"
        />
        <RunningSpottedFigure
          size={200}
          color="#fe5101"
          className="absolute right-10 bottom-10 opacity-[0.05] pointer-events-none"
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
              to="/shop"
              className="inline-block bg-rusty-spice-500 hover:bg-rusty-spice-600 text-white font-medium px-8 py-4 rounded transition-colors no-underline text-sm uppercase tracking-widest"
            >
              Shop Kanna
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
        <div className="absolute bottom-8 left-0 right-0 px-8 opacity-10">
          <WavyDivider color="var(--color-dust-grey-200)" />
        </div>
      </section>

      {/* ── Featured Product ─────────────────────────────────────────────── */}
      {product && <FeaturedProduct product={product} />}

      {/* ── Story ────────────────────────────────────────────────────────── */}
      {storyBlocks.length > 0 && (
        <section className="py-20 md:py-28 px-6 bg-dust-grey-100">
          <div ref={storyRef} className="max-w-5xl mx-auto flex flex-col gap-20 md:gap-28">
            {storyBlocks.map((block, i) => (
              <StoryBlock
                key={i}
                heading={block.heading}
                text={block.text}
                image={block.image}
                imageAlt={block.heading}
                reverse={i % 2 === 1}
              />
            ))}
          </div>

          <div className="mt-20 opacity-20 max-w-5xl mx-auto">
            <WavyDivider color="var(--color-saddle-brown-500)" />
          </div>
          <div className="flex justify-center mt-10">
            <KannaSymbol size={48} color="#d0672f" />
          </div>
        </section>
      )}

      {/* ── Featured Experiences ──────────────────────────────────────────── */}
      {experiences.length > 0 && (
        <section
          className="grain py-24 md:py-32 px-6 relative overflow-hidden"
          style={{ background: 'var(--color-black-900)' }}
        >
          {/* Decorative layer — inline style overrides .grain > * position:relative */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <BushmanFigure
              size={220}
              color="#fe5101"
              className="absolute bottom-6 left-6 opacity-[0.06]"
            />
            <div className="absolute top-10 right-10 opacity-[0.04]" style={{ transform: 'scaleX(-1)' }}>
              <BushmanFigure size={160} color="#fe5101" />
            </div>
          </div>
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
              <p className="text-dust-grey-500 text-xs mt-6 max-w-md mx-auto leading-relaxed">
                Individual experiences shared by our community. Results vary and are not evidence of
                medical effect.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Explore Further ─────────────────────────────────────────────────── */}
      {page?.exploreMoreText && (
        <section className="py-20 md:py-28 px-6 bg-dust-grey-50">
          <div
            ref={exploreRef}
            className={`max-w-2xl mx-auto text-center fade-up ${exploreInView ? 'in-view' : ''}`}
          >
            <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-4 font-medium">
              Continue Reading
            </p>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
              <RichText
                content={page.exploreMoreText}
                className="[&_p]:mb-0 [&_p]:text-dust-grey-950"
              />
            </div>
            <div className="flex justify-center my-10">
              <KannaSymbol size={40} color="#d0672f" />
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/about"
                className="inline-block border border-dust-grey-950/20 hover:border-rusty-spice-500 text-dust-grey-800 hover:text-rusty-spice-500 font-medium px-6 py-3 rounded transition-colors no-underline text-sm uppercase tracking-widest"
              >
                About
              </Link>
              <Link
                to="/kanna"
                className="inline-block border border-dust-grey-950/20 hover:border-rusty-spice-500 text-dust-grey-800 hover:text-rusty-spice-500 font-medium px-6 py-3 rounded transition-colors no-underline text-sm uppercase tracking-widest"
              >
                Kanna's Story
              </Link>
              <Link
                to="/blog"
                className="inline-block border border-dust-grey-950/20 hover:border-rusty-spice-500 text-dust-grey-800 hover:text-rusty-spice-500 font-medium px-6 py-3 rounded transition-colors no-underline text-sm uppercase tracking-widest"
              >
                Blog
              </Link>
            </nav>
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
  query HomePageQuery {
    site {
      siteMetadata { title siteUrl description }
    }
    contentfulPage(slug: { eq: "/" }) {
      heroHeading
      heroSubheading
      storyBlock1Heading
      storyBlock1Text {
        storyBlock1Text
      }
      storyBlock1Image {
        gatsbyImageData(width: 700, placeholder: BLURRED)
      }
      storyBlock2Heading
      storyBlock2Text {
        storyBlock2Text
      }
      storyBlock2Image {
        gatsbyImageData(width: 700, placeholder: BLURRED)
      }
      storyBlock3Heading
      storyBlock3Text {
        storyBlock3Text
      }
      storyBlock3Image {
        gatsbyImageData(width: 700, placeholder: BLURRED)
      }
      exploreMoreText {
        raw
      }
      seoTitle
      seoDescription
    }
    allContentfulProduct(limit: 1, filter: { inStock: { eq: true } }) {
      nodes {
        name
        slug
        productType
        priceInCents
        inStock
        description { raw }
        productImage {
          gatsbyImageData(width: 700, placeholder: BLURRED)
          url
          title
        }
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
