const path = require('path')

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    type ContentfulSiteSettings implements Node {
      logo: ContentfulAsset @link(from: "logo___NODE")
      socialMediaLinks: [String]
    }
    type ContentfulPage implements Node {
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
}
