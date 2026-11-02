import React, { useState } from 'react'

// Posts the chosen Kanna Online option straight to its own checkout
// function — these aren't Contentful products, so BuyNowButton (which sends a
// product slug) doesn't fit.
export default function KannaOnlineCheckoutButton({ option, disabled = false, className = '', children }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleClick = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/create-experience-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option: option.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not start checkout')
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className={className}
      >
        {loading ? 'Opening checkout…' : children}
      </button>
      {error && <p className="mt-3 text-sm text-red-700 text-center max-w-xs">{error}</p>}
    </div>
  )
}
