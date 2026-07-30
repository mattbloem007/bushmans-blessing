import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/Layout'
import Seo from '../components/Seo'
import Section from '../components/LegalSection'

const LAST_UPDATED = 'July 29, 2026'

export default function ShippingPolicyPage() {
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
            Shipping Policy
          </h1>
          <p className="text-dust-grey-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <article className="py-16 md:py-24 px-6 bg-dust-grey-50">
        <div className="max-w-3xl mx-auto">
          <Section heading="1. Where We Ship">
            <p>
              We currently ship to the Netherlands, the European Union, and the United Kingdom.
            </p>
          </Section>

          <Section heading="2. Shipping Rates">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Netherlands Shipping</strong> — €5.50 flat rate</li>
              <li><strong>EU Shipping</strong> — €8.50 flat rate</li>
              <li><strong>UK Shipping</strong> — €14.00 flat rate</li>
            </ul>
            <p>
              Shipping costs are calculated and shown at checkout before you complete your payment.
            </p>
          </Section>

          <Section heading="3. Processing Time">
            <p>
              Orders are typically processed and dispatched within 1–3 business days of purchase.
            </p>
          </Section>

          <Section heading="4. Delivery Time">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Netherlands:</strong> 1–3 business days after dispatch</li>
              <li><strong>EU:</strong> 3–7 business days after dispatch</li>
              <li><strong>UK:</strong> 5–10 business days after dispatch</li>
            </ul>
            <p>
              Delivery times are estimates and may vary due to customs processing (for UK orders) or
              carrier delays outside our control.
            </p>
          </Section>

          <Section heading="5. Order Tracking">
            <p>
              Once your order ships, we'll email you a tracking link so you can follow your delivery.
            </p>
          </Section>

          <Section heading="6. Customs & Import Duties (UK Orders)">
            <p>
              UK orders may be subject to import duties or customs fees upon arrival, which are the
              responsibility of the customer and not included in the price paid at checkout.
            </p>
          </Section>

          <Section heading="7. Lost or Delayed Shipments">
            <p>
              If your order hasn't arrived within the expected delivery window, contact us at{' '}
              <a href="mailto:orders@symbiotope.com" className="text-rusty-spice-500 hover:text-rusty-spice-600 underline">
                orders@symbiotope.com
              </a>{' '}
              and we'll look into it with the carrier.
            </p>
          </Section>

          <Section heading="8. Contact">
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
      title="Shipping Policy | Bushman's Blessing"
      description="Shipping rates, processing times, and delivery information for Bushman's Blessing orders."
      canonical={canonical}
    />
  )
}

export const query = graphql`
  query ShippingPolicyQuery {
    site {
      siteMetadata { siteUrl }
    }
  }
`
