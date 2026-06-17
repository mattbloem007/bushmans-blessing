import React from 'react'
import { Link } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'

function toTagSlug(tag) {
  return tag.toLowerCase().replace(/\s+/g, '-')
}

export default function PostCard({ title, slug, authorName, publishDate, tags, seoDescription, featuredImage }) {
  const image = getImage(featuredImage)
  const formattedDate = publishDate
    ? new Date(publishDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <article className="group flex flex-col bg-white rounded-lg overflow-hidden shadow-sm border border-dust-grey-200 hover:shadow-md transition-shadow">
      <Link to={`/blog/${slug}`} className="block aspect-[16/9] overflow-hidden no-underline flex-shrink-0">
        {image ? (
          <GatsbyImage
            image={image}
            alt={title}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full group-hover:opacity-90 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, var(--color-black-950) 0%, var(--color-black-900) 60%, color-mix(in srgb, var(--color-rusty-spice-600) 20%, var(--color-black-900)) 100%)',
            }}
          />
        )}
      </Link>

      <div className="flex flex-col flex-1 p-6">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {tags.map(tag => (
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

        <Link to={`/blog/${slug}`} className="no-underline">
          <h2
            className="text-dust-grey-950 mb-3 group-hover:text-rusty-spice-500 transition-colors leading-tight"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}
          >
            {title}
          </h2>
        </Link>

        {seoDescription && (
          <p className="text-dust-grey-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
            {seoDescription}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-dust-grey-600 mt-auto pt-4 border-t border-dust-grey-200">
          {authorName && <span className="font-medium text-dust-grey-950">{authorName}</span>}
          {authorName && formattedDate && <span aria-hidden="true">·</span>}
          {formattedDate && <time dateTime={publishDate}>{formattedDate}</time>}
        </div>
      </div>
    </article>
  )
}
