import React, { useEffect, useRef, useState } from 'react'
import { graphql, Link } from 'gatsby'
import config from '../../../shared/kanna-online.json'
import Layout from '../../components/Layout'
import Seo from '../../components/Seo'
import KannaSymbol from '../../components/icons/KannaSymbol'
import ElandSilhouette from '../../components/icons/ElandSilhouette'
import BushmanFigure from '../../components/icons/BushmanFigure'
import RunningSpottedFigure from '../../components/icons/RunningSpottedFigure'
import WavyDivider from '../../components/WavyDivider'
import EntopticDots from '../../components/icons/EntopticDots'
import { useInView } from '../../hooks/useInView'
import KannaOnlineCheckoutButton from '../../components/KannaOnlineCheckoutButton'

const { event, bundleCutoff, options } = config
const CHEAPEST = Math.min(...options.map(option => option.priceInCents))
// Every option sends the same per-place cost to Mantis Collective; the page
// only advertises it if the config actually carries one.
const MANTIS_SHARE = Math.min(...options.map(option => option.mantisShareCents || 0))

function formatPrice(cents) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function Chapter({ id, eyebrow, title, tone = 'light', className = '', children }) {
  const ref = useRef(null)
  const inView = useInView(ref)
  const dark = tone === 'dark'

  return (
    <section
      id={id}
      className={`relative py-24 md:py-32 px-6 ${dark ? 'grain' : ''}`}
      style={{
        background: dark
          ? 'var(--color-black-900)'
          : tone === 'mid'
            ? 'var(--color-dust-grey-100)'
            : 'var(--color-dust-grey-50)',
      }}
    >
      <div ref={ref} className={`mx-auto fade-up ${inView ? 'in-view' : ''} ${className}`}>
        {eyebrow && (
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.25em] mb-4 font-medium">
            {eyebrow}
          </p>
        )}
        {title && (
          <h2
            className={`mb-8 ${dark ? 'text-dust-grey-50' : 'text-dust-grey-950'}`}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: '1.2',
            }}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  )
}

function P({ dark = false, size = 'md', className = '', children }) {
  return (
    <p
      className={`${size === 'sm' ? 'text-sm' : 'text-base md:text-lg'} leading-relaxed ${
        dark ? 'text-dust-grey-200' : 'text-dust-grey-950/80'
      } ${className}`}
    >
      {children}
    </p>
  )
}

const EVENING = [
  {
    title: 'Arriving',
    text: 'We open with a few minutes to land — who you are, where you are joining from, and what brought you here. No performance, no introductions you have to rehearse.',
  },
  {
    title: 'The story',
    text: 'Kanna and the First People, the names the plant has carried, and the fermentation that turns a plant into a practice. The longest part of the evening, and the one worth taking slowly.',
  },
  {
    title: 'The science, plainly',
    text: 'Mesembrine, mesembrenone, and what research has actually observed. No jargon, and no overclaiming — we will be as honest about what is not yet known as about what is.',
  },
  {
    title: 'The felt sense',
    text: 'A guided practice in paying attention: to breath, to body, to whatever is moving under the surface. If you have a sample or a bottle, this is where you would take it. Nobody has to, and nobody will be asked to report on it.',
  },
  {
    title: 'The circle',
    text: 'An unhurried, optional space to say what you noticed — or to say nothing at all. Usually the part people remember afterwards.',
  },
  {
    title: 'Closing',
    text: 'A short grounding practice, and a way to carry the evening into the week that follows.',
  },
]

const STEPS = [
  {
    title: 'Choose an option',
    text: 'Pay by card. Checkout collects your email address — that is the address we use for everything from here on.',
  },
  {
    title: 'Confirmation lands',
    text: 'A confirmation arrives immediately with the date, the time, and what you chose. Reply to it any time; it comes straight to us.',
  },
  {
    title: 'The link, on the day',
    text: `A few hours before we begin, the ${event.platform} link is sent to that same address. No account, no app — it opens in your browser.`,
  },
  {
    title: 'Bundles by 21 November',
    text: `Samples and bottles are posted so they reach you before the evening. Order by ${bundleCutoff.label} for a parcel; after that the experience on its own stays open.`,
  },
]

const OPTION_COPY = {
  experience: {
    badge: null,
    blurb: 'Your place on the evening, and nothing to wait for in the post.',
    includes: [
      'The full live gathering',
      `${event.durationLabel} on ${event.platform}`,
      'Join link sent to your email on the day',
      'A short follow-up note afterwards',
    ],
    note: 'For anyone who already has Kanna at home, or who would simply like to listen.',
  },
  'experience-sample': {
    badge: 'Includes the plant',
    blurb: 'The evening, plus a small sample posted to you in time to take part with it.',
    includes: [
      'Everything in the experience',
      "A 5ml sample of Bushman's Blessing Kanna Tincture",
      'Posted to arrive before 28 November',
      'EU & UK delivery',
    ],
    note: 'Enough to meet the plant for the first time, in company.',
  },
  'experience-bottle': {
    badge: 'The full bottle',
    blurb: 'The evening, plus a full bottle of the tincture — the same one we sell in the shop.',
    includes: [
      'Everything in the experience',
      "A full bottle of Bushman's Blessing Kanna Tincture",
      'Posted to arrive before 28 November',
      'EU & UK delivery',
    ],
    note: 'That same bottle is €44 on its own in the shop.',
  },
}

const FAQ = [
  {
    q: 'Do I have to take Kanna to join?',
    a: 'No. Plenty of people come for the story, the science and the company. The plant is an invitation, never a requirement, and there is no moment in the evening where you are expected to have taken anything.',
  },
  {
    q: "I've never tried it. Is this a good first time?",
    a: 'Yes — a small group and an unhurried pace is a good place to start. If you would like to feel it for the first time with company, take one of the options that includes a sample or a bottle.',
  },
  {
    q: 'What time is that where I am?',
    a: `We begin at ${event.timeLabel}. In other words: 18:00 in London, 19:00 in Berlin and Amsterdam, 20:00 in Cape Town and Johannesburg, 13:00 in New York. The confirmation email repeats it.`,
  },
  {
    q: 'Will it be recorded?',
    a: 'No. The gathering is not recorded, so the room stays a room — what is shared in it stays in it.',
  },
  {
    q: 'My parcel has not arrived. Should I still come?',
    a: 'Yes. Reply to your confirmation email and we will chase it, but the evening does not depend on it — come anyway and we will make sure you are looked after.',
  },
  {
    q: 'Is any of this medical?',
    a: "No. Kanna is a botanical preparation, not a medicine. Nothing on this page or in the evening is medical advice, diagnosis or treatment, and we will not present it as such. If you are pregnant, breastfeeding, or taking prescribed medication, please speak to your doctor before trying it.",
  },
  {
    q: 'What if my plans change?',
    a: 'Email us before the day and we will do what we can — usually moving your place to a future gathering. If a parcel has already been posted, we will sort that out between us.',
  },
]

function PricingCard({ option, closed }) {
  const copy = OPTION_COPY[option.id]
  const unavailable = option.requiresShipping && closed

  return (
    <div
      className={`relative flex flex-col rounded-lg border p-7 text-left transition-colors ${
        option.id === 'experience-sample'
          ? 'border-rusty-spice-500 bg-white shadow-md'
          : 'border-dust-grey-200 bg-white/70'
      } ${unavailable ? 'opacity-60' : ''}`}
    >
      {copy.badge && (
        <span className="absolute -top-3 left-7 bg-rusty-spice-500 text-white text-[0.65rem] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
          {copy.badge}
        </span>
      )}

      <h3
        className="text-dust-grey-950 text-xl mb-1"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {option.label}
      </h3>
      <p
        className="text-dust-grey-950 mb-1"
        style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', lineHeight: '1.1' }}
      >
        {formatPrice(option.priceInCents)}
      </p>
      <p className="text-dust-grey-600 text-xs mb-5">
        {option.requiresShipping ? 'plus shipping' : 'no shipping — nothing to post'}
      </p>

      <p className="text-dust-grey-950/80 text-sm leading-relaxed mb-5">{copy.blurb}</p>

      <ul className="space-y-2 mb-6 flex-1">
        {copy.includes.map(item => (
          <li key={item} className="text-dust-grey-950/80 text-sm leading-relaxed flex gap-2">
            <span className="text-rusty-spice-500 shrink-0" aria-hidden="true">
              —
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {unavailable ? (
        <p className="text-center text-xs uppercase tracking-widest text-dust-grey-600 border border-dust-grey-300 rounded px-4 py-4">
          Posting closed on {bundleCutoff.label}
        </p>
      ) : (
        <KannaOnlineCheckoutButton
          option={option}
          className="w-full bg-dust-grey-950 hover:bg-rusty-spice-500 text-white font-medium px-6 py-3.5 rounded transition-colors uppercase tracking-widest text-xs"
        >
          Reserve — {formatPrice(option.priceInCents)}
        </KannaOnlineCheckoutButton>
      )}

      <p className="text-dust-grey-600 text-xs leading-relaxed mt-4">{copy.note}</p>
    </div>
  )
}

export default function KannaOnlinePage() {
  // The cut-off is enforced server-side too; this only decides what the page
  // shows. Kept out of the initial render so static HTML and hydration can't
  // disagree about what time it is.
  const [now, setNow] = useState(null)
  useEffect(() => setNow(Date.now()), [])

  const bundleClosed = now !== null && now > Date.parse(bundleCutoff.atISO)

  return (
    <Layout heroPage>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center text-center px-6"
        style={{
          background:
            'linear-gradient(165deg, var(--color-black-950) 0%, var(--color-black-900) 62%, color-mix(in srgb, var(--color-rusty-spice-600) 22%, var(--color-black-900)) 100%)',
        }}
      >
        <KannaSymbol
          size={520}
          color="#fe5101"
          className="absolute inset-0 m-auto opacity-[0.06] pointer-events-none"
        />
        <div className="relative max-w-4xl mx-auto pt-28 pb-16">
          <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.28em] mb-6 font-medium">
            A live online gathering
          </p>
          <h1
            className="text-dust-grey-50 mb-6"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(3rem, 9vw, 6.5rem)',
              lineHeight: '1.02',
              fontWeight: 600,
            }}
          >
            Kanna, Online
          </h1>
          <p className="text-dust-grey-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            One plant, one evening, and a room full of people paying attention. An invitation to meet
            Kanna the way it has always been met — slowly, in company, with time enough to notice.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 text-sm text-dust-grey-200">
            <span className="uppercase tracking-[0.18em] text-xs">{event.dateLabel}</span>
            <span className="hidden sm:inline text-rusty-spice-500">·</span>
            <span className="uppercase tracking-[0.18em] text-xs">{event.timeLabel}</span>
            <span className="hidden sm:inline text-rusty-spice-500">·</span>
            <span className="uppercase tracking-[0.18em] text-xs">{event.durationLabel}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#reserve"
              className="inline-flex items-center justify-center bg-rusty-spice-500 hover:bg-rusty-spice-600 text-white font-medium px-8 py-4 rounded transition-colors uppercase tracking-widest text-sm no-underline"
            >
              Reserve your place — from {formatPrice(CHEAPEST)}
            </a>
            <a
              href="#story"
              className="inline-flex items-center justify-center border border-dust-grey-200/30 hover:border-rusty-spice-500 text-dust-grey-200 hover:text-rusty-spice-500 font-medium px-8 py-4 rounded transition-colors uppercase tracking-widest text-sm no-underline"
            >
              Read the story
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 px-8 opacity-10">
          <WavyDivider color="var(--color-dust-grey-200)" />
        </div>
      </section>

      {/* ── Invitation ───────────────────────────────────────────────────── */}
      <Chapter
        id="story"
        eyebrow="Before we begin"
        title="Something the modern world has quietly lost"
        className="max-w-3xl"
      >
        <div className="space-y-6">
          <P>
            We carry devices that can summon almost anything in seconds. Our attention is pulled in a
            hundred directions at once — notifications, news cycles, feeds engineered to keep us
            scrolling. And alongside all that connection, something has been quietly eroding: the
            ability to sit with another person, and actually be there. Undistracted. Unhurried.
            Present.
          </P>
          <P>
            Kanna was never taken alone, or in a hurry, or on the move. It was chewed slowly, in
            company, as a reason to stay somewhere a little longer. That is the practice — not the
            plant on its own, but the plant and the circle around it.
          </P>
          <P>
            On {event.dateLabel} we are gathering online to do exactly that: one
            evening, a small group, and enough unhurried time to tell the story properly, look honestly
            at what the science has found, and sit together with whatever the plant brings up.
          </P>
          <P className="text-dust-grey-950">
            Cameras optional. Microphones optional. You are welcome to simply listen.
          </P>
        </div>
        <div className="mt-12 opacity-20">
          <WavyDivider color="var(--color-saddle-brown-500)" />
        </div>
      </Chapter>

      {/* ── The plant ────────────────────────────────────────────────────── */}
      <Chapter
        tone="mid"
        eyebrow="Chapter One"
        title="A relationship without beginning"
        className="max-w-6xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-6">
            <P>
              There is a moment, somewhere in the deep past of Southern Africa, that we will never be
              able to pinpoint. A person — one of the First People of this land — bent toward a small,
              fleshy plant growing in the desert of the Karoo. Perhaps it was hunger that led them
              there. Perhaps curiosity. Perhaps something closer to the knowing that comes from living
              so intimately with a landscape that the plants begin to speak.
            </P>
            <P>
              Whatever led them there, what followed was a relationship. One of the oldest between a
              human being and a plant that we are aware of, anywhere on earth.
            </P>
            <P>
              The plant has carried many names. <em>Sceletium tortuosum</em> to the botanists. Kanna to
              those who first gathered it. <em>Kougoed</em> — “something to chew” — to the people who
              worked with it daily. That last name tells you what it was: not a rare thing locked away
              for special occasions, but a companion. Carried on long hunts. Offered at moments of
              grief. Shared around fires in conversations that needed opening.
            </P>
            <P className="text-dust-grey-950 italic" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
              A companion for arrival, not escape.
            </P>
          </div>
          <div className="flex flex-col items-center gap-10">
            <ElandSilhouette size={220} color="#d0672f" className="opacity-40" />
            <div className="flex items-end gap-10">
              <BushmanFigure size={96} color="#d0672f" className="opacity-30" />
              <RunningSpottedFigure size={96} color="#d0672f" className="opacity-30" />
            </div>
          </div>
        </div>
      </Chapter>

      {/* ── Science ──────────────────────────────────────────────────────── */}
      <Chapter eyebrow="Chapter Two" title="What the science describes" tone="dark" className="max-w-6xl">
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <EntopticDots
            rows={5}
            cols={18}
            gap={16}
            dotSize={2}
            color="#fe5101"
            className="absolute top-8 right-0 opacity-[0.06]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 items-start">
          <div className="lg:col-span-2 flex justify-center lg:justify-start">
            <KannaSymbol size={200} color="#fe5101" className="opacity-60" />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <P dark>
              There is a question that comes up whenever someone meets Kanna for the first time: what
              does it actually do? The honest answer depends on how you ask. Talk to a chemist and they
              will point to alkaloids. Talk to someone who has worked with the plant for years and they
              will reach for different language entirely. The remarkable thing is that both answers are
              pointing toward the same truth.
            </P>

            <div className="space-y-6">
              <div className="border-l-2 border-rusty-spice-500 pl-6">
                <h3 className="text-dust-grey-50 text-xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Mesembrine — the serotonin side
                </h3>
                <P dark>
                  The most studied of Kanna’s alkaloids, and the one most of the research is built
                  around. It is described as a serotonin reuptake inhibitor: it slows the rate at which
                  serotonin is cleared from the spaces between nerve cells, extending the time that
                  signal has to be received. Serotonin is associated with mood stability, with a sense
                  of wellbeing, and with the capacity to feel present and connected to what is around
                  you.
                </P>
              </div>

              <div className="border-l-2 border-saddle-brown-500 pl-6">
                <h3 className="text-dust-grey-50 text-xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Mesembrenone — the dopamine side
                </h3>
                <P dark>
                  The second key alkaloid works through an entirely different route. It is a PDE4
                  inhibitor, studied for its role in supporting healthy dopamine signalling. Where
                  mesembrine works with serotonin, mesembrenone works with dopamine.
                </P>
              </div>
            </div>

            <P dark>
              Two of the body’s most important signalling systems, approached together — not by
              flooding either one, but by helping each find its own equilibrium. That combination is
              unusual. Most interventions are designed to work on a single system at a time.
            </P>
            <P dark className="text-sm italic">
              We go further into this on the night, in plain language — including the parts where the
              research is still young. Kanna is a botanical preparation rather than a medicine, so we
              talk about what studies have observed, not about what it will do for you.
            </P>
          </div>
        </div>
      </Chapter>

      {/* ── Ancient messenger ────────────────────────────────────────────── */}
      <Chapter eyebrow="Chapter Three" title="An ancient messenger" tone="dark" className="max-w-2xl text-center">
        <div className="space-y-6">
          <P dark>
            Serotonin is older than the nervous system itself. It exists in plants, in gut bacteria, in
            organisms with no brain to speak of. Long before anyone understood it as a mood-regulating
            chemical, it was simply a messenger — a way for cells to know they were not alone.
          </P>
          <P dark>
            Kanna’s relationship with that system is not new either. The plant and the molecule have
            been in conversation for a very long time. What the First People arrived at through
            generations of careful attention, science is only now learning to describe in precise
            terms.
          </P>
          <P dark className="italic">
            The relationship is ancient. The science is young. They are pointing toward the same thing.
          </P>
        </div>
        <div className="mt-14 opacity-30 flex justify-center">
          <WavyDivider color="var(--color-rusty-spice-500)" />
        </div>
      </Chapter>

      {/* ── Whole plant ──────────────────────────────────────────────────── */}
      <Chapter eyebrow="Chapter Four" title="Whole plant, whole effect" className="max-w-3xl">
        <div className="space-y-6">
          <P>
            The alkaloids do not work in isolation. The traditional fermentation — leaves and stems
            pressed together and left to undergo a slow, deliberate transformation, then dried in the
            open sun and turned by hand — changes the plant’s chemistry in ways that affect how the
            body receives it.
          </P>
          <P>
            This is why we work with the whole plant rather than extracts or isolates. A tincture built
            around one compound is a different thing entirely. It is not simply a delivery mechanism
            for mesembrine: the preparation is part of the effect, and what makes Kanna what it is
            cannot be separated from how it was made.
          </P>
          <P>
            Ours begins in the Baviaanskloof, a mountain wilderness where several of South Africa’s
            rarest biomes meet, grown low to the ground in the dappled shade of other dwarf shrubs. It
            is prepared with the plant keepers of Southern Africa, in the old way — not because that is
            romantic, but because something is lost when it is done any other way.
          </P>
        </div>
      </Chapter>

      {/* ── Balance ──────────────────────────────────────────────────────── */}
      <Chapter eyebrow="Chapter Five" title="A different kind of balance" tone="mid" className="max-w-3xl">
        <div className="space-y-6">
          <P>
            We live in a world largely optimised for dopamine — the brain’s seeking and reward system,
            activated by every notification, every scroll, every small hit of novelty. Over time that
            constant stimulation pulls the system away from its natural balance, and leaves us restless
            in a way that is hard to name.
          </P>
          <P>
            Kanna works with both sides of that equation: the chemistry of presence and genuine
            connection on one hand, healthy dopamine signalling on the other. The result is not
            sedation, and not suppression. It is equilibrium — a nervous system finding its way back to
            itself.
          </P>
          <P className="text-dust-grey-950 italic" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
            That is the territory we will be exploring together: not a peak, a settling.
          </P>
        </div>
      </Chapter>

      {/* ── The evening ──────────────────────────────────────────────────── */}
      <Chapter eyebrow="The evening" title="What the evening holds" className="max-w-4xl">
        <ol className="space-y-8">
          {EVENING.map((item, i) => (
            <li key={item.title} className="flex gap-6">
              <span
                className="text-rusty-spice-500 shrink-0 pt-1"
                style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', minWidth: '2rem' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3
                  className="text-dust-grey-950 text-xl mb-1"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {item.title}
                </h3>
                <P>{item.text}</P>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-dust-grey-600 text-sm leading-relaxed">
          We finish after {event.durationLabel}, and stay on a little longer for anyone who wants to keep
          talking. You will need a quiet-ish room, headphones if you have them, and a browser. Nothing
          else.
        </p>
      </Chapter>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <Chapter eyebrow="Practicalities" title="How it works online" tone="mid" className="max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="border-t border-dust-grey-950/15 pt-5">
              <p className="text-rusty-spice-500 text-xs uppercase tracking-[0.2em] mb-2">
                Step {i + 1}
              </p>
              <h3 className="text-dust-grey-950 text-lg mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {step.title}
              </h3>
              <P size="sm">{step.text}</P>
            </div>
          ))}
        </div>
        <p className="mt-10 text-dust-grey-600 text-xs leading-relaxed">
          Places are limited so the room stays a room. Checkout, receipts and the join link all come
          through Stripe and email — there is no account to create.
        </p>
      </Chapter>

      {/* ── Reserve ──────────────────────────────────────────────────────── */}
      <Chapter id="reserve" eyebrow="Reserve" title="Three ways to join" className="max-w-5xl">
        <P className="mb-3 max-w-2xl">
          The evening is the same in all three. The difference is whether the plant comes to you first
          — and whether you would rather meet it in your own hands on the night.
        </P>
        <p className="text-dust-grey-600 text-sm mb-10 max-w-2xl">
          Bundles close on {bundleCutoff.label} so that parcels arrive in time. After that, the
          experience-only place stays open right up to the evening.
        </p>

        {MANTIS_SHARE > 0 && (
          <p className="text-dust-grey-950 text-sm mb-10 max-w-2xl border-l-2 border-rusty-spice-500 pl-4">
            {formatPrice(MANTIS_SHARE)} of every place goes directly to Mantis Collective, our partners
            in Southern Africa.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {options.map(option => (
            <PricingCard key={option.id} option={option} closed={bundleClosed} />
          ))}
        </div>

        <p className="mt-8 text-dust-grey-600 text-xs leading-relaxed max-w-2xl">
          Prices include VAT where applicable; shipping is added at checkout for the two options with a
          parcel. Bundles post within the EU and UK only — if you are elsewhere and would like one,{' '}
          <Link to="/contact/" className="text-rusty-spice-500 no-underline hover:underline">
            write to us
          </Link>{' '}
          and we will see what is possible.
        </p>
      </Chapter>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <Chapter eyebrow="Questions" title="Before you decide" className="max-w-3xl">
        <div className="divide-y divide-dust-grey-200 border-y border-dust-grey-200">
          {FAQ.map(item => (
            <details key={item.q} className="group py-5">
              <summary className="flex items-start justify-between gap-6 cursor-pointer list-none">
                <span
                  className="text-dust-grey-950 text-lg"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {item.q}
                </span>
                <span className="text-rusty-spice-500 text-xl leading-none transition-transform group-open:rotate-45 shrink-0 pt-1">
                  +
                </span>
              </summary>
              <P size="sm" className="mt-3 pr-8">{item.a}</P>
            </details>
          ))}
        </div>
      </Chapter>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section
        className="grain relative py-24 md:py-32 px-6 text-center overflow-hidden"
        style={{ background: 'var(--color-black-950)' }}
      >
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <KannaSymbol size={340} color="#fe5101" className="absolute inset-0 m-auto opacity-[0.07]" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <KannaSymbol size={40} color="#fe5101" className="mx-auto mb-8" />
          <h2
            className="text-dust-grey-50 mb-5"
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: '1.15' }}
          >
            Come and sit with us.
          </h2>
          <p className="text-dust-grey-200 mb-3">
            {event.dateLabel} · {event.timeLabel} · {event.durationLabel}
          </p>
          <p className="text-dust-grey-200/70 text-sm mb-10 max-w-lg mx-auto leading-relaxed">
            A small room, a long story, and one of the oldest plant relationships we know of. Bring
            nothing but yourself and a little time.
          </p>
          <a
            href="#reserve"
            className="inline-flex items-center justify-center bg-rusty-spice-500 hover:bg-rusty-spice-600 text-white font-medium px-8 py-4 rounded transition-colors uppercase tracking-widest text-sm no-underline"
          >
            Choose your place
          </a>
        </div>
      </section>

      {/* ── Disclaimer ───────────────────────────────────────────────────── */}
      <section className="px-6 py-10 bg-dust-grey-50">
        <p className="max-w-3xl mx-auto text-dust-grey-600 text-xs leading-relaxed text-center italic">
          Kanna is a botanical preparation, not a medicine. It is not intended to diagnose, treat, cure
          or prevent any disease, and nothing on this page or in the gathering is medical advice. If you
          are pregnant, breastfeeding, or taking prescribed medication, please speak to your doctor
          before trying it.
        </p>
      </section>
    </Layout>
  )
}

export function Head({ location, data }) {
  const site = data.site.siteMetadata
  const title = `Kanna, Online — a live gathering, ${event.dateLabel} | ${site.title}`
  const description = `An evening with Kanna — the story, the science and the felt sense, gathered online on ${event.dateLabel}. Places from ${formatPrice(CHEAPEST)}.`

  return (
    <>
      <Seo
        title={title}
        description={description}
        canonical={`${site.siteUrl}${location.pathname}`}
        ogType="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: `Kanna, Online — ${event.dateLabel}`,
          startDate: event.startsAtISO,
          eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          description,
          url: `${site.siteUrl}/kanna-online/`,
          organizer: { '@type': 'Organization', name: site.title, url: site.siteUrl },
          offers: options.map(option => ({
            '@type': 'Offer',
            name: option.label,
            price: (option.priceInCents / 100).toFixed(2),
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
            url: `${site.siteUrl}/kanna-online/`,
          })),
        }}
      />
      {/* Temporary sales page: reachable by link, kept out of search. */}
      <meta name="robots" content="noindex, nofollow" />
    </>
  )
}

export const query = graphql`
  query KannaOnlinePageQuery {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
  }
`
