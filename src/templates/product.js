import React, { useState } from 'react'
import { graphql } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import Layout from '../components/Layout'
import Seo from '../components/Seo'
import RichText from '../components/RichText'
import KannaSymbol from '../components/icons/KannaSymbol'
import WavyDivider from '../components/WavyDivider'
import { useCart } from '../context/CartContext'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default function ProductPage({ data }) {
  const product = data.contentfulProduct
  const image = getImage(product.productImage)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCart()

  const handleAddToCart = () => {
    addItem({
      productId: product.slug,
      slug: product.slug,
      name: product.name,
      image: product.productImage?.url || null,
      unitPriceInCents: product.priceInCents,
      quantity,
      productType: product.productType || 'physical',
    })
    setAdded(true)
    openCart()
  }

  return (
    <Layout heroPage>
      <section
        className="relative min-h-[80vh] flex items-center px-6 py-32"
        style={{
          background: 'linear-gradient(160deg, var(--color-black-950) 0%, var(--color-black-900) 70%, color-mix(in srgb, var(--color-rusty-spice-600) 15%, var(--color-black-900)) 100%)',
        }}
      >
        <KannaSymbol
          size={360}
          color="#fe5101"
          className="absolute inset-0 m-auto opacity-5 pointer-events-none"
        />
        <div className="relative max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {image && (
            <GatsbyImage
              image={image}
              alt={product.productImage?.title || product.name}
              className="rounded-md"
            />
          )}
          <div>
            <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-4 font-medium">
              {product.productType === 'digital' ? 'Digital' : 'Shop'}
            </p>
            <h1
              className="text-dust-grey-50 mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                lineHeight: '1.1',
                fontWeight: 600,
              }}
            >
              {product.name}
            </h1>
            <p
              className="text-dust-grey-50 text-2xl mb-8"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {formatPrice(product.priceInCents)}
            </p>

            {product.description && (
              <RichText
                content={product.description}
                className="[&_p]:text-dust-grey-200 mb-8"
              />
            )}

            {product.inStock === false ? (
              <p className="text-rusty-spice-500 text-sm uppercase tracking-widest">
                Currently out of stock
              </p>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-white/20 rounded">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-12 flex items-center justify-center text-dust-grey-200 hover:text-rusty-spice-500 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-dust-grey-50">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-12 flex items-center justify-center text-dust-grey-200 hover:text-rusty-spice-500 transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-rusty-spice-500 hover:bg-rusty-spice-600 text-white font-medium py-4 rounded transition-colors uppercase tracking-widest text-sm"
                >
                  {added ? 'Added ✓' : 'Add to Cart'}
                </button>
              </div>
            )}

            <div className="mt-10 opacity-20">
              <WavyDivider color="var(--color-dust-grey-200)" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export function Head({ data, location }) {
  const site = data.site.siteMetadata
  const product = data.contentfulProduct
  const title = product?.seoTitle || `${product?.name} | ${site.title}`
  const description = product?.seoDescription || site.description
  const canonical = `${site.siteUrl}${location.pathname}`
  const ogImage = product?.productImage?.url
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product?.name,
    description,
    ...(ogImage && { image: ogImage }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: product?.priceInCents != null ? (product.priceInCents / 100).toFixed(2) : undefined,
      availability:
        product?.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: canonical,
    },
  }
  return (
    <Seo
      title={title}
      description={description}
      canonical={canonical}
      ogImage={ogImage}
      jsonLd={productLd}
    />
  )
}

export const query = graphql`
  query ProductQuery($slug: String!) {
    site {
      siteMetadata { title siteUrl description }
    }
    contentfulProduct(slug: { eq: $slug }) {
      name
      slug
      productType
      priceInCents
      inStock
      description { raw }
      productImage {
        gatsbyImageData(width: 800, placeholder: BLURRED)
        url
        title
      }
      seoTitle
      seoDescription
    }
  }
`
