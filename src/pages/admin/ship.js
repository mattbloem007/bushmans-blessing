import React, { useState } from 'react'
import Layout from '../../components/Layout'

const FIELDS = [
  { name: 'customerEmail', label: 'Customer Email', required: true, type: 'email' },
  { name: 'customerName', label: 'Customer Name', required: false, type: 'text' },
  { name: 'orderReference', label: 'Order Reference (Stripe session ID)', required: false, type: 'text' },
  { name: 'carrier', label: 'Carrier', required: false, type: 'text' },
  { name: 'trackingNumber', label: 'Tracking Number', required: false, type: 'text' },
  { name: 'trackingUrl', label: 'Tracking URL', required: false, type: 'text' },
]

export default function AdminShipPage() {
  const [form, setForm] = useState({})
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (name, value) => setForm(f => ({ ...f, [name]: value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')
    try {
      const res = await fetch('/.netlify/functions/send-shipping-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrorMessage(data.error || 'Something went wrong')
        return
      }
      setStatus('sent')
      setForm({})
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
              <label className="block text-sm font-medium text-dust-grey-800 mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950"
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
