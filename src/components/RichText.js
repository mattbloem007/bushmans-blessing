import React from 'react'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'

const options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-5 leading-relaxed text-dust-grey-950">{children}</p>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="font-heading text-3xl md:text-4xl mt-12 mb-5 text-dust-grey-950">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="font-heading text-2xl md:text-3xl mt-8 mb-4 text-dust-grey-950">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (node, children) => (
      <h4 className="font-heading text-xl mt-6 mb-3 text-dust-grey-950">{children}</h4>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc pl-6 mb-5 space-y-2">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal pl-6 mb-5 space-y-2">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li className="leading-relaxed">{children}</li>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-rusty-spice-500 pl-6 my-8 italic text-dust-grey-600 font-heading text-xl">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => (
      <hr className="border-dust-grey-200 my-10" />
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const asset = node.data?.target
      if (!asset?.gatsbyImageData) return null
      const image = getImage(asset)
      return (
        <figure className="my-8">
          <GatsbyImage image={image} alt={asset.title || ''} className="rounded-md" />
          {asset.description && (
            <figcaption className="text-sm text-dust-grey-600 mt-2 text-center">
              {asset.description}
            </figcaption>
          )}
        </figure>
      )
    },
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri}
        className="text-rusty-spice-500 underline hover:text-rusty-spice-600 transition-colors"
        target={node.data.uri.startsWith('http') ? '_blank' : undefined}
        rel={node.data.uri.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
  },
}

export default function RichText({ content, className = '' }) {
  if (!content) return null
  return (
    <div className={className}>
      {renderRichText(content, options)}
    </div>
  )
}
