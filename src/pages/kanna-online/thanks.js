import React, { useEffect, useState } from 'react'
import { Link } from 'gatsby'
import config from '../../../shared/kanna-online.json'
import Layout from '../../components/Layout'
import KannaSymbol from '../../components/icons/KannaSymbol'

const { event } = config

function formatPrice(cents) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default function KannaOnlineThanksPage({ location }) {
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id')
    if (!sessionId) {
      setError('We could not find that booking.')
      return
    }
    fetch(`/.netlify/functions/get-checkout-session?session_id=${encodeURIComponent(sessionId)}`)
      .then(res => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then(setOrder)
      .catch(() => setError('We could not load your booking confirmation.'))
  }, [location.search])

  return (
    <Layout heroPage>
      <section
        className="min-h-[80vh] flex items-center justify-center px-6 py-32"
        style={{ background: 'var(--color-black-950)' }}
      >
        <div className="max-w-xl mx-auto text-center">
          <KannaSymbol size={56} color="#fe5101" className="mx-auto mb-8" />

          {error ? (
            <p className="text-dust-grey-200">{error}</p>
          ) : !order ? (
            <p className="text-dust-grey-200">Confirming your place…</p>
          ) : (
            <>
              <h1
                className="text-dust-grey-50 mb-4"
                style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}
              >
                You&rsquo;re in.
              </h1>
              <p className="text-dust-grey-200 mb-8">
                Your place at {event.title} is confirmed
                {order.customerEmail ? ` — a confirmation has been sent to ${order.customerEmail}` : ''}.
              </p>

              <div className="border border-white/10 rounded-lg p-6 mb-8 text-left">
                <p className="text-dust-grey-200 text-sm mb-1">
                  <span className="text-rusty-spice-500 uppercase tracking-widest text-xs">When</span>
                  <br />
                  {event.dateLabel} · {event.timeLabel}
                </p>
                <p className="text-dust-grey-200 text-sm mt-3 mb-1">
                  <span className="text-rusty-spice-500 uppercase tracking-widest text-xs">Where</span>
                  <br />
                  Online, on {event.platform}. The join link arrives by email a few hours before we
                  begin.
                </p>
                <ul className="mt-5 space-y-1">
                  {order.lineItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between gap-4 text-dust-grey-200 text-sm border-t border-white/10 pt-2"
                    >
                      <span>{item.description}</span>
                      <span className="shrink-0">{formatPrice(item.amountTotal)}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-dust-grey-50 text-sm mt-4">
                  Total: {formatPrice(order.amountTotal)}
                </p>
              </div>

              <p className="text-dust-grey-200/80 text-sm leading-relaxed mb-8">
                If your place includes a sample or a bottle, it will be posted separately and should
                reach you before the evening. Reply to your confirmation email if anything needs
                changing.
              </p>

              <Link
                to="/kanna-online/"
                className="text-rusty-spice-500 hover:text-rusty-spice-600 no-underline uppercase tracking-widest text-xs"
              >
                Back to the gathering
              </Link>
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
      <title>You&rsquo;re in — Kanna, Online | Bushman&rsquo;s Blessing</title>
      <meta name="robots" content="noindex, nofollow" />
    </>
  )
}
