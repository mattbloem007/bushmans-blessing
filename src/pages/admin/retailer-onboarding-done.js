import React from 'react'
import Layout from '../../components/Layout'

export default function RetailerOnboardingDonePage() {
  return (
    <Layout>
      <section className="min-h-screen flex items-center justify-center px-6 py-32 bg-dust-grey-50 text-center">
        <div className="max-w-md mx-auto">
          <h1
            className="text-dust-grey-950 mb-4"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}
          >
            Thanks — you're all set.
          </h1>
          <p className="text-dust-grey-600">
            Your Stripe account details have been submitted. Bushman's Blessing will be in touch
            to confirm your storefront is live.
          </p>
        </div>
      </section>
    </Layout>
  )
}

export function Head() {
  return <meta name="robots" content="noindex, nofollow" />
}
