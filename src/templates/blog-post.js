import React from 'react'
import { graphql, Link } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import Layout from '../components/Layout'
import RichText from '../components/RichText'

function toTagSlug(tag) {
  return tag.toLowerCase().replace(/\s+/g, '-')
}

export default function BlogPostPage({ data }) {
  const post = data.contentfulBlogPost
  const image = getImage(post.featuredImage)
  const formattedDate = post.publishDate
    ? new Date(post.publishDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <Layout heroPage>
      {/* Hero — image or earthy gradient fallback */}
      {image ? (
        <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
          <GatsbyImage
            image={image}
            alt={post.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            imgStyle={{ objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-black-950/65" />
          <div className="relative flex flex-col justify-end h-full px-6 pb-14 max-w-4xl mx-auto pt-28">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/blog/tag/${toTagSlug(tag)}`}
                    className="text-xs font-medium text-rusty-spice-500 uppercase tracking-wider no-underline hover:text-rusty-spice-600 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
            <h1
              className="text-dust-grey-50"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: '1.15',
                fontWeight: 600,
              }}
            >
              {post.title}
            </h1>
          </div>
        </section>
      ) : (
        <section
          className="py-36 md:py-44 px-6 text-center"
          style={{
            background: 'linear-gradient(160deg, var(--color-black-950) 0%, var(--color-black-900) 70%, color-mix(in srgb, var(--color-saddle-brown-500) 20%, var(--color-black-900)) 100%)',
          }}
        >
          <div className="max-w-4xl mx-auto pt-8">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/blog/tag/${toTagSlug(tag)}`}
                    className="text-xs font-medium text-rusty-spice-500 uppercase tracking-wider no-underline hover:text-rusty-spice-600 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
            <h1
              className="text-dust-grey-50"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                lineHeight: '1.15',
                fontWeight: 600,
              }}
            >
              {post.title}
            </h1>
          </div>
        </section>
      )}

      {/* Meta bar */}
      <div className="bg-dust-grey-100 border-b border-dust-grey-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-3 text-sm text-dust-grey-600">
          {post.authorName && (
            <span className="font-medium text-dust-grey-950">{post.authorName}</span>
          )}
          {post.authorName && formattedDate && <span aria-hidden="true">·</span>}
          {formattedDate && (
            <time dateTime={post.publishDate}>{formattedDate}</time>
          )}
        </div>
      </div>

      {/* Article body */}
      <article className="py-16 md:py-24 px-6 bg-dust-grey-50">
        <div className="max-w-3xl mx-auto">
          {post.body && (
            <RichText content={post.body} className="text-base md:text-lg" />
          )}
        </div>
      </article>

      {/* Back link */}
      <div className="px-6 pb-20 bg-dust-grey-50">
        <div className="max-w-3xl mx-auto pt-6 border-t border-dust-grey-200">
          <Link
            to="/blog"
            className="text-sm text-rusty-spice-500 hover:text-rusty-spice-600 no-underline transition-colors"
          >
            ← All posts
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    contentfulBlogPost(slug: { eq: $slug }) {
      title
      authorName
      publishDate
      tags
      body {
        raw
      }
      featuredImage {
        gatsbyImageData(layout: FULL_WIDTH, placeholder: BLURRED)
      }
    }
  }
`
