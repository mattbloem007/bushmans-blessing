import React, { useState, useEffect } from 'react'
import { Link, useStaticQuery, graphql } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import { useCart } from '../context/CartContext'

export default function Header({ heroPage = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, toggleCart } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const data = useStaticQuery(graphql`
    query HeaderQuery {
      contentfulSiteSettings {
        siteName
        logo { gatsbyImageData(width: 160, placeholder: NONE) }
      }
      allContentfulNavigation(sort: { displayOrder: ASC }) {
        nodes { label linkDestination }
      }
    }
  `)

  const { siteName, logo } = data.contentfulSiteSettings
  const navItems = data.allContentfulNavigation.nodes
  const logoImage = logo ? getImage(logo) : null

  const solidBg = !heroPage || scrolled

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solidBg
          ? 'bg-black-950/95 backdrop-blur-sm shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 text-dust-grey-50 no-underline"
          onClick={() => setMenuOpen(false)}
        >
          {logoImage ? (
            <GatsbyImage image={logoImage} alt={siteName} className="h-10 w-auto" />
          ) : (
            <span
              className="font-heading text-xl md:text-2xl tracking-wide text-dust-grey-50"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {siteName}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.linkDestination}
              to={item.linkDestination}
              className="text-sm font-medium tracking-wider uppercase text-dust-grey-200 hover:text-rusty-spice-500 transition-colors no-underline"
              activeClassName="text-rusty-spice-500"
              partiallyActive={item.linkDestination !== '/'}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative p-2 text-dust-grey-50 hover:text-rusty-spice-500 transition-colors"
            aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2l1.5 4h9L18 2" />
              <path d="M3.5 8h17l-1.6 10.5a2 2 0 0 1-2 1.5H7.1a2 2 0 0 1-2-1.5L3.5 8z" />
            </svg>
            {itemCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-medium text-white"
                style={{ background: 'var(--color-rusty-spice-500)' }}
              >
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 text-dust-grey-50"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-200 ${
                menuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-200 ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-200 ${
                menuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-black-950 ${
          menuOpen ? 'max-h-96 border-t border-white/10' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col px-6 py-4 gap-4">
          {navItems.map((item) => (
            <Link
              key={item.linkDestination}
              to={item.linkDestination}
              className="text-base font-medium tracking-wider uppercase text-dust-grey-200 hover:text-rusty-spice-500 transition-colors no-underline py-1"
              activeClassName="text-rusty-spice-500"
              partiallyActive={item.linkDestination !== '/'}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
