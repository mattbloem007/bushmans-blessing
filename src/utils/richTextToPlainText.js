// Flattens a Contentful RichText `raw` JSON document to plain text, for
// search indexing — not for rendering (use RichText.js/renderRichText for that).
function flattenNode(node) {
  if (!node) return ''
  if (node.nodeType === 'text') return node.value || ''
  if (!Array.isArray(node.content)) return ''
  return node.content.map(flattenNode).join(' ')
}

module.exports = function richTextToPlainText(raw) {
  if (!raw) return ''
  let document
  try {
    document = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return ''
  }
  return flattenNode(document).replace(/\s+/g, ' ').trim()
}
