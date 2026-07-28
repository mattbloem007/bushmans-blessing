import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import KannaSymbol from '../../components/icons/KannaSymbol'
import { useCart } from '../../context/CartContext'

function formatPrice(cents, currency = 'eur') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

export default function CheckoutSuccessPage({ location }) {
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const { clear } = useCart()

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id')
    if (!sessionId) {
      setError('Missing order reference.')
      return
    }
    fetch(`/.netlify/functions/get-checkout-session?session_id=${encodeURIComponent(sessionId)}`)
      .then(res => {
        if (!res.ok) throw new Error('Order not found')
        return res.json()
      })
      .then(data => {
        setOrder(data)
        clear()
      })
      .catch(() => setError('We could not load your order confirmation.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  return (
    <Layout heroPage>
      <section
        className="min-h-[70vh] flex items-center justify-center px-6 py-32"
        style={{ background: 'var(--color-black-950)' }}
      >
        <div className="max-w-xl mx-auto text-center">
          <KannaSymbol size={56} color="#fe5101" className="mx-auto mb-8" />
          {error ? (
            <p className="text-dust-grey-200">{error}</p>
          ) : !order ? (
            <p className="text-dust-grey-200">Confirming your order…</p>
          ) : (
            <>
              <h1
                className="text-dust-grey-50 mb-4"
                style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}
              >
                Thank you.
              </h1>
              <p className="text-dust-grey-200 mb-8">
                Your order is confirmed
                {order.customerEmail ? ` — a receipt has been sent to ${order.customerEmail}` : ''}.
              </p>
              <ul className="text-left mb-8 space-y-2">
                {order.lineItems.map((li, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-dust-grey-200 text-sm border-b border-white/10 pb-2"
                  >
                    <span>{li.quantity} × {li.description}</span>
                    <span>{formatPrice(li.amountTotal, order.currency)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-dust-grey-50 font-medium">
                Total: {formatPrice(order.amountTotal, order.currency)}
              </p>
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}

export function Head() {
  return (
    <>
      <title>Order Confirmed | Bushman's Blessing</title>
      <meta name="robots" content="noindex, nofollow" />
    </>
  )
}
