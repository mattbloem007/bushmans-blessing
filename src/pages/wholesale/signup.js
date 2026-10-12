import React, { useState } from 'react'
import { navigate } from 'gatsby'
import Layout from '../../components/Layout'

export default function WholesaleSignupPage({ location }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState(null) // null | 'sending' | 'error' | 'done'
  const [error, setError] = useState('')

  const token = new URLSearchParams(location?.search || '').get('token')

  const handleSubmit = async e => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/.netlify/functions/wholesale-complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setError(data.error || 'Could not complete signup')
        return
      }
      setStatus('done')
      setTimeout(() => navigate('/wholesale/login'), 1500)
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
            className="text-dust-grey-950 mb-4"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}
          >
            Set Your Password
          </h1>

          {!token ? (
            <p className="text-red-700 text-sm">This link is missing its token — please use the link from your email.</p>
          ) : status === 'done' ? (
            <p className="text-dust-grey-800">Account set up — redirecting you to log in…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-dust-grey-800 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dust-grey-800 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="bg-rusty-spice-500 hover:bg-rusty-spice-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded transition-colors uppercase tracking-widest text-sm"
              >
                {status === 'sending' ? 'Saving…' : 'Set Password'}
              </button>

              {(status === 'error' || error) && <p className="text-red-700 text-sm">{error}</p>}
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
