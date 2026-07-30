import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/Layout'
import Seo from '../components/Seo'
import Section from '../components/LegalSection'

const LAST_UPDATED = 'July 29, 2026'

export default function TermsPage() {
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
            Terms & Conditions
          </h1>
          <p className="text-dust-grey-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <article className="py-16 md:py-24 px-6 bg-dust-grey-50">
        <div className="max-w-3xl mx-auto">
          <p className="text-base leading-relaxed text-dust-grey-800 mb-10">
            These Terms & Conditions govern your use of bushmansblessing.com and any purchase made
            through it. By placing an order, you agree to these terms.
          </p>

          <Section heading="1. Who We Are">
            <p>
              Bushman's Blessing is operated by Hakman Consultancy B.V., registered in the Netherlands
              (KvK: 87173786, VAT: NL864225362B01), Rekerkoogweg 24, 1749CJ Warmenhuizen, Netherlands.
            </p>
          </Section>

          <Section heading="2. Our Products">
            <p>
              We sell Kanna (Sceletium tortuosum) tinctures, prepared using traditional methods. Our
              products are botanical preparations sold for their cultural and traditional heritage. They
              are not medicines, are not evaluated or approved by any medical or regulatory authority, and
              are not intended to diagnose, treat, cure, or prevent any disease or medical condition. See
              our full Product Disclaimer in Section 7.
            </p>
          </Section>

          <Section heading="3. Orders & Acceptance">
            <p>
              An order is an offer to purchase, which we may accept or decline (for example, if a product
              is out of stock or there's a pricing error). A contract is formed once we send you an order
              confirmation email. We reserve the right to limit quantities per customer or order.
            </p>
          </Section>

          <Section heading="4. Pricing & Payment">
            <p>
              All prices are listed in EUR and include applicable VAT unless stated otherwise. Payment is
              processed securely through Stripe at the time of order. We reserve the right to correct any
              pricing errors, even after an order has been placed, and will contact you before proceeding
              if this happens.
            </p>
          </Section>

          <Section heading="5. Shipping">
            <p>
              We currently ship to the EU and UK. See our Shipping Policy for rates, timelines, and
              delivery details.
            </p>
          </Section>

          <Section heading="6. Right of Withdrawal & Returns">
            <p>
              As an EU consumer, you generally have the right to withdraw from your purchase within 14
              days of delivery without giving a reason. However, because our products are sealed goods
              that are not suitable for return once unsealed for health and hygiene reasons, this right of
              withdrawal does not apply once the product's seal has been broken. See our full Refund &
              Return Policy for details.
            </p>
          </Section>

          <Section heading="7. Product Disclaimer">
            <p>
              Our products are sold as traditional botanical preparations, not medicines or supplements
              with proven medical claims. Nothing on this website constitutes medical advice. If you are
              pregnant, nursing, taking medication (particularly SSRIs, MAOIs, or other psychoactive
              medication), or have a pre-existing medical condition, consult a doctor before use. Keep out
              of reach of children. You use our products at your own discretion and risk.
            </p>
          </Section>

          <Section heading="8. Intellectual Property">
            <p>
              All content on this website — text, images, branding, and design — is owned by Hakman
              Consultancy B.V. or used with permission, and may not be reproduced without our consent.
            </p>
          </Section>

          <Section heading="9. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Hakman Consultancy B.V. is not liable for any
              indirect, incidental, or consequential damages arising from the use of our products or
              website.
            </p>
          </Section>

          <Section heading="10. Governing Law">
            <p>
              These terms are governed by the laws of the Netherlands. Any disputes will be submitted to
              the competent court in the Netherlands, without prejudice to your rights as a consumer under
              mandatory EU law.
            </p>
          </Section>

          <Section heading="11. Changes to These Terms">
            <p>
              We may update these terms from time to time. Continued use of the website after changes
              constitutes acceptance of the revised terms.
            </p>
          </Section>

          <Section heading="12. Contact">
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
      title="Terms & Conditions | Bushman's Blessing"
      description="The terms and conditions governing purchases from Bushman's Blessing."
      canonical={canonical}
    />
  )
}

export const query = graphql`
  query TermsPageQuery {
    site {
      siteMetadata { siteUrl }
    }
  }
`
