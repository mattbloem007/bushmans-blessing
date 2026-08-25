import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'

const FIELDS = [
  { name: 'customerEmail', label: 'Customer Email', required: true, type: 'email' },
  { name: 'customerName', label: 'Customer Name', required: false, type: 'text' },
  { name: 'orderReference', label: 'Order Reference', required: false, type: 'text' },
  { name: 'carrier', label: 'Carrier', required: false, type: 'text' },
  { name: 'trackingNumber', label: 'Tracking Number', required: false, type: 'text' },
  { name: 'trackingUrl', label: 'Tracking URL', required: false, type: 'text' },
]

export default function AdminShipPage({ location }) {
  const [form, setForm] = useState({})
  const [personalMessage, setPersonalMessage] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  const [sessionId, setSessionId] = useState(null)
  const [orderSummary, setOrderSummary] = useState(null)
  const [loadStatus, setLoadStatus] = useState(null) // null | 'loading' | 'loaded' | 'error'
  const [loadError, setLoadError] = useState('')

  // /admin/ship?session=cs_... arrives from the "Ship this order" link in
  // the internal new-order email — pulling the id out here is what lets
  // handleLoadOrder auto-fill the form below instead of the packer
  // retyping the customer's email, name, and order reference by hand.
  useEffect(() => {
    const params = new URLSearchParams(location?.search || '')
    setSessionId(params.get('session'))
  }, [location])

  const handleChange = (name, value) => setForm(f => ({ ...f, [name]: value }))

  const handleLoadOrder = async () => {
    setLoadStatus('loading')
    setLoadError('')
    try {
      const res = await fetch('/.netlify/functions/get-order-for-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, sessionId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoadStatus('error')
        setLoadError(data.error || 'Could not load order')
        return
      }
      setForm(f => ({
        ...f,
        customerEmail: data.customerEmail || f.customerEmail,
        customerName: data.customerName || f.customerName,
        orderReference: data.orderNumber || f.orderReference,
      }))
      setOrderSummary(data)
      setLoadStatus('loaded')
    } catch (err) {
      setLoadStatus('error')
      setLoadError('Network error — please try again')
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')
    try {
      const res = await fetch('/.netlify/functions/send-shipping-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, personalMessage, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrorMessage(data.error || 'Something went wrong')
        return
      }
      setStatus('sent')
      setForm({})
      setPersonalMessage('')
      setOrderSummary(null)
    } catch (err) {
      setStatus('error')
      setErrorMessage('Network error — please try again')
    }
  }

  return (
    <Layout>
      <section className="min-h-screen px-6 py-32 bg-dust-grey-50">
        <div className="max-w-lg mx-auto">
          <h1
            className="text-dust-grey-950 mb-8"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}
          >
            Send Shipping Notification
          </h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-dust-grey-800 mb-1">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950"
            />
          </div>

          {sessionId && (
            <div className="mb-8 p-4 border border-dust-grey-300 rounded bg-white">
              <p className="text-sm text-dust-grey-800 mb-3">
                This link is pre-loaded with an order. Enter the password above, then load its details.
              </p>
              <button
                type="button"
                onClick={handleLoadOrder}
                disabled={!password || loadStatus === 'loading'}
                className="bg-dust-grey-950 hover:bg-black disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded transition-colors uppercase tracking-widest text-xs"
              >
                {loadStatus === 'loading' ? 'Loading…' : 'Load Order Details'}
              </button>
              {loadStatus === 'error' && <p className="text-red-700 text-sm mt-2">{loadError}</p>}
              {orderSummary && (
                <div className="mt-4 pt-4 border-t border-dust-grey-200 text-sm text-dust-grey-700 space-y-2">
                  {orderSummary.shippingAddress && (
                    <p>
                      <strong>Ship to:</strong> {orderSummary.shippingAddress}
                    </p>
                  )}
                  {orderSummary.lineItems?.length > 0 && (
                    <ul className="list-disc list-inside">
                      {orderSummary.lineItems.map((li, i) => (
                        <li key={i}>
                          {li.quantity} × {li.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {FIELDS.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-dust-grey-800 mb-1">
                  {field.label}
                  {field.required && ' *'}
                </label>
                <input
                  type={field.type}
                  required={field.required}
                  value={form[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                  className="w-full px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-dust-grey-800 mb-1">
                Personal Message to Customer
              </label>
              <textarea
                rows={4}
                value={personalMessage}
                onChange={e => setPersonalMessage(e.target.value)}
                className="w-full px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950"
                placeholder="Optional — added to the email just above the sign-off"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-rusty-spice-500 hover:bg-rusty-spice-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded transition-colors uppercase tracking-widest text-sm"
            >
              {status === 'sending' ? 'Sending…' : 'Send Notification'}
            </button>

            {status === 'sent' && (
              <p className="text-green-700 text-sm">Email sent successfully.</p>
            )}
            {status === 'error' && (
              <p className="text-red-700 text-sm">{errorMessage}</p>
            )}
          </form>
        </div>
      </section>
    </Layout>
  )
}

export function Head() {
  return <meta name="robots" content="noindex, nofollow" />
}
