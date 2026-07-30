import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/Layout'
import Seo from '../components/Seo'
import Section from '../components/LegalSection'

const LAST_UPDATED = 'July 29, 2026'

export default function RefundPolicyPage() {
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
            Refund & Return Policy
          </h1>
          <p className="text-dust-grey-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <article className="py-16 md:py-24 px-6 bg-dust-grey-50">
        <div className="max-w-3xl mx-auto">
          <Section heading="1. Your Right to Cancel">
            <p>
              As an EU or UK consumer, you have the right to cancel your order and receive a refund
              within 14 days of receiving your delivery, without giving a reason.
            </p>
          </Section>

          <Section heading="2. Exception for Opened Products">
            <p>
              Because our tinctures are sealed goods that are not suitable for return once unsealed, for
              health and hygiene reasons, this right to cancel does not apply once the product's seal has
              been broken. We can only accept returns of products that are unopened, with the seal intact,
              in their original packaging.
            </p>
          </Section>

          <Section heading="3. Damaged, Defective, or Incorrect Items">
            <p>
              This exception does not apply if your product arrives damaged, defective, or is not what you
              ordered. In these cases, you're entitled to a free replacement or full refund regardless of
              whether the product has been opened — this is separate from your right to cancel and is not
              affected by Section 2.
            </p>
          </Section>

          <Section heading="4. How to Request a Return or Refund">
            <p>
              Contact us at{' '}
              <a href="mailto:orders@symbiotope.com" className="text-rusty-spice-500 hover:text-rusty-spice-600 underline">
                orders@symbiotope.com
              </a>{' '}
              within 14 days of delivery, including your order number and the reason for your return.
              We'll confirm whether your item is eligible and provide instructions.
            </p>
          </Section>

          <Section heading="5. Return Shipping">
            <p>
              If you're returning an unopened item because you changed your mind, you are responsible for
              return shipping costs. If the item is damaged, defective, or incorrect, we will cover return
              shipping.
            </p>
          </Section>

          <Section heading="6. Refunds">
            <p>
              Once we receive and inspect your returned item (where applicable), we will process your
              refund to your original payment method within 14 days. Refunds are issued via Stripe and may
              take a few additional business days to appear, depending on your bank.
            </p>
          </Section>

          <Section heading="7. Contact">
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
      title="Refund & Return Policy | Bushman's Blessing"
      description="Our refund and return policy, including your right to cancel and exceptions for opened products."
      canonical={canonical}
    />
  )
}

export const query = graphql`
  query RefundPolicyQuery {
    site {
      siteMetadata { siteUrl }
    }
  }
`
