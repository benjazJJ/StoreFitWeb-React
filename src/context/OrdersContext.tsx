import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Sesion } from './AuthContext'

export type ProveedorEnvio = 'Blue Express' | 'Starken'

export type OrderItem = {
  id: number
  nombre: string
  qty: number
  talla?: string
  precioUnitario: number
  subtotal: number
  imagen?: string
}

export type Order = {
  orderNumber: string
  userKey: string
  correo?: string
  rut?: string
  nombre?: string
  direccion?: string
  regionId?: string
  comunaId?: string
  telefono?: string
  proveedor: ProveedorEnvio
  total: number
  items: OrderItem[]
  createdAt: string
}

type OrdersContextType = {
  addOrder: (input: Omit<Order, 'orderNumber' | 'createdAt'>) => Order
  getOrdersByUser: (userKey: string) => Order[]
  allOrders: Order[]
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

const rand8 = () => String(Math.floor(10000000 + Math.random() * 90000000))

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])

  const addOrder = useCallback((input: Omit<Order, 'orderNumber' | 'createdAt'>) => {
    const order: Order = {
      ...input,
      orderNumber: rand8(),
      createdAt: new Date().toISOString(),
    }
    setOrders(prev => [order, ...prev])
    return order
  }, [])

  const getOrdersByUser = useCallback((userKey: string) => orders.filter(o => o.userKey === userKey), [orders])

  const value = useMemo<OrdersContextType>(() => ({ addOrder, getOrdersByUser, allOrders: orders }), [addOrder, getOrdersByUser, orders])

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders debe usarse dentro de <OrdersProvider>')
  return ctx
}

