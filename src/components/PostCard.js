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
    <article className="group">
      {/* Image / gradient block — tag chips sit outside the link so they remain clickable */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-5">
        <Link to={`/blog/${slug}`} className="block w-full h-full no-underline">
          {image ? (
            <GatsbyImage
              image={image}
              alt={title}
              className="w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div
              className="w-full h-full group-hover:opacity-85 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, var(--color-black-950) 0%, var(--color-black-900) 55%, color-mix(in srgb, var(--color-rusty-spice-600) 30%, var(--color-black-900)) 100%)',
              }}
            />
          )}
        </Link>

        {/* Tag chips overlaid — separate from the post link */}
        {tags && tags.length > 0 && (
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            {tags.map(tag => (
              <Link
                key={tag}
                to={`/blog/tag/${toTagSlug(tag)}`}
                className="text-[10px] font-medium text-rusty-spice-500 uppercase tracking-widest px-2.5 py-1 rounded-full no-underline hover:text-white transition-colors"
                style={{ background: 'rgba(12, 6, 2, 0.65)', backdropFilter: 'blur(4px)' }}
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Text block — open, no card container */}
      <div>
        {/* Date */}
        {formattedDate && (
          <time dateTime={publishDate} className="block text-xs text-dust-grey-600 mb-2 tracking-wide">
            {formattedDate}
          </time>
        )}

        {/* Title */}
        <Link to={`/blog/${slug}`} className="no-underline">
          <h2
            className="text-dust-grey-950 group-hover:text-rusty-spice-500 transition-colors duration-300 leading-tight mb-3"
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.3rem, 2vw, 1.55rem)', fontWeight: 600 }}
          >
            {title}
          </h2>
        </Link>

        {/* Excerpt */}
        {seoDescription && (
          <p className="text-dust-grey-600 text-sm leading-relaxed line-clamp-2 mb-4">
            {seoDescription}
          </p>
        )}

        {/* Read more link */}
        <Link
          to={`/blog/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-rusty-spice-500 no-underline group/link"
        >
          <span className="uppercase tracking-widest">Read</span>
          <span className="translate-x-0 group-hover/link:translate-x-1 transition-transform duration-200">→</span>
        </Link>
      </div>
    </article>
  )
}
