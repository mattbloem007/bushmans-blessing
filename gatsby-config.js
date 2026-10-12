require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

/** @type {import('gatsby').GatsbyConfig} */
module.exports = {
  siteMetadata: {
    title: `Bushman's Blessing`,
    siteUrl: `https://bushman-blessing.netlify.app`,
    description: `Ancient wisdom. Modern living. Kanna — the sacred plant of the San Bushmen of Southern Africa.`,
  },
  plugins: [
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-postcss`,
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: process.env.CONTENTFUL_SPACE_ID,
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
        environment: process.env.CONTENTFUL_ENVIRONMENT || `master`,
        // The space has a second locale (nl-NL, added 2026-09-21) with no
        // localized content actually using it. Without this, the source
        // plugin creates one node PER LOCALE for every entry — doubling
        // every query result site-wide (not just navigation) once a full
        // (non-incremental) resync runs. The option is `localeFilter` (a
        // function), not `locales` — that was my first, wrong attempt.
        localeFilter: locale => locale.code === `en-US`,
      },
    },
  ],
}
