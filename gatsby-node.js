exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  // Declare optional Contentful fields that Gatsby can't infer when entries have no value
  createTypes(`
    type ContentfulSiteSettings implements Node {
      logo: ContentfulAsset @link(from: "logo___NODE")
      socialMediaLinks: [String]
    }
    type ContentfulKannaPage implements Node {
      productImages: [ContentfulAsset] @link(from: "productImages___NODE")
    }
    type ContentfulAsset implements Node {
      title: String
      description: String
    }
  `)
}
