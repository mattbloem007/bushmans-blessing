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
      },
    },
  ],
}
