import React from 'react'
import { graphql } from 'gatsby'

export default function HomePage({ data }) {
  const page = data.contentfulPage

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>{page?.heroHeading}</h1>
      <p>{page?.heroSubheading}</p>
      <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '2rem' }}>
        Pulled from Contentful — pipeline confirmed ✓
      </p>
    </main>
  )
}

export const query = graphql`
  query HomePageQuery {
    contentfulPage(slug: { eq: "/" }) {
      title
      heroHeading
      heroSubheading
    }
  }
`
