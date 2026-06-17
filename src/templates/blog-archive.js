import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import EyeSymbol from '../components/icons/EyeSymbol'

export default function BlogArchivePage({ data, pageContext }) {
  const posts = data.allContentfulBlogPost.nodes
  const { currentPage, numPages } = pageContext
  const isFirst = currentPage === 1
  const isLast = currentPage === numPages
  const prevPath = currentPage === 2 ? '/blog' : `/blog/${currentPage - 1}`
  const nextPath = `/blog/${currentPage + 1}`

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
            Writing
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
            The Blog
          </h1>
          <p className="text-dust-grey-200 text-lg leading-relaxed">
            Stories, science, and slow wisdom from the world of Kanna.
          </p>
        </div>
      </section>

      {/* Post grid */}
      <section className="py-20 md:py-28 px-6 bg-dust-grey-50">
        <div className="max-w-6xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p
                className="text-dust-grey-600 text-lg"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Stories are on their way.
              </p>
            </div>
          ) : (
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
          )}

          {numPages > 1 && (
            <nav
              className="flex items-center justify-center gap-3 mt-16"
              aria-label="Blog pagination"
            >
              {!isFirst && (
                <Link
                  to={prevPath}
                  className="px-5 py-2 border border-dust-grey-200 rounded text-sm text-dust-grey-950 hover:border-rusty-spice-500 hover:text-rusty-spice-500 no-underline transition-colors"
                >
                  ← Previous
                </Link>
              )}

              {Array.from({ length: numPages }).map((_, i) => {
                const pageNum = i + 1
                const pagePath = pageNum === 1 ? '/blog' : `/blog/${pageNum}`
                const isActive = pageNum === currentPage
                return (
                  <Link
                    key={pageNum}
                    to={pagePath}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-9 h-9 flex items-center justify-center rounded text-sm no-underline transition-colors ${
                      isActive
                        ? 'bg-rusty-spice-500 text-white'
                        : 'border border-dust-grey-200 text-dust-grey-950 hover:border-rusty-spice-500 hover:text-rusty-spice-500'
                    }`}
                  >
                    {pageNum}
                  </Link>
                )
              })}

              {!isLast && (
                <Link
                  to={nextPath}
                  className="px-5 py-2 border border-dust-grey-200 rounded text-sm text-dust-grey-950 hover:border-rusty-spice-500 hover:text-rusty-spice-500 no-underline transition-colors"
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>
    </Layout>
  )
}

export const query = graphql`
  query BlogArchiveQuery($skip: Int!, $limit: Int!) {
    allContentfulBlogPost(
      sort: { publishDate: DESC }
      limit: $limit
      skip: $skip
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
