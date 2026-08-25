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

export default function ShopPage({ data }) {
  const products = data.allContentfulProduct.nodes

  return (
    <Layout heroPage>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="py-32 md:py-40 px-6 text-center"
        style={{ background: 'var(--color-black-950)' }}
      >
        <div className="max-w-3xl mx-auto pt-8">
          <KannaSymbol size={48} color="#fe5101" className="mx-auto mb-8" />
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-4 font-medium">
            Shop
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
            The Collection
          </h1>
          <p className="text-dust-grey-200 text-lg leading-relaxed">
            Kanna, prepared the old way.
          </p>
          <div className="mt-10 opacity-15">
            <WavyDivider color="var(--color-dust-grey-200)" />
          </div>
        </div>
      </section>

      {/* ── Product grid ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-dust-grey-50">
        <div className="max-w-6xl mx-auto">
          {products.length === 0 ? (
            <p className="text-center text-dust-grey-600">No products yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => {
                const image = getImage(product.productImage)
                return (
                  <div key={product.slug} className="group">
                    <Link to={`/shop/${product.slug}`} className="no-underline block">
                      <div className="aspect-square overflow-hidden rounded-sm mb-5">
                        {image ? (
                          <GatsbyImage
                            image={image}
                            alt={product.name}
                            className="w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{
                              background:
                                'linear-gradient(135deg, var(--color-black-950) 0%, var(--color-black-900) 55%, color-mix(in srgb, var(--color-rusty-spice-600) 30%, var(--color-black-900)) 100%)',
                            }}
                          />
                        )}
                      </div>
                      <h2
                        className="text-dust-grey-950 group-hover:text-rusty-spice-500 transition-colors mb-2"
                        style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 600 }}
                      >
                        {product.name}
                      </h2>
                      <p className="text-dust-grey-600 text-sm mb-4">{formatPrice(product.priceInCents)}</p>
                    </Link>
                    <BuyNowButton
                      slug={product.slug}
                      disabled={product.inStock === false}
                      wrapperClassName="inline-flex flex-col w-full"
                      className="w-full bg-rusty-spice-500 hover:bg-rusty-spice-600 disabled:opacity-50 text-white font-medium py-3 rounded transition-colors uppercase tracking-widest text-xs"
                    >
                      {product.inStock === false ? 'Out of Stock' : 'Buy Now'}
                    </BuyNowButton>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}

export function Head({ data, location }) {
  const site = data.site.siteMetadata
  const title = `Shop | ${site.title}`
  const description = `Kanna, prepared the old way — shop the collection.`
  const canonical = `${site.siteUrl}${location.pathname}`
  return <Seo title={title} description={description} canonical={canonical} />
}

export const query = graphql`
  query ShopPageQuery {
    site {
      siteMetadata { title siteUrl description }
    }
    allContentfulProduct {
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
