import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Producto } from '../types/Producto'
import { useAuth } from './AuthContext'

// Tipos del carrito en memoria
export type CartItem = { id: number; nombre: string; precio: number; imagen?: string; qty: number; talla?: string }
export type Cart = Record<string, CartItem>

// Clave estable para cada ítem (id + talla)
const keyFor = (id: number, talla?: string) => `${id}-${talla ?? 'U'}`

type CartContextType = {
  items: CartItem[]                                              // Lista plana de ítems en el carrito
  count: number                                                  // Cantidad total de unidades
  total: number                                                  // Total $ del carrito
  add: (p: Producto, qty?: number, talla?: string) => void       // Agregar ítem
  setQty: (id: number, qty: number, talla?: string) => void      // Establecer cantidad
  remove: (id: number, talla?: string) => void                   // Quitar ítem
  clear: () => void                                              // Vaciar carrito
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Proveedor de carrito en memoria (useState), por sesión de usuario
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { sesion } = useAuth()                                   // Usa sesión para separar carritos por usuario
  const [cart, setCart] = useState<Cart>({})                     // Estado: mapa de carrito
  const [guestId, setGuestId] = useState<string>('')             // Estado: ID de invitado en memoria (no persistente)

  // Genera un guestId in-memory si no hay sesión
  useEffect(() => {
    if (!sesion && !guestId) setGuestId(`guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`)
  }, [sesion, guestId])

  // Cuando cambia la sesión, reinicia el carrito (no se comparte entre usuarios)
  useEffect(() => {
    setCart({})
  }, [sesion?.correo])

  // Derivados: lista, cantidad total y monto total
  const items = useMemo(() => Object.values(cart), [cart])
  const count = useMemo(() => items.reduce((a, i) => a + i.qty, 0), [items])
  const total = useMemo(() => items.reduce((a, i) => a + i.precio * i.qty, 0), [items])

  // Agrega un producto al carrito (acumula qty hasta 99)
  const add = useCallback((p: Producto, qty = 1, talla?: string) => {
    const k = keyFor(p.id, talla ?? 'U')
    setCart(prev => {
      const cur = prev[k]
      const nextQty = Math.min(99, Math.max(1, (cur?.qty || 0) + qty))
      return { ...prev, [k]: { id: p.id, nombre: p.nombre, precio: p.precio, imagen: p.imagen, talla: talla ?? 'U', qty: nextQty } }
    })
  }, [])

  // Establece una cantidad exacta (si es <=0 elimina)
  const setQty = useCallback((id: number, qty: number, talla?: string) => {
    const k = keyFor(id, talla ?? 'U')
    setCart(prev => {
      if (qty <= 0) {
        const { [k]: _, ...rest } = prev
        return rest
      }
      const cur = prev[k]
      if (!cur) return prev
      return { ...prev, [k]: { ...cur, qty: Math.min(99, Math.max(1, Math.floor(qty))) } }
    })
  }, [])

  // Quita un ítem del carrito
  const remove = useCallback((id: number, talla?: string) => {
    const k = keyFor(id, talla ?? 'U')
    setCart(prev => { const { [k]: _, ...rest } = prev; return rest })
  }, [])

  // Vacía el carrito
  const clear = useCallback(() => setCart({}), [])

  const value = useMemo<CartContextType>(() => ({ items, count, total, add, setQty, remove, clear }), [items, count, total, add, setQty, remove, clear])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Hook para consumir el carrito
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}

