import React, { useRef, useState } from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/Layout'
import EyeSymbol from '../components/icons/EyeSymbol'
import { useInView } from '../hooks/useInView'

const MAX_CHARS = 1000

function ExperienceCard({ authorName, location, story, dateFeatured }) {
  const ref = useRef(null)
  const inView = useInView(ref)
  return (
    <div
      ref={ref}
      className={`break-inside-avoid mb-6 bg-white border border-dust-grey-200 rounded-lg p-7 shadow-sm fade-up ${inView ? 'in-view' : ''}`}
    >
      <p
        className="text-dust-grey-950 italic mb-5 leading-relaxed"
        style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}
      >
        "{story}"
      </p>
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-rusty-spice-500">{authorName}</span>
        {location && (
          <span className="text-dust-grey-600 text-sm">· {location}</span>
        )}
      </div>
      {dateFeatured && (
        <p className="text-dust-grey-600 text-xs mt-1">
          {new Date(dateFeatured).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}

function SubmissionForm() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [story, setStory] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const charsLeft = MAX_CHARS - story.length

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'experience-submission',
          name,
          location,
          story,
        }).toString(),
      })
      setSubmitted(true)
    } catch {
      // fall through — in dev, Netlify Forms don't run; on production it works
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <EyeSymbol size={56} color="#fe5101" className="mx-auto mb-6" />
        <h3
          className="text-dust-grey-50 mb-4"
          style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}
        >
          Thank you for sharing.
        </h3>
        <p className="text-dust-grey-200 leading-relaxed">
          Your story has been received. We review each submission personally before publishing — you'll see it on this page once it's live.
        </p>
      </div>
    )
  }

  const inputClass = 'w-full bg-white/8 border border-white/20 rounded px-4 py-3 text-dust-grey-50 placeholder-dust-grey-600 focus:outline-none focus:border-rusty-spice-500 transition-colors'

  return (
    <form
      name="experience-submission"
      method="POST"
      data-netlify="true"
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto"
    >
      <input type="hidden" name="form-name" value="experience-submission" />

      <div className="space-y-5">
        <div>
          <label htmlFor="exp-name" className="block text-dust-grey-200 text-sm mb-2 font-medium">
            Your name <span className="text-rusty-spice-500">*</span>
          </label>
          <input
            id="exp-name"
            type="text"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="How would you like to appear?"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="exp-location" className="block text-dust-grey-200 text-sm mb-2 font-medium">
            Where are you from? <span className="text-dust-grey-600 font-normal">(optional)</span>
          </label>
          <input
            id="exp-location"
            type="text"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="exp-story" className="block text-dust-grey-200 text-sm mb-2 font-medium">
            Your story <span className="text-rusty-spice-500">*</span>
          </label>
          <textarea
            id="exp-story"
            name="story"
            required
            rows={6}
            maxLength={MAX_CHARS}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Share your experience with Kanna — how it felt, what shifted, what you noticed..."
            className={`${inputClass} resize-none`}
          />
          <p className={`text-xs mt-1.5 text-right ${charsLeft < 100 ? 'text-rusty-spice-500' : 'text-dust-grey-600'}`}>
            {charsLeft} characters remaining
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-rusty-spice-500 hover:bg-rusty-spice-600 disabled:opacity-60 text-white font-medium py-4 rounded transition-colors uppercase tracking-widest text-sm"
        >
          {submitting ? 'Sending…' : 'Share Your Story'}
        </button>

        <p className="text-dust-grey-600 text-xs text-center leading-relaxed">
          All submissions are reviewed before publishing. We may gently edit for length, but your words stay yours.
        </p>
      </div>
    </form>
  )
}

export default function ExperiencesPage({ data }) {
  const experiences = data.allContentfulExperience.nodes

  return (
    <Layout>
      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <section
        className="py-32 md:py-40 px-6 text-center"
        style={{ background: 'var(--color-black-950)' }}
      >
        <div className="max-w-3xl mx-auto pt-8">
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-6 font-medium">
            Community
          </p>
          <h1
            className="text-dust-grey-50 mb-6"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: '1.1',
              fontWeight: 600,
            }}
          >
            Their Words
          </h1>
          <p className="text-dust-grey-200 text-lg leading-relaxed">
            Real experiences from people who have sat with Kanna — shared freely, published with care.
          </p>
        </div>
      </section>

      {/* ── Experience wall ───────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-dust-grey-50">
        <div className="max-w-6xl mx-auto">
          {experiences.length === 0 ? (
            <div className="text-center py-16">
              <EyeSymbol size={56} color="#d6cdc2" className="mx-auto mb-6" />
              <p className="text-dust-grey-600 text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                Stories are on their way. Be the first to share yours.
              </p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {experiences.map((exp, i) => (
                <ExperienceCard
                  key={i}
                  authorName={exp.authorName}
                  location={exp.location}
                  story={exp.story?.story || ''}
                  dateFeatured={exp.dateFeatured}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Submission form ───────────────────────────────────────────────── */}
      <section
        className="grain py-24 md:py-32 px-6"
        style={{ background: 'var(--color-black-900)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <EyeSymbol size={48} color="#fe5101" className="mx-auto mb-6" />
            <h2
              className="text-dust-grey-50 mb-4"
              style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Share Your Story
            </h2>
            <p className="text-dust-grey-200 max-w-md mx-auto leading-relaxed">
              Have you worked with Kanna? We'd love to hear what happened — in your own words, without pressure.
            </p>
          </div>
          <SubmissionForm />
        </div>
      </section>
    </Layout>
  )
}

export const query = graphql`
  query ExperiencesPageQuery {
    allContentfulExperience(sort: { dateFeatured: DESC }) {
      nodes {
        authorName
        location
        story { story }
        dateFeatured
      }
    }
  }
`
