import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  remove: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clear: () => void
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)
const LS_CART_KEY = 'demo_cart'

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const raw = localStorage.getItem(LS_CART_KEY)
    if (raw) {
      try { setItems(JSON.parse(raw)) } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LS_CART_KEY, JSON.stringify(items))
  }, [items])

  const add: CartContextType['add'] = (item, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: Math.min(10, i.quantity + qty) } : i)
      }
      return [...prev, { ...item, quantity: Math.max(1, Math.min(10, qty)) }]
    })
  }

  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const updateQty = (id: string, qty: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, Math.min(10, qty)) } : i))
  }

  const clear = () => setItems([])

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items])

  const value = useMemo(() => ({ items, add, remove, updateQty, clear, subtotal }), [items, subtotal])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}


