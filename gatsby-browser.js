import React from 'react'
import { CartProvider } from './src/context/CartContext'
import './src/styles/global.css'

export function wrapRootElement({ element }) {
  return <CartProvider>{element}</CartProvider>
}
