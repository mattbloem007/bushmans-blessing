import React, { useState } from 'react'
import config from '../../../shared/kanna-online.json'
import Layout from '../../components/Layout'

const { event } = config

function formatPrice(cents) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function formatAddress(address) {
  if (!address) return '—'
  return [address.line1, address.line2, address.postal_code, address.city, address.country]
    .filter(Boolean)
    .join(', ')
}

// Password-gated tools for the temporary Kanna Online page: who has a place,
// the mailing list as CSV, and sending the Jitsi link on the day. Backed by
// experience-admin.js, which reuses ADMIN_SHIP_SECRET.
export default function AdminExperiencePage() {
  const [password, setPassword] = useState('')
  const [participants, setParticipants] = useState(null)
  const [counts, setCounts] = useState(null)
  const [emailsCsv, setEmailsCsv] = useState('')
  const [listStatus, setListStatus] = useState(null) // null | 'loading' | 'loaded' | 'error'
  const [listError, setListError] = useState('')

  const [joinUrl, setJoinUrl] = useState(event.joinUrl)
  const [message, setMessage] = useState('')
  const [resendAll, setResendAll] = useState(false)
  const [sendStatus, setSendStatus] = useState(null) // null | 'sending' | 'sent' | 'error'
  const [sendResult, setSendResult] = useState('')

  const call = async payload => {
    const res = await fetch('/.netlify/functions/experience-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  const handleLoad = async () => {
    setListStatus('loading')
    setListError('')
    try {
      const data = await call({ action: 'list' })
      setParticipants(data.participants)
      setCounts(data.counts)
      setEmailsCsv(data.emailsCsv)
      setListStatus('loaded')
    } catch (err) {
      setListStatus('error')
      setListError(err.message)
    }
  }

  const handleDownloadCsv = () => {
    const blob = new Blob([emailsCsv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kanna-online-participants-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSend = async () => {
    if (!window.confirm(`Send the join link to ${resendAll ? counts?.total : (counts?.total ?? 0) - (counts?.linkSent ?? 0)} people?`)) {
      return
    }
    setSendStatus('sending')
    setSendResult('')
    try {
      const data = await call({ action: 'send-join-link', joinUrl, message, resendAll })
      setSendStatus('sent')
      setSendResult(
        `Sent ${data.sent}. Skipped ${data.skipped} (already had it).` +
          (data.failed?.length ? ` Failed: ${data.failed.join(', ')}` : '')
      )
      await handleLoad()
    } catch (err) {
      setSendStatus('error')
      setSendResult(err.message)
    }
  }

  return (
    <Layout>
      <section className="min-h-screen px-6 py-32 bg-dust-grey-50">
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-dust-grey-950 mb-2"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}
          >
            {event.title} — participants
          </h1>
          <p className="text-dust-grey-600 text-sm mb-8">
            {event.dateLabel} · {event.timeLabel}
          </p>

          <div className="mb-8">
            <label className="block text-sm font-medium text-dust-grey-800 mb-1">Password *</label>
            <div className="flex gap-3">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="flex-1 px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950"
              />
              <button
                type="button"
                onClick={handleLoad}
                disabled={!password || listStatus === 'loading'}
                className="bg-dust-grey-950 hover:bg-black disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded transition-colors uppercase tracking-widest text-xs"
              >
                {listStatus === 'loading' ? 'Loading…' : 'Load participants'}
              </button>
            </div>
            {listStatus === 'error' && <p className="text-red-700 text-sm mt-2">{listError}</p>}
          </div>

          {participants && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {[
                  ['Places', counts.total],
                  ['Experience only', counts.experience],
                  ['Sample', counts.sample],
                  ['Bottle', counts.bottle],
                  ['Parcels to post', counts.parcels],
                ].map(([label, value]) => (
                  <div key={label} className="border border-dust-grey-300 rounded bg-white p-3 text-center">
                    <p
                      className="text-dust-grey-950 text-2xl"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {value}
                    </p>
                    <p className="text-dust-grey-600 text-[0.65rem] uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="border border-dust-grey-950/20 hover:border-rusty-spice-500 hover:text-rusty-spice-500 text-dust-grey-950 font-medium px-5 py-2.5 rounded transition-colors uppercase tracking-widest text-xs"
                >
                  Download CSV ({participants.length})
                </button>
                <span className="text-dust-grey-600 text-xs self-center">
                  Includes name, email, option, amount, address and join-link status.
                </span>
              </div>

              {participants.length === 0 ? (
                <p className="text-dust-grey-600 text-sm border border-dust-grey-300 rounded bg-white p-6">
                  No places sold yet.
                </p>
              ) : (
                <div className="overflow-x-auto border border-dust-grey-300 rounded bg-white mb-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-dust-grey-600 text-xs uppercase tracking-wider">
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Option</th>
                        <th className="p-3">Paid</th>
                        <th className="p-3">Address</th>
                        <th className="p-3">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map(p => (
                        <tr key={p.sessionId} className="border-t border-dust-grey-200 align-top">
                          <td className="p-3 text-dust-grey-950">{p.name || '—'}</td>
                          <td className="p-3 text-dust-grey-950 break-all">{p.email}</td>
                          <td className="p-3 text-dust-grey-800">{p.optionLabel}</td>
                          <td className="p-3 text-dust-grey-800">{formatPrice(p.amountPaid)}</td>
                          <td className="p-3 text-dust-grey-600 text-xs">{formatAddress(p.shippingAddress)}</td>
                          <td className="p-3 text-dust-grey-600 text-xs">
                            {p.joinLinkSentAt ? p.joinLinkSentAt.slice(0, 10) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="border border-dust-grey-300 rounded bg-white p-6">
                <h2
                  className="text-dust-grey-950 mb-1"
                  style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem' }}
                >
                  Send the join link
                </h2>
                <p className="text-dust-grey-600 text-sm mb-5">
                  One email per participant, with the link below. Anyone who already received it is
                  skipped unless you tick the box.
                </p>

                <label className="block text-sm font-medium text-dust-grey-800 mb-1">Join link</label>
                <input
                  type="url"
                  value={joinUrl}
                  onChange={e => setJoinUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950 mb-4"
                />

                <label className="block text-sm font-medium text-dust-grey-800 mb-1">
                  Optional message
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Added above the practical notes in the email"
                  className="w-full px-3 py-2 border border-dust-grey-300 rounded bg-white text-dust-grey-950 mb-4"
                />

                <label className="flex items-center gap-2 text-sm text-dust-grey-800 mb-5">
                  <input
                    type="checkbox"
                    checked={resendAll}
                    onChange={e => setResendAll(e.target.checked)}
                  />
                  Re-send to people who already received the link
                </label>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!counts?.total || sendStatus === 'sending'}
                  className="bg-rusty-spice-500 hover:bg-rusty-spice-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded transition-colors uppercase tracking-widest text-sm"
                >
                  {sendStatus === 'sending'
                    ? 'Sending…'
                    : `Send to ${resendAll ? counts.total : counts.total - counts.linkSent} participant${counts.total - counts.linkSent === 1 ? '' : 's'}`}
                </button>

                {sendStatus === 'sent' && <p className="text-green-700 text-sm mt-3">{sendResult}</p>}
                {sendStatus === 'error' && <p className="text-red-700 text-sm mt-3">{sendResult}</p>}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}

export function Head() {
  return <meta name="robots" content="noindex, nofollow" />
}
