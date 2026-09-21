const Stripe = require('stripe')
const { addPaidCents } = require('./lib/retailerLedger')
const { MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID } = require('./lib/giveback')

// Separate from stripe-webhook.js on purpose: events for activity on
// connected accounts (a retailer's own direct-charge sales) are NOT
// delivered to the platform webhook by default — they need their own
// Stripe Dashboard webhook with "Listen to events on connected accounts"
// enabled, and its own signing secret (STRIPE_CONNECT_WEBHOOK_SECRET).
//
// This tracks the licensing-fee ledger and forwards the Mantis Collective
// community giveback on from every retailer's sales. It never emails the
// customer or Bushman's Blessing — the retailer is merchant of record for
// their own customers (see the retailer program build plan).
exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_CONNECT_WEBHOOK_SECRET) {
    return { statusCode: 500, body: 'Stripe Connect webhook is not configured yet.' }
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
  const signature = event.headers['stripe-signature']
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body

  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_CONNECT_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Connect webhook signature verification failed:', err.message)
    return { statusCode: 400, body: `Webhook Error: ${err.message}` }
  }

  // Events "on connected accounts" carry the connected account id here —
  // that's how we know which retailer a sale belongs to. The ledger is
  // keyed by this id directly, so no Contentful lookup is needed.
  const accountId = stripeEvent.account
  if (!accountId) {
    console.warn('Connect webhook event missing account id — ignoring', stripeEvent.type)
    return { statusCode: 200, body: JSON.stringify({ received: true }) }
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    try {
      const sessionId = stripeEvent.data.object.id
      // Webhook payloads don't include the expanded payment intent, so
      // it's re-fetched here, from the connected account.
      const session = await stripe.checkout.sessions.retrieve(
        sessionId,
        { expand: ['payment_intent'] },
        { stripeAccount: accountId }
      )
      const metadata = session.payment_intent?.metadata || {}
      // Split back apart the two components create-retailer-checkout-session.js
      // combined into one application_fee_amount, rather than recomputing
      // from line items — this way the two functions can never disagree
      // about what each portion was meant to be.
      const licensingFeeCents = parseInt(metadata.licensingFeeCents, 10) || 0
      const mantisCents = parseInt(metadata.mantisCents, 10) || 0

      if (licensingFeeCents > 0) {
        const totalPaid = await addPaidCents(accountId, licensingFeeCents)
        console.log('Recorded retailer licensing-fee payment', { accountId, licensingFeeCents, totalPaid })
      }

      if (mantisCents > 0 && MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID) {
        // Funds land in the platform's own balance as the application fee;
        // this forwards Mantis Collective's share on from there. Idempotency
        // key keyed on the session id so a retried webhook delivery can't
        // double-transfer the same sale.
        await stripe.transfers.create(
          {
            amount: mantisCents,
            currency: session.currency,
            destination: MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID,
          },
          { idempotencyKey: `mantis-${session.id}` }
        )
        console.log('Forwarded Mantis Collective giveback from retailer sale', { accountId, mantisCents })
      } else if (mantisCents > 0) {
        console.warn('Retailer sale owed a Mantis Collective giveback but MANTIS_COLLECTIVE_STRIPE_ACCOUNT_ID is not set — skipping transfer')
      }
    } catch (err) {
      console.error('Failed to process Connect checkout.session.completed:', err.message)
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
