import React, { useState } from 'react'
import Layout from '../../components/Layout'

const FIELDS = [
  { name: 'companyName', label: 'Company Name', type: 'text' },
  { name: 'contactName', label: 'Contact Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'country', label: 'Country', type: 'text' },
  { name: 'vatOrRegNumber', label: 'VAT / Registration Number', type: 'text', optional: true },
]

export default function WholesaleApplyPage() {
  const [form, setForm] = useState({})
  const [intendedUse, setIntendedUse] = useState('')
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | 'error'
  const [error, setError] = useState('')

  const handleChange = (name, value) => setForm(f => ({ ...f, [name]: value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/.netlify/functions/wholesale-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, intendedUse }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setError(data.error || 'Something went wrong')
        return
      }
      setStatus('sent')
    } catch {
      setStatus('error')
      setError('Network error — please try again')
    }
  }

  return (
    <Layout>
      <section className="min-h-screen px-6 py-32 bg-dust-grey-50">
        <div className="max-w-lg mx-auto">
          <h1
            className="text-dust-grey-950 mb-4"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}
          >
            Apply for Wholesale Access
          </h1>
          <p className="text-dust-grey-600 text-sm mb-8">
            We review every application by hand. Once approved, you'll get an email to set up your
            account and log in to the wholesale portal.
          </p>

          {status === 'sent' ? (
            <div className="p-6 bg-white border border-dust-grey-200 rounded">
              <p className="text-dust-grey-800">
                Thanks — your application has been submitted. We'll be in touch once it's reviewed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {FIELDS.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-dust-grey-800 mb-1">
                    {field.label}
                    {!field.optional && ' *'}
                  </label>
                  <input
                    type={field.type}
                    required={!field.optional}
                    value={form[field.name] || ''}
                    onChange={e => handleChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-dust-grey-800 mb-1">
                  Tell us about your intended use *
                </label>
                <p className="text-dust-grey-600 text-xs mb-2">
                  Are you reselling as-is, or repackaging under your own brand? If repackaging — we'd
                  love a mention of Bushman's Blessing on your packaging.
                </p>
                <textarea
                  required
                  rows={4}
                  value={intendedUse}
                  onChange={e => setIntendedUse(e.target.value)}
                  className="w-full px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="bg-rusty-spice-500 hover:bg-rusty-spice-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded transition-colors uppercase tracking-widest text-sm"
              >
                {status === 'sending' ? 'Submitting…' : 'Submit Application'}
              </button>

              {status === 'error' && <p className="text-red-700 text-sm">{error}</p>}
            </form>
          )}
        </div>
      </section>
    </Layout>
  )
}

export function Head() {
  return <meta name="robots" content="noindex, nofollow" />
}
