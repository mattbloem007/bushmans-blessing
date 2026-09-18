const Stripe = require('stripe')

function htmlPage(title, bodyHtml) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title>
<meta name="robots" content="noindex, nofollow">
<style>body{font-family:Georgia,serif;max-width:560px;margin:80px auto;padding:0 24px;color:#2b2620;}
code{background:#f2ede4;padding:2px 6px;border-radius:3px;}</style>
</head><body><h1>${title}</h1>${bodyHtml}</body></html>`,
  }
}

// Stripe redirects here after a retailer authorizes (or denies) connecting
// their existing Stripe account via the OAuth link from
// scripts/generate-retailer-connect-link.js. This only exchanges the code
// and displays the resulting account id for an admin to copy into
// Contentful — it doesn't write to Contentful itself (keeps this
// public-facing endpoint read-only; onboarding stays a manual, low-volume
// process for now).
exports.handler = async event => {
  const { code, state, error, error_description: errorDescription } = event.queryStringParameters || {}

  if (error) {
    return htmlPage(
      'Connection declined',
      `<p>The retailer didn't complete the connection: ${escapeHtml(errorDescription || 'no reason given')}</p>`
    )
  }

  if (!code) {
    return htmlPage('Missing code', '<p>No authorization code was provided.</p>')
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return htmlPage('Not configured', '<p>Stripe is not configured yet.</p>')
  }

  const [slug] = (state || '').split(':')

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })

    return htmlPage(
      'Connected',
      `<p>Retailer <strong>${escapeHtml(slug || '(unknown)')}</strong> connected successfully.</p>
       <p>Add this as their "Stripe Connect Account ID" in Contentful, then set <code>active</code> to true and publish:</p>
       <p><code>${escapeHtml(response.stripe_user_id)}</code></p>`
    )
  } catch (err) {
    console.error('stripe-connect-oauth-callback error:', err.message)
    return htmlPage('Connection failed', `<p>${escapeHtml(err.message)}</p>`)
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
