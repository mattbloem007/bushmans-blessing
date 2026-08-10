import React, { useState } from 'react'

// Skips the cart entirely — posts a single-item order straight to the same
// checkout-session function the cart drawer uses, then redirects to Stripe.
export default function BuyNowButton({
  slug,
  quantity = 1,
  disabled = false,
  className = '',
  wrapperClassName = 'inline-flex flex-col',
  children,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleBuyNow = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ slug, quantity }] }),
      })
      if (!res.ok) throw new Error('Checkout could not be started — please try again.')
      const { url } = await res.json()
      window.location = url
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <span className={wrapperClassName}>
      <button type="button" onClick={handleBuyNow} disabled={disabled || loading} className={className}>
        {loading ? 'Redirecting…' : children || 'Buy Now'}
      </button>
      {error && <p className="text-rusty-spice-500 text-xs mt-2">{error}</p>}
    </span>
  )
}
