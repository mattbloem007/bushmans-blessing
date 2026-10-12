import React, { useState } from 'react'
import { navigate, Link } from 'gatsby'
import Layout from '../../components/Layout'

export default function WholesaleLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null) // null | 'sending' | 'error'
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/.netlify/functions/wholesale-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setError(data.error || 'Could not log in')
        return
      }
      navigate('/wholesale/portal/')
    } catch {
      setStatus('error')
      setError('Network error — please try again')
    }
  }

  return (
    <Layout>
      <section className="min-h-screen px-6 py-32 bg-dust-grey-50">
        <div className="max-w-sm mx-auto">
          <h1
            className="text-dust-grey-950 mb-8"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}
          >
            Wholesale Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dust-grey-800 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dust-grey-800 mb-1">Password</label>
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
              {status === 'sending' ? 'Logging in…' : 'Log In'}
            </button>

            {status === 'error' && <p className="text-red-700 text-sm">{error}</p>}
          </form>

          <p className="mt-8 text-dust-grey-600 text-sm">
            Not a wholesaler yet?{' '}
            <Link to="/wholesale/apply" className="text-rusty-spice-500 underline">
              Apply for access
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  )
}

export function Head() {
  return <meta name="robots" content="noindex, nofollow" />
}
