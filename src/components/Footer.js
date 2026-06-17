import React from 'react'
import { Link, useStaticQuery, graphql } from 'gatsby'
import EyeSymbol from './icons/EyeSymbol'

function parseSocialLabel(url) {
  if (!url) return url
  try {
    const host = new URL(url).hostname.replace('www.', '')
    if (host.includes('instagram')) return 'Instagram'
    if (host.includes('facebook')) return 'Facebook'
    if (host.includes('twitter') || host.includes('x.com')) return 'Twitter'
    if (host.includes('youtube')) return 'YouTube'
    if (host.includes('tiktok')) return 'TikTok'
    return host
  } catch {
    return url
  }
}

export default function Footer() {
  const data = useStaticQuery(graphql`
    query FooterQuery {
      contentfulSiteSettings {
        siteName
        footerText
        socialMediaLinks
      }
      allContentfulNavigation(sort: { displayOrder: ASC }) {
        nodes { label linkDestination }
      }
    }
  `)

  const { siteName, footerText, socialMediaLinks } = data.contentfulSiteSettings
  const navItems = data.allContentfulNavigation.nodes

  return (
    <footer className="bg-black-950 text-dust-grey-200">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <EyeSymbol size={36} color="#fe5101" />
              <span
                className="text-2xl text-dust-grey-50"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {siteName}
              </span>
            </div>
            <p className="text-sm text-dust-grey-600 leading-relaxed">
              Rooted in the oldest wisdom. Grown in the oldest earth.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-dust-grey-600 mb-4">Navigate</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.linkDestination}>
                  <Link
                    to={item.linkDestination}
                    className="text-sm text-dust-grey-200 hover:text-rusty-spice-500 transition-colors no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          {socialMediaLinks && socialMediaLinks.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-dust-grey-600 mb-4">Follow</h3>
              <ul className="space-y-2">
                {socialMediaLinks.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-dust-grey-200 hover:text-rusty-spice-500 transition-colors no-underline"
                    >
                      {parseSocialLabel(url)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="pt-8 text-xs text-dust-grey-600 text-center">{footerText}</p>
      </div>
    </footer>
  )
}
