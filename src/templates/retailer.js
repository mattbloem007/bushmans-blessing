import React from 'react'
import { graphql, Link } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import Layout from '../components/Layout'
import Seo from '../components/Seo'
import KannaSymbol from '../components/icons/KannaSymbol'
import WavyDivider from '../components/WavyDivider'
import BuyNowButton from '../components/BuyNowButton'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default function RetailerPage({ data }) {
  const retailer = data.contentfulRetailer
  const product = data.allContentfulProduct.nodes[0]
  const image = getImage(product?.productImage)
  const price = retailer.priceOverrideInCents || product?.priceInCents

  return (
    <Layout heroPage>
      <section
        className="relative min-h-screen flex items-center justify-center text-center px-6"
        style={{
          background: 'linear-gradient(160deg, var(--color-black-950) 0%, var(--color-black-900) 70%, color-mix(in srgb, var(--color-rusty-spice-600) 15%, var(--color-black-900)) 100%)',
        }}
      >
        <KannaSymbol
          size={360}
          color="#fe5101"
          className="absolute inset-0 m-auto opacity-5 pointer-events-none"
        />
        <div className="relative max-w-3xl mx-auto pt-24 pb-16">
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-6 font-medium">
            {retailer.name}
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
            Bushman's Blessing
          </h1>
          {retailer.tagline && (
            <p className="text-dust-grey-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              {retailer.tagline}
            </p>
          )}

          {product && (
            <div className="max-w-md mx-auto">
              {image && (
                <div className="aspect-square overflow-hidden rounded-sm mb-8">
                  <GatsbyImage image={image} alt={product.name} className="w-full h-full" />
                </div>
              )}
              <h2
                className="text-dust-grey-50 mb-2"
                style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
              >
                {product.name}
              </h2>
              <p className="text-dust-grey-200 text-xl mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                {formatPrice(price)}
              </p>
              <BuyNowButton
                slug={product.slug}
                retailerSlug={retailer.slug}
                disabled={product.inStock === false}
                className="bg-rusty-spice-500 hover:bg-rusty-spice-600 disabled:opacity-50 text-white font-medium px-8 py-4 rounded transition-colors uppercase tracking-widest text-sm"
              >
                {product.inStock === false ? 'Out of Stock' : 'Buy Now'}
              </BuyNowButton>
            </div>
          )}

          <div className="mt-14 opacity-15">
            <WavyDivider color="var(--color-dust-grey-200)" />
          </div>
          <p className="mt-8 text-dust-grey-200 text-xs">
            Not in {retailer.name}? <Link to="/shop" className="underline hover:text-rusty-spice-500">Visit the main store</Link>
          </p>
        </div>
      </section>
    </Layout>
  )
}

export function Head({ data, location }) {
  const site = data.site.siteMetadata
  const retailer = data.contentfulRetailer
  const title = `${retailer.name} | ${site.title}`
  const description = retailer.tagline || site.description
  const canonical = `${site.siteUrl}${location.pathname}`
  return <Seo title={title} description={description} canonical={canonical} />
}

export const query = graphql`
  query RetailerPageQuery($slug: String!) {
    site {
      siteMetadata { title siteUrl description }
    }
    contentfulRetailer(slug: { eq: $slug }) {
      name
      slug
      tagline
      priceOverrideInCents
    }
    allContentfulProduct(limit: 1, filter: { inStock: { eq: true } }) {
      nodes {
        name
        slug
        priceInCents
        inStock
        productImage {
          gatsbyImageData(width: 600, placeholder: BLURRED)
        }
      }
    }
  }
`
