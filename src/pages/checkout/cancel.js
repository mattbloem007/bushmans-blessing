import React from 'react'
import { Link } from 'gatsby'
import Layout from '../../components/Layout'
import EyeSymbol from '../../components/icons/EyeSymbol'

export default function CheckoutCancelPage() {
  return (
    <Layout heroPage>
      <section
        className="min-h-[70vh] flex items-center justify-center px-6 py-32 text-center"
        style={{ background: 'var(--color-black-950)' }}
      >
        <div className="max-w-xl mx-auto">
          <EyeSymbol size={56} color="#fe5101" className="mx-auto mb-8" />
          <h1
            className="text-dust-grey-50 mb-4"
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}
          >
            Checkout Cancelled
          </h1>
          <p className="text-dust-grey-200 mb-8">
            No payment was taken. Your cart is still saved if you'd like to continue.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-rusty-spice-500 hover:bg-rusty-spice-600 text-white font-medium px-8 py-4 rounded transition-colors no-underline text-sm uppercase tracking-widest"
          >
            Back to Shop
          </Link>
        </div>
      </section>
    </Layout>
  )
}

export function Head() {
  return (
    <>
      <title>Checkout Cancelled | Bushman's Blessing</title>
      <meta name="robots" content="noindex, nofollow" />
    </>
  )
}
