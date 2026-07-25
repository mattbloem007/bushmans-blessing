import React from 'react'
import { CartProvider } from './src/context/CartContext'
import './src/styles/global.css'

export function wrapRootElement({ element }) {
  return <CartProvider>{element}</CartProvider>
}

export function onRenderBody({ setHeadComponents }) {
  const token = process.env.CLOUDFLARE_BEACON_TOKEN
  if (!token) return
  setHeadComponents([
    <script
      key="cloudflare-web-analytics"
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />,
  ])
}
