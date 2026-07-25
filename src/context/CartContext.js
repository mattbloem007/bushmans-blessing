import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'bb-cart'

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item } = action
      const existing = state.find(i => i.slug === item.slug)
      if (existing) {
        return state.map(i =>
          i.slug === item.slug ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }
      return [...state, item]
    }
    case 'UPDATE_QTY':
      return state
        .map(i => (i.slug === action.slug ? { ...i, quantity: action.quantity } : i))
        .filter(i => i.quantity > 0)
    case 'REMOVE_ITEM':
      return state.filter(i => i.slug !== action.slug)
    case 'CLEAR':
      return []
    case 'HYDRATE':
      return action.items
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) dispatch({ type: 'HYDRATE', items: JSON.parse(stored) })
    } catch {
      // ignore corrupt storage
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotalInCents = items.reduce((sum, i) => sum + i.unitPriceInCents * i.quantity, 0)
    return {
      items,
      itemCount,
      subtotalInCents,
      addItem: item => dispatch({ type: 'ADD_ITEM', item }),
      updateQuantity: (slug, quantity) => dispatch({ type: 'UPDATE_QTY', slug, quantity }),
      removeItem: slug => dispatch({ type: 'REMOVE_ITEM', slug }),
      clear: () => dispatch({ type: 'CLEAR' }),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen(o => !o),
    }
  }, [items, isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
