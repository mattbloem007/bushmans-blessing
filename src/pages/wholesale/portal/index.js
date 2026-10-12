import React, { useEffect, useMemo, useState } from 'react'
import { navigate } from 'gatsby'
import Layout from '../../../components/Layout'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default function WholesalePortalPage() {
  const [products, setProducts] = useState(null)
  const [bankTransferEnabled, setBankTransferEnabled] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [quantities, setQuantities] = useState({}) // slug -> quantity string
  const [packagingAcknowledged, setPackagingAcknowledged] = useState(false)
  const [checkoutStatus, setCheckoutStatus] = useState(null) // null | 'starting' | 'error'
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    fetch('/.netlify/functions/get-wholesale-products')
      .then(res => {
        if (res.status === 401) {
          navigate('/wholesale/login')
          return null
        }
        if (!res.ok) throw new Error('Could not load wholesale products')
        return res.json()
      })
      .then(data => {
        if (data) {
          setProducts(data.products)
          setBankTransferEnabled(data.bankTransferEnabled === true)
        }
      })
      .catch(() => setLoadError('We could not load the wholesale catalog. Please try again shortly.'))
  }, [])

  const cartItems = useMemo(() => {
    if (!products) return []
    return products
      .map(product => ({ product, quantity: Number(quantities[product.slug] || 0) }))
      .filter(item => item.quantity > 0)
  }, [products, quantities])

  const hasUnbottledInCart = cartItems.some(item => item.product.unbottled)

  const subtotalCents = cartItems.reduce((sum, item) => sum + item.product.unitPriceInCents * item.quantity, 0)

  const belowMinimum = cartItems.filter(item => item.quantity < item.product.minQuantity)

  const canCheckout =
    cartItems.length > 0 && belowMinimum.length === 0 && (!hasUnbottledInCart || packagingAcknowledged)

  const handleQuantityChange = (slug, value) => {
    setQuantities(q => ({ ...q, [slug]: value }))
  }

  const handleLogout = async () => {
    await fetch('/.netlify/functions/wholesale-logout', { method: 'POST' })
    navigate('/wholesale/login')
  }

  const handleCheckout = async () => {
    setCheckoutStatus('starting')
    setCheckoutError('')
    try {
      const res = await fetch('/.netlify/functions/create-wholesale-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({ slug: item.product.slug, quantity: item.quantity })),
          packagingAcknowledged,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCheckoutStatus('error')
        setCheckoutError(data.error || 'Could not start checkout')
        return
      }
      window.location = data.url
    } catch {
      setCheckoutStatus('error')
      setCheckoutError('Network error — please try again')
    }
  }

  return (
    <Layout>
      <section className="min-h-screen px-6 py-32 bg-dust-grey-50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h1
              className="text-dust-grey-950"
              style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}
            >
              Wholesale Portal
            </h1>
            <button
              type="button"
              onClick={handleLogout}
              className="text-dust-grey-600 hover:text-dust-grey-950 text-sm underline"
            >
              Log out
            </button>
          </div>

          {loadError && <p className="text-red-700 text-sm mb-6">{loadError}</p>}

          {!products && !loadError && <p className="text-dust-grey-600">Loading catalog…</p>}

          {products && (
            <div className="space-y-4 mb-10">
              {products.map(product => {
                const qty = Number(quantities[product.slug] || 0)
                const isBelowMinimum = qty > 0 && qty < product.minQuantity
                return (
                  <div
                    key={product.slug}
                    className="bg-white border border-dust-grey-200 rounded p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <h2 className="text-dust-grey-950 font-medium">{product.name}</h2>
                      <p className="text-dust-grey-600 text-sm">{product.sizeLabel}</p>
                      <p className="text-rusty-spice-500 text-sm mt-1">
                        {formatPrice(product.unitPriceInCents)}
                        {product.minQuantity > 1 ? ` — minimum order ${product.minQuantity}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1">
                      <input
                        type="number"
                        min={0}
                        value={quantities[product.slug] || ''}
                        onChange={e => handleQuantityChange(product.slug, e.target.value)}
                        placeholder="0"
                        className="w-24 px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950 text-right"
                      />
                      {isBelowMinimum && (
                        <p className="text-red-700 text-xs">Minimum {product.minQuantity}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="bg-white border border-dust-grey-200 rounded p-6 space-y-4">
              <div className="flex justify-between text-dust-grey-950 font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(subtotalCents)}</span>
              </div>

              {hasUnbottledInCart && (
                <label className="flex items-start gap-2 text-sm text-dust-grey-800">
                  <input
                    type="checkbox"
                    checked={packagingAcknowledged}
                    onChange={e => setPackagingAcknowledged(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I understand that if I repackage this product under my own brand, Bushman's
                    Blessing asks (but doesn't require) a mention on my packaging — e.g. "Kanna
                    sourced in partnership with Bushman's Blessing."
                  </span>
                </label>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={!canCheckout || checkoutStatus === 'starting'}
                className="bg-rusty-spice-500 hover:bg-rusty-spice-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded transition-colors uppercase tracking-widest text-sm w-full sm:w-auto"
              >
                {checkoutStatus === 'starting' ? 'Redirecting…' : 'Checkout'}
              </button>

              <p className="text-dust-grey-600 text-xs">
                {bankTransferEnabled
                  ? 'Card and bank transfer accepted. Bank transfer orders ship once funds settle.'
                  : 'Card payments only.'}
              </p>

              {checkoutStatus === 'error' && <p className="text-red-700 text-sm">{checkoutError}</p>}
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}

export function Head() {
  return <meta name="robots" content="noindex, nofollow" />
}
