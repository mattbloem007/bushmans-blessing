import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/Layout'
import Seo from '../components/Seo'
import Section from '../components/LegalSection'

const LAST_UPDATED = 'July 29, 2026'

export default function PrivacyPolicyPage() {
  return (
    <Layout heroPage>
      <section
        className="py-28 md:py-36 px-6 text-center"
        style={{
          background: 'linear-gradient(160deg, var(--color-black-950) 0%, var(--color-black-900) 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto pt-8">
          <h1
            className="text-dust-grey-50 mb-3"
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 600 }}
          >
            Privacy Policy
          </h1>
          <p className="text-dust-grey-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <article className="py-16 md:py-24 px-6 bg-dust-grey-50">
        <div className="max-w-3xl mx-auto">
          <p className="text-base leading-relaxed text-dust-grey-800 mb-10">
            Hakman Consultancy B.V. ("Bushman's Blessing," "we," "us," "our"), registered in the Netherlands
            (KvK: 87173786, VAT: NL864225362B01), operates bushmansblessing.com. This policy explains what
            personal data we collect, why, and what rights you have over it.
          </p>

          <Section heading="1. What We Collect">
            <p>
              When you place an order, we collect: name, email address, shipping address, and order details.
              Payment card details are collected and processed directly by our payment processor, Stripe — we
              never see or store your full card number.
            </p>
            <p>
              If you contact us by email, we retain that correspondence to respond to your enquiry.
            </p>
          </Section>

          <Section heading="2. How We Use Your Data">
            <ul className="list-disc pl-6 space-y-2">
              <li>To process and fulfil your order, including shipping and customer support</li>
              <li>To send you an order confirmation email</li>
              <li>To comply with our legal and tax obligations (e.g. invoicing, VAT records)</li>
            </ul>
            <p>
              We do not use your data for marketing unless you separately opt in, and we do not sell your
              personal data to third parties.
            </p>
          </Section>

          <Section heading="3. Legal Basis for Processing">
            <p>
              We process your data based on: performance of a contract (fulfilling your order), legal
              obligation (tax/accounting records), and legitimate interest (responding to enquiries,
              preventing fraud).
            </p>
          </Section>

          <Section heading="4. Third Parties We Share Data With">
            <p>
              We use the following processors to run our store. Each only receives the data necessary to
              perform its function:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Netlify</strong> — website hosting and order-processing functions</li>
              <li><strong>Contentful</strong> — content management (does not process customer/order data)</li>
              <li><strong>Cloudflare</strong> — website analytics (cookieless — see Section 5)</li>
              <li><strong>Resend</strong> — sending order confirmation emails</li>
            </ul>
            <p>
              Some of these providers may process data outside the EU/EEA; where they do, they rely on
              Standard Contractual Clauses or an equivalent legal safeguard.
            </p>
          </Section>

          <Section heading="5. Cookies & Analytics">
            <p>
              We use Cloudflare Web Analytics, which is cookieless and does not track individuals across
              sites. We do not use advertising or tracking cookies.
            </p>
          </Section>

          <Section heading="6. Data Retention">
            <p>
              We retain order data for as long as required by Dutch tax law (generally 7 years for
              financial records). Email correspondence is retained only as long as needed to resolve your
              enquiry.
            </p>
          </Section>

          <Section heading="7. Your Rights">
            <p>
              Under the GDPR, you have the right to: access the personal data we hold about you; request
              correction or deletion; object to or restrict processing; and request data portability. To
              exercise any of these rights, contact us at{' '}
              <a href="mailto:orders@symbiotope.com" className="text-rusty-spice-500 hover:text-rusty-spice-600 underline">
                orders@symbiotope.com
              </a>
              . You also have the right to lodge a complaint with the Dutch Data Protection Authority
              (Autoriteit Persoonsgegevens).
            </p>
          </Section>

          <Section heading="8. Security">
            <p>
              We take reasonable technical and organisational measures to protect your data, including
              relying on providers (Stripe, Netlify) that maintain independent security/compliance
              certifications.
            </p>
          </Section>

          <Section heading="9. Changes to This Policy">
            <p>
              We may update this policy from time to time. The date at the top reflects the most recent
              revision.
            </p>
          </Section>

          <Section heading="10. Contact">
            <p>
              Hakman Consultancy B.V.
              <br />
              Rekerkoogweg 24, 1749CJ Warmenhuizen, Netherlands
              <br />
              <a href="mailto:orders@symbiotope.com" className="text-rusty-spice-500 hover:text-rusty-spice-600 underline">
                orders@symbiotope.com
              </a>
            </p>
          </Section>
        </div>
      </article>
    </Layout>
  )
}

export function Head({ data, location }) {
  const site = data.site.siteMetadata
  const canonical = `${site.siteUrl}${location.pathname}`
  return (
    <Seo
      title="Privacy Policy | Bushman's Blessing"
      description="How Bushman's Blessing collects, uses, and protects your personal data."
      canonical={canonical}
    />
  )
}

export const query = graphql`
  query PrivacyPolicyQuery {
    site {
      siteMetadata { siteUrl }
    }
  }
`
