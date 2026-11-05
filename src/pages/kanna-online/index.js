import React, { useEffect, useRef, useState } from 'react'
import { graphql, Link } from 'gatsby'
import { StaticImage } from 'gatsby-plugin-image'
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
import KannaOnlineStickyCta from '../../components/KannaOnlineStickyCta'

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
      className={`relative scroll-mt-20 py-24 md:py-32 px-6 ${dark ? 'grain' : ''}`}
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

const JUMP_LINKS = [
  { href: '#plant', label: 'The plant' },
  { href: '#science', label: 'The science' },
  { href: '#messenger', label: 'Ancient messenger' },
  { href: '#whole-plant', label: 'Whole plant' },
  { href: '#balance', label: 'Balance' },
  { href: '#evening', label: 'The evening' },
  { href: '#practicalities', label: 'Practicalities' },
  { href: '#facilitator', label: 'Facilitator' },
]

// A last-chance exit from the reading, at the end of the chapters people are
// most likely to abandon. Two choices: the evening itself, or the prices.
function SkipAhead({ dark = false, note = 'Reading not for you today?' }) {
  const quiet = dark ? 'text-dust-grey-200/70' : 'text-dust-grey-600'
  const link = dark ? 'text-dust-grey-100' : 'text-dust-grey-950'
  return (
    <div
      className={`mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-5 text-xs uppercase tracking-[0.18em] ${
        dark ? 'border-dust-grey-200/20' : 'border-dust-grey-950/10'
      }`}
    >
      <span className={quiet}>{note}</span>
      <a href="#evening" className={`${link} no-underline hover:text-rusty-spice-500 transition-colors`}>
        What happens on the night →
      </a>
      <a
        href="#reserve"
        className="text-rusty-spice-500 no-underline hover:text-rusty-spice-600 transition-colors"
      >
        Prices &amp; sign up →
      </a>
    </div>
  )
}

const EVENING = [
  {
    title: 'Arriving',
    text: 'We open with a few minutes to land in presence together.',
  },
  {
    title: 'The story',
    text: 'Giving a space and a voice for Kanna and the First People, the names the plant has carried, and the preparations that make this medicine.',
  },
  {
    title: 'The science, plainly',
    text: 'Mesembrine, mesembrenone, and what research has observed about kanna.',
  },
  {
    title: 'The felt sense',
    text: 'A guided practice in paying attention: to breath, to embody, to be present with whatever is moving under the surface. If you have a sample or a bottle of Bushman’s Blessing, this is where you would take it. It isn’t a prerequisite to joining — the circle together is enough to feel the presence of what Kanna has to offer us. The taking of the sacrament enhances the experience.',
  },
  {
    title: 'The circle',
    text: 'An optional time to say what you noticed — or to say nothing at all. Usually the part people remember afterwards. We will share stories of what kanna has to offer mankind in our individual lives in this modern-day world.',
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
    text: `A few hours before we begin, the ${event.platform} video link is sent to that same address.`,
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
      "A sample of Bushman's Blessing Kanna Tincture",
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
      "A full 5ml bottle of Bushman's Blessing Kanna Tincture",
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
    a: 'Not in the clinical sense. Kanna is a botanical preparation, and when we call it a medicine we mean it in the old way — a plant prepared with care and taken with attention, not a pharmaceutical. Nothing on this page or in the evening is medical advice, diagnosis or treatment, and we will not present it as such. If you are pregnant, breastfeeding, or taking prescribed medication, please speak to your doctor before trying it.',
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
          <p className="text-dust-grey-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-4">
            An evening together to drop into presence with the Spirit of Kanna — an ally and teacher
            for humanity. The heart opener. The one who calls us into presence and deeper connection.
          </p>
          <p className="text-dust-grey-200/70 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-10">
            Cameras and microphones optional. You are welcome to simply come, listen and experience.
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

          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-dust-grey-200/60">
            <a
              href="#reserve"
              className="no-underline hover:text-rusty-spice-500 transition-colors"
            >
              Already decided? Skip to the details →
            </a>
          </p>
        </div>

        <div className="absolute bottom-8 left-0 right-0 px-8 opacity-10">
          <WavyDivider color="var(--color-dust-grey-200)" />
        </div>
      </section>

      {/* ── Jump nav ─────────────────────────────────────────────────────── */}
      <nav
        aria-label="Sections on this page"
        className="border-b border-dust-grey-200/60 px-6 py-4"
        style={{ background: 'var(--color-dust-grey-100)' }}
      >
        <div className="mx-auto max-w-5xl flex flex-nowrap items-baseline gap-x-5 gap-y-2 overflow-x-auto whitespace-nowrap sm:flex-wrap sm:justify-center sm:overflow-visible">
          <span className="text-dust-grey-600 text-[0.6rem] uppercase tracking-[0.22em]">
            Jump to
          </span>
          {JUMP_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-dust-grey-950/80 hover:text-rusty-spice-500 text-[0.7rem] uppercase tracking-[0.16em] no-underline transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#reserve"
            className="text-rusty-spice-500 hover:text-rusty-spice-600 text-[0.7rem] uppercase tracking-[0.16em] no-underline transition-colors"
          >
            Prices &amp; sign up
          </a>
        </div>
      </nav>

      {/* ── Invitation ───────────────────────────────────────────────────── */}
      <Chapter
        id="story"
        eyebrow="Before we begin"
        title="Something the modern world has quietly lost"
        className="max-w-3xl"
      >
        <div className="space-y-6">
          <P>
            We live in a world of fast-paced lives, over-stimulation, and disconnection from nature. We
            carry stressors that our nervous systems were not built to hold for long periods.
          </P>
          <P>
            Ask anyone who works with kanna what it does and the answer tends to arrive in the body
            before it arrives in words: energy settling, the shoulders dropping, attention coming back
            into the room. The word that comes up is grounding. With a grounded presence we can deal
            with ongoing stimuli at a better capacity without getting overwhelmed. This state of being
            also helps us be in better connection to the people and environment around us — creating a
            better sense of connection and, ultimately, an overall sense of wellbeing.
          </P>
          <P>
            On {event.dateLabel} we are gathering online to experience exactly that: one evening, in
            circle together online, with enough time to tell the story properly, look honestly at what
            the science has found, and sit together with whatever the plant brings up.
          </P>
          <P className="text-dust-grey-950">
            Cameras and microphones are optional. You are welcome to simply come, listen and
            experience.
          </P>
        </div>
        <div className="mt-12 opacity-20">
          <WavyDivider color="var(--color-saddle-brown-500)" />
        </div>
      </Chapter>

      {/* ── The plant ────────────────────────────────────────────────────── */}
      <Chapter
        id="plant"
        tone="mid"
        eyebrow="Chapter One"
        title="A relationship without beginning"
        className="max-w-3xl"
      >
        <div className="space-y-6">
          <P>
            There is a moment, somewhere in the deep past of Southern Africa, that we will never be
            able to pinpoint. A group of people, deeply connected to their environment — the First
            People of this land — listened to the call of a small, fleshy plant growing in the desert
            of the Karoo. Whispered to them from the inner knowing that comes from living so
            intimately with Nature.
          </P>
          <P>
            That calling led to a very important relationship with a plant now deeply revered by
            these people. It could be one of the oldest relationships between a human being and a
            plant that we are aware of, anywhere on earth.
          </P>
          <P>
            The /Xam-speaking Bush people and the Khoekhoe people became the natural custodians of
            this plant. Though their culture and way of life as distinct, independent groups have been
            profoundly altered — and some say their culture as it once was is now extinct — their
            essence is still lived on through their descendants, adapted to the modern world. They
            lived in harmony and reciprocity with nature, holding a deep relationship with each other
            and the environment around them.
          </P>
          <P>
            The plant has carried many names. <em>Sceletium tortuosum</em> is the botanical name.
            Kanna to those who first gathered it. <em>Kougoed</em> — “something to chew” — to the
            people who communed with it daily. That last name tells you what their relationship was
            with the plant: a companion. Carried on long hunts. Offered at moments of grief. Shared
            around fires in conversations that needed opening. Present in trance dances. Kanna entered
            their lives from the sacred moments to the mundane, because they believed every part of
            life is sacred — not just the times of great trance.
          </P>
        </div>

        <div className="mt-14 border-t border-dust-grey-950/10 pt-10">
          <h3
            className="text-dust-grey-950 mb-5"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', lineHeight: '1.25' }}
          >
            The Bushman’s Blessing
          </h3>
          <div className="space-y-6">
            <P>
              Bushman’s Blessing is named for the kanna that was presented to our founder — kanna of
              the original way. Grown in its original environment, cultivated and prepared
              traditionally, the preparation keeps intact the essence of how the First People engaged
              with life: through presence and connection.
            </P>
            <P>
              The Bush people’s way of life, preserved in the essence of kanna, is now offered back to
              the modern world as a blessing. It is a reminder of how we can live in the same way
              while engaging with the life we live today.
            </P>
            <P>
              Kanna keeps itself alive in one of the hardest climates on earth. It draws in, holds
              what it has, and waits for the season that calls it forward — and that is the quality the
              old preparations were prized for, and made to keep. It is a lesson in economy rather than
              force: draw in, hold your reserves, endure the dry spell, expand when the rain comes. The
              Bush people spoke about the plant in exactly this language — weather, season, stores,
              survival. In this original preparation it is a tonic in the old sense — taken in small
              amounts, regularly, as part of how you look after yourself. People often reach for the
              word “adaptogen”; it is a modern word with no agreed definition, and we use it knowing
              that.
            </P>
          </div>
        </div>

        <blockquote className="mt-12 border-l-2 border-saddle-brown-500 pl-6">
          <P size="sm">
            A /Xam-speaking Berg Bushman from the 17th century described the plant as “a small plant
            found on the great mountains, growing out of crevices in the rocks”. He noted it was
            “chewed by Bushmen, giving strength to their limbs, taking away poison, and making their
            memory strong”. In one story recorded by a European encounter with two Berg Bushmen from
            Stuurmansfontein, it was mentioned that they had kanna with them to enable them to walk
            until they met the wagon — suggesting that kanna sustained them for long distances of
            travel on foot.
          </P>
        </blockquote>

        <P className="mt-10">
          We honour this ancient wisdom and the relation with this sacred plant, and the custodians
          of kanna. Kanna is a revered plant: a teacher first, and — in the language of the people who
          have kept it — a healer.
        </P>

        <div className="mt-14 flex items-end justify-center gap-10 opacity-30">
          <ElandSilhouette size={180} color="#d0672f" className="opacity-70" />
          <BushmanFigure size={84} color="#d0672f" />
          <RunningSpottedFigure size={84} color="#d0672f" />
        </div>

        <SkipAhead note="That is the short version of the story." />
      </Chapter>

      {/* ── Kanna in its habitat ────────────────────────────────────────── */}
      <section
        className="px-6 py-14 md:py-20"
        style={{ background: 'var(--color-dust-grey-100)' }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
            <figure>
              <StaticImage
                src="../../images/kanna-online/kanna-habitat-1.jpg"
                alt="Kanna in its natural environment after the winter rains"
                layout="fullWidth"
                aspectRatio={4 / 3}
                placeholder="blurred"
                className="rounded-lg overflow-hidden"
              />
              <figcaption className="mt-3 text-dust-grey-600 text-xs leading-relaxed">
                Semi-arid desert after the winter rains — greener than you would expect. The plant
                stores what it needs and waits for the season that calls it forward.
              </figcaption>
            </figure>
            <figure>
              <StaticImage
                src="../../images/kanna-online/kanna-habitat-2.jpg"
                alt="Kanna growing low among the shrubs of the semi-arid Karoo"
                layout="fullWidth"
                aspectRatio={4 / 3}
                placeholder="blurred"
                className="rounded-lg overflow-hidden"
              />
              <figcaption className="mt-3 text-dust-grey-600 text-xs leading-relaxed">
                Kanna where it grows: the semi-arid Karoo.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ── Science ──────────────────────────────────────────────────────── */}
      <Chapter
        id="science"
        eyebrow="Chapter Two"
        title="What the science describes"
        tone="dark"
        className="max-w-6xl"
      >
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
        <SkipAhead dark note="The rest is the story of the plant itself." />
      </Chapter>

      {/* ── Ancient messenger ────────────────────────────────────────────── */}
      <Chapter
        id="messenger"
        eyebrow="Chapter Three"
        title="An ancient messenger"
        tone="dark"
        className="max-w-2xl text-center"
      >
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
          <P dark>
            The idea is that communication with all living things is the key to a harmonious way of
            living. Every cell informed, or every being informed, creates a sense of connection that
            manifests as the dance of life.
          </P>
        </div>
        <div className="mt-14 opacity-30 flex justify-center">
          <WavyDivider color="var(--color-rusty-spice-500)" />
        </div>
      </Chapter>

      {/* ── Whole plant ──────────────────────────────────────────────────── */}
      <Chapter
        id="whole-plant"
        eyebrow="Chapter Four"
        title="Whole plant, whole effect"
        className="max-w-6xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-3 space-y-6">
            <P>
              The alkaloids do not work in isolation. The traditional fermentation — leaves, stems and
              roots pressed together and left to undergo a slow, deliberate transformation, then dried
              in the open sun and turned by hand — changes the plant’s chemistry in ways that affect
              how the body receives it.
            </P>
            <P>
              This is why we work with the whole plant rather than extracts or isolates. The
              preparation is part of the effect, and what makes Kanna what it is cannot be separated
              from how it was made.
            </P>
            <P>
              Ours begins in the Baviaanskloof, a mountain wilderness where several of South Africa’s
              rarest biomes meet, grown low to the ground in the dappled shade of other dwarf shrubs.
              It is prepared by a devoted plant keeper of South Africa, in the old way — because that
              is the way that brings out the magic of the plant.
            </P>
            <P>
              Modern approaches to sharing the medicine often remove the spirit of kanna, focusing
              only on applicable alkaloids for consumption. Our evening together is about creating
              space for the original essence of kanna to be presented to you. We will be calling in an
              activation to facilitate the meeting of the teacher and ally we call kanna, bringing us
              into deep presence in the body, gathered together.
            </P>
          </div>

          <figure className="lg:col-span-2 lg:sticky lg:top-24">
            <StaticImage
              src="../../images/kanna-online/kanna-habitat-3.jpg"
              alt="Kanna in its natural habitat in the semi-arid mountains of South Africa"
              layout="fullWidth"
              aspectRatio={3 / 4}
              placeholder="blurred"
              className="rounded-lg overflow-hidden"
            />
            <figcaption className="mt-3 text-dust-grey-600 text-xs leading-relaxed">
              Grown in its original environment, prepared in the old way.
            </figcaption>
          </figure>
        </div>
      </Chapter>

      {/* ── Balance ──────────────────────────────────────────────────────── */}
      <Chapter
        id="balance"
        eyebrow="Chapter Five"
        title="A different kind of balance"
        tone="mid"
        className="max-w-3xl"
      >
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
            That is the territory we will be exploring together: not a peak experience, a deeper
            settling.
          </P>
        </div>
        <SkipAhead note="That is what the evening is for." />
      </Chapter>

      {/* ── The evening ──────────────────────────────────────────────────── */}
      <Chapter id="evening" eyebrow="The evening" title="What the evening holds" className="max-w-4xl">
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
          We finish after about 90 minutes, and stay on a little longer for anyone who wants to keep
          talking. You will need a quiet-ish room, headphones if you have them, and a laptop or phone
          to tune into the call.
        </p>
      </Chapter>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <Chapter
        id="practicalities"
        eyebrow="Practicalities"
        title="How it works online"
        tone="mid"
        className="max-w-4xl"
      >
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

      {/* ── Facilitator ──────────────────────────────────────────────────── */}
      <Chapter
        id="facilitator"
        eyebrow="A note on the facilitator"
        title="The one who introduces the Kanna"
        className="max-w-5xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 lg:gap-16 items-start">
          <figure className="md:col-span-2 md:sticky md:top-24">
            <StaticImage
              src="../../images/kanna-online/matthew.jpg"
              alt="Matthew Bloemetje, facilitator of the Kanna Online gathering"
              layout="fullWidth"
              aspectRatio={3 / 4}
              placeholder="blurred"
              className="rounded-lg overflow-hidden"
            />
            <figcaption className="mt-3 text-dust-grey-600 text-xs leading-relaxed">
              Matthew Bloemetje, facilitator.
            </figcaption>
          </figure>

          <div className="md:col-span-3 space-y-6">
            <P>
              The storyteller and facilitator for the evening, who will introduce the Kanna for us, is
              our partner who helped found Bushman’s Blessing — educating us on the original essence
              of Kanna, in its entirety.
            </P>
            <P>
              Matthew Bloemetje is a modern-day Bushman residing in South Africa. He grew up knowing
              only the modern ways of life before his first awakening in early 2015, which led to a
              remembering of an older way of living deep in his DNA. As an initiated traditional healer
              and herbalist of Southern Africa, he walks the path of remembrance in honour of his
              ancestors who walked before him, recognising his modern upbringing and integrating the
              depth of indigenous wisdom.
            </P>
            <P>
              In bringing forward the medicine of Kanna, Matthew recognises his connection to the
              Khoekhoe and /Xam Bush people in his lineage, who are the rightful custodians of Kanna.
              Years of devotion and practice with Kanna have unlocked ancient wisdom that we are here
              to share with the world. The traditional preparations of Kanna, grown in its natural
              habitat, maintain the essence and integrity of the plant.
            </P>
          </div>
        </div>
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
      <Chapter id="faq" eyebrow="Questions" title="Before you decide" className="max-w-3xl">
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
        id="final-cta"
        className="grain relative scroll-mt-20 py-24 md:py-32 px-6 text-center overflow-hidden"
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
          Kanna is a botanical preparation. We use the word “medicine” in its older, traditional
          sense — a plant prepared with care — not as a pharmaceutical claim. Nothing on this page or
          in the gathering is medical advice, diagnosis or treatment. If you are pregnant,
          breastfeeding, or taking prescribed medication, please speak to your doctor before trying
          it.
        </p>
      </section>

      <KannaOnlineStickyCta
        dateLabel={event.dateLabel}
        timeLabel={event.timeLabel}
        priceLabel={formatPrice(CHEAPEST)}
      />
    </Layout>
  )
}

export function Head({ location, data }) {
  const site = data.site.siteMetadata
  const title = `Kanna, Online — a live gathering, ${event.dateLabel} | ${site.title}`
  const description = `An evening with Kanna — the story, the science and the felt sense, with Matthew Bloemetje. Live online on ${event.dateLabel}. Places from ${formatPrice(CHEAPEST)}.`

  return (
    <>
      <Seo
        title={title}
        description={description}
        canonical={`${site.siteUrl}${location.pathname}`}
        ogType="website"
        ogImage={`${site.siteUrl}/images/kanna-online/og.jpg`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: `Kanna, Online — ${event.dateLabel}`,
          startDate: event.startsAtISO,
          eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          description,
          url: `${site.siteUrl}/kanna-online/`,
          image: [`${site.siteUrl}/images/kanna-online/og.jpg`],
          performer: { '@type': 'Person', name: 'Matthew Bloemetje' },
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
      {/* The page is long and offers jump links; smooth scrolling keeps those
          jumps legible instead of teleporting. */}
      <style>{`html{scroll-behavior:smooth}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}`}</style>
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
