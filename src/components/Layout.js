import React from 'react'
import Header from './Header'
import Footer from './Footer'

export default function Layout({ children, heroPage = false }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header heroPage={heroPage} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
