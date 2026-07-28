const path = require('path')
const fs = require('fs')
const richTextToPlainText = require('./src/utils/richTextToPlainText')

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    type ContentfulSiteSettings implements Node {
      logo: ContentfulAsset @link(from: "logo___NODE")
      socialMediaLinks: [String]
    }
    type ContentfulPageExploreMoreText {
      raw: String
    }
    type ContentfulPage implements Node {
      storyBlock1Heading: String
      storyBlock1Image: ContentfulAsset @link(from: "storyBlock1Image___NODE")
      storyBlock2Heading: String
      storyBlock2Image: ContentfulAsset @link(from: "storyBlock2Image___NODE")
      storyBlock3Heading: String
      storyBlock3Image: ContentfulAsset @link(from: "storyBlock3Image___NODE")
      exploreMoreText: ContentfulPageExploreMoreText
      seoTitle: String
      seoDescription: String
    }
    type ContentfulKannaPage implements Node {
      productImages: [ContentfulAsset] @link(from: "productImages___NODE")
      seoTitle: String
      seoDescription: String
    }
    type ContentfulBlogPost implements Node {
      featuredImage: ContentfulAsset @link(from: "featuredImage___NODE")
      seoTitle: String
      seoDescription: String
    }
    type ContentfulAsset implements Node {
      title: String
      description: String
      url: String
    }
    type ContentfulProductDescription {
      raw: String
    }
    type ContentfulProduct implements Node {
      name: String
      slug: String
      productType: String
      priceInCents: Int
      inStock: Boolean
      stripePriceId: String
      description: ContentfulProductDescription
      productImage: ContentfulAsset @link(from: "productImage___NODE")
      bundleItems: [ContentfulProduct] @link(from: "bundleItems___NODE")
      seoTitle: String
      seoDescription: String
    }
  `)
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const POSTS_PER_PAGE = 9

  const result = await graphql(`
    query {
      allContentfulBlogPost(sort: { publishDate: DESC }) {
        nodes {
          slug
          tags
        }
      }
    }
  `)

  if (result.errors) throw result.errors

  const posts = result.data.allContentfulBlogPost.nodes
  const numArchivePages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))

  // Paginated blog archive
  Array.from({ length: numArchivePages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? '/blog' : `/blog/${i + 1}`,
      component: path.resolve('./src/templates/blog-archive.js'),
      context: {
        limit: POSTS_PER_PAGE,
        skip: i * POSTS_PER_PAGE,
        numPages: numArchivePages,
        currentPage: i + 1,
      },
    })
  })

  // Individual post pages
  posts.forEach(({ slug }) => {
    createPage({
      path: `/blog/${slug}`,
      component: path.resolve('./src/templates/blog-post.js'),
      context: { slug },
    })
  })

  // Tag pages — one per unique tag across all posts
  const tagMap = new Map()
  posts.forEach(({ tags }) => {
    ;(tags || []).forEach(tag => {
      if (!tagMap.has(tag)) tagMap.set(tag, tag.toLowerCase().replace(/\s+/g, '-'))
    })
  })
  tagMap.forEach((tagSlug, tag) => {
    createPage({
      path: `/blog/tag/${tagSlug}`,
      component: path.resolve('./src/templates/blog-tag.js'),
      context: { tag, tagSlug },
    })
  })

  // Product pages
  const productResult = await graphql(`
    query {
      allContentfulProduct {
        nodes {
          slug
        }
      }
    }
  `)

  if (productResult.errors) throw productResult.errors

  productResult.data.allContentfulProduct.nodes.forEach(({ slug }) => {
    createPage({
      path: `/shop/${slug}`,
      component: path.resolve('./src/templates/product.js'),
      context: { slug },
    })
  })
}

// Full-text blog search index, fetched client-side by blog-archive.js and
// indexed with FlexSearch — keeps post body text out of the page's GraphQL
// data blob (see milestone 4 log for why body text was originally excluded).
exports.onPostBuild = async ({ graphql }) => {
  const result = await graphql(`
    query {
      allContentfulBlogPost(sort: { publishDate: DESC }) {
        nodes {
          slug
          title
          tags
          seoDescription
          body { raw }
        }
      }
    }
  `)

  if (result.errors) throw result.errors

  const searchIndex = result.data.allContentfulBlogPost.nodes.map(post => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.seoDescription || '',
    tags: post.tags || [],
    body: richTextToPlainText(post.body?.raw),
  }))

  fs.writeFileSync(
    path.resolve('./public/search-index.json'),
    JSON.stringify(searchIndex)
  )
}
