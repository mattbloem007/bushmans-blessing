import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

export default function Seo({ title, description, canonical, ogImage, ogType = 'website', jsonLd }) {
  const data = useStaticQuery(graphql`
    query SeoQuery {
      site {
        siteMetadata { title siteUrl }
      }
      contentfulSiteSettings {
        siteName
        socialMediaLinks
        logo { url }
      }
    }
  `)

  const site = data.site.siteMetadata
  const settings = data.contentfulSiteSettings
  const resolvedOgImage = ogImage || `${site.siteUrl}/og-image.png`

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings?.siteName || site.title,
    url: site.siteUrl,
    ...(settings?.logo?.url && { logo: settings.logo.url }),
    ...(settings?.socialMediaLinks?.length && { sameAs: settings.socialMediaLinks }),
  }

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings?.siteName || site.title,
    url: site.siteUrl,
  }

  const extraLd = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
  const allLd = [organizationLd, websiteLd, ...extraLd]

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <link rel="canonical" href={canonical} />
      {allLd.map((item, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </>
  )
}
