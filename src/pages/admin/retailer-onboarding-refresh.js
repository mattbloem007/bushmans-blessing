import React from 'react'
import Layout from '../../components/Layout'

// Stripe sends the retailer here if their onboarding link expired before
// they finished — they'll need a fresh link (scripts/onboard-retailer.js
// generates a new one) rather than being able to resume this one.
export default function RetailerOnboardingRefreshPage() {
  return (
    <Layout>
      <section className="min-h-screen flex items-center justify-center px-6 py-32 bg-dust-grey-50 text-center">
        <div className="max-w-md mx-auto">
          <h1
            className="text-dust-grey-950 mb-4"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}
          >
            That link expired.
          </h1>
          <p className="text-dust-grey-600">
            Please contact Bushman's Blessing for a fresh onboarding link.
          </p>
        </div>
      </section>
    </Layout>
  )
}

export function Head() {
  return <meta name="robots" content="noindex, nofollow" />
}
