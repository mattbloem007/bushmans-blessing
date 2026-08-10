import React, { useState } from 'react'
import { useCart } from '../context/CartContext'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

const FREE_SHIPPING_THRESHOLD = 2

export default function CartDrawer() {
  const { items, itemCount, subtotalInCents, isOpen, closeCart, updateQuantity, removeItem } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState(null)

  const kannaQty = items.find(i => i.slug === 'kanna-tincture')?.quantity || 0
  const qualifiesForFreeShipping = kannaQty >= FREE_SHIPPING_THRESHOLD

  const handleCheckout = async () => {
    setError(null)
    setCheckingOut(true)
    try {
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ slug: i.slug, quantity: i.quantity })),
        }),
      })
      if (!res.ok) throw new Error('Checkout could not be started — please try again.')
      const { url } = await res.json()
      window.location = url
    } catch (err) {
      setError(err.message)
      setCheckingOut(false)
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black-950/60 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-dust-grey-50 z-[70] shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-dust-grey-200">
          <h2
            className="text-dust-grey-950"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}
          >
            Your Cart{itemCount > 0 && ` (${itemCount})`}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-dust-grey-600 hover:text-rusty-spice-500 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <p className="text-dust-grey-600 text-sm">Your cart is empty.</p>
          ) : (
            <ul className="space-y-6">
              {items.map(item => (
                <li key={item.slug} className="flex gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-dust-grey-950 font-medium text-sm mb-1">{item.name}</p>
                    <p className="text-dust-grey-600 text-xs mb-2">{formatPrice(item.unitPriceInCents)}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-dust-grey-200 rounded">
                        <button
                          onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-dust-grey-600 hover:text-rusty-spice-500 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-dust-grey-600 hover:text-rusty-spice-500 transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.slug)}
                        className="text-xs text-dust-grey-600 hover:text-rusty-spice-500 underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-dust-grey-200 px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-dust-grey-950 font-medium">Subtotal</span>
              <span className="text-dust-grey-950 font-medium">{formatPrice(subtotalInCents)}</span>
            </div>
            {error && <p className="text-rusty-spice-500 text-xs mb-3">{error}</p>}
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-rusty-spice-500 hover:bg-rusty-spice-600 disabled:opacity-60 text-white font-medium py-4 rounded transition-colors uppercase tracking-widest text-sm"
            >
              {checkingOut ? 'Redirecting…' : 'Checkout'}
            </button>
            {kannaQty > 0 ? (
              <p className="text-xs text-center mt-3 text-rusty-spice-500">
                {qualifiesForFreeShipping
                  ? 'Free shipping unlocked ✓'
                  : `Add ${FREE_SHIPPING_THRESHOLD - kannaQty} more Kanna Tincture for free shipping`}
              </p>
            ) : (
              <p className="text-dust-grey-600 text-xs text-center mt-3">
                Shipping calculated at checkout.
              </p>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
