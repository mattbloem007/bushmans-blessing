import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import EyeSymbol from '../components/icons/EyeSymbol'

export default function BlogTagPage({ data, pageContext }) {
  const posts = data.allContentfulBlogPost.nodes
  const { tag } = pageContext
  const count = posts.length

  return (
    <Layout heroPage>
      {/* Hero */}
      <section
        className="py-32 md:py-40 px-6 text-center"
        style={{ background: 'var(--color-black-950)' }}
      >
        <div className="max-w-3xl mx-auto pt-8">
          <EyeSymbol size={48} color="#fe5101" className="mx-auto mb-8" />
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-4 font-medium">
            Tag
          </p>
          <h1
            className="text-dust-grey-50 mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: '1.1',
              fontWeight: 600,
            }}
          >
            {tag}
          </h1>
          <p className="text-dust-grey-600 text-sm">
            {count} {count === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </section>

      {/* Post grid */}
      <section className="py-20 md:py-28 px-6 bg-dust-grey-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <PostCard
                key={post.slug}
                title={post.title}
                slug={post.slug}
                authorName={post.authorName}
                publishDate={post.publishDate}
                tags={post.tags}
                seoDescription={post.seoDescription}
                featuredImage={post.featuredImage}
              />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/blog"
              className="text-sm text-rusty-spice-500 hover:text-rusty-spice-600 no-underline transition-colors"
            >
              ← All posts
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export function Head({ data, location, pageContext }) {
  const site = data.site.siteMetadata
  const { tag } = pageContext
  const title = `Posts tagged: ${tag} | ${site.title}`
  const description = site.description
  const canonical = `${site.siteUrl}${location.pathname}`
  const ogImage = `${site.siteUrl}/og-image.svg`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <link rel="canonical" href={canonical} />
    </>
  )
}

export const query = graphql`
  query BlogTagQuery($tag: String!) {
    site {
      siteMetadata { title siteUrl description }
    }
    allContentfulBlogPost(
      filter: { tags: { in: [$tag] } }
      sort: { publishDate: DESC }
    ) {
      nodes {
        title
        slug
        authorName
        publishDate
        tags
        seoDescription
        featuredImage {
          gatsbyImageData(width: 600, placeholder: BLURRED)
        }
      }
    }
  }
`
