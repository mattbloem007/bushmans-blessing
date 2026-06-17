import React, { useState } from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import EyeSymbol from '../components/icons/EyeSymbol'
import WavyDivider from '../components/WavyDivider'
import EntopticDots from '../components/icons/EntopticDots'

export default function BlogArchivePage({ data, pageContext }) {
  const { currentPage, numPages } = pageContext
  const isFirst = currentPage === 1
  const isLast = currentPage === numPages
  const prevPath = currentPage === 2 ? '/blog' : `/blog/${currentPage - 1}`
  const nextPath = `/blog/${currentPage + 1}`

  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  const isFiltering = query.trim() !== '' || activeTag !== null
  const allTags = [...new Set(data.allPosts.nodes.flatMap(p => p.tags || []))]

  const displayPosts = isFiltering
    ? data.allPosts.nodes.filter(post => {
        const q = query.toLowerCase()
        const matchesSearch =
          !q ||
          post.title.toLowerCase().includes(q) ||
          (post.seoDescription || '').toLowerCase().includes(q) ||
          (post.tags || []).some(t => t.toLowerCase().includes(q))
        const matchesTag = !activeTag || (post.tags || []).includes(activeTag)
        return matchesSearch && matchesTag
      })
    : data.paginatedPosts.nodes

  return (
    <Layout heroPage>
      {/* Hero */}
      <section
        className="py-32 md:py-40 px-6 text-center relative overflow-hidden"
        style={{ background: 'var(--color-black-950)' }}
      >
        <EntopticDots
          rows={4}
          cols={20}
          gap={16}
          dotSize={2}
          color="#fe5101"
          className="absolute top-0 left-0 opacity-[0.05] pointer-events-none"
        />
        <EntopticDots
          rows={4}
          cols={20}
          gap={16}
          dotSize={2}
          color="#fe5101"
          className="absolute bottom-0 right-0 opacity-[0.05] pointer-events-none"
        />
        <div className="relative max-w-3xl mx-auto pt-8">
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

          <div className="mt-10 opacity-15">
            <WavyDivider color="var(--color-dust-grey-200)" />
          </div>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto mt-8">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
              style={{ color: 'var(--color-dust-grey-600)' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search posts…"
              className="w-full rounded px-5 py-3 pl-11 text-sm transition-colors focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'var(--color-dust-grey-50)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-rusty-spice-500)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
            />
          </div>

          {/* Tag chips */}
          {allTags.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider transition-colors"
                  style={
                    activeTag === tag
                      ? { background: 'var(--color-rusty-spice-500)', color: '#fff' }
                      : {
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: 'var(--color-dust-grey-200)',
                        }
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Post grid */}
      <section className="py-20 md:py-28 px-6 bg-dust-grey-50">
        <div className="max-w-6xl mx-auto">
          {displayPosts.length === 0 ? (
            <div className="text-center py-20">
              <p
                className="text-dust-grey-600 text-lg mb-6"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                No posts found{query ? ` for "${query}"` : ''}.
              </p>
              <button
                onClick={() => { setQuery(''); setActiveTag(null) }}
                className="text-sm underline"
                style={{ color: 'var(--color-rusty-spice-500)' }}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayPosts.map(post => (
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

          {!isFiltering && numPages > 1 && (
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

export function Head({ data, location }) {
  const site = data.site.siteMetadata
  const title = `The Blog | ${site.title}`
  const description = `Stories, science, and slow wisdom from the world of Kanna.`
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
  query BlogArchiveQuery($skip: Int!, $limit: Int!) {
    site {
      siteMetadata { title siteUrl description }
    }
    paginatedPosts: allContentfulBlogPost(
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
    allPosts: allContentfulBlogPost(sort: { publishDate: DESC }) {
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
