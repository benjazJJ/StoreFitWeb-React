import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { PRODUCTOS } from '../types/Producto'

// Mapa de stock por clave `${id}-${talla}` o `${id}-U`
type StockMap = Record<string, number>

// Utilidad para construir clave de stock
const keyFor = (id: number, talla?: string) => `${id}-${talla ?? 'U'}`

type StockContextType = {
  stockDisponible: (id: number, talla?: string) => number         // Consulta stock disponible
  disminuirStock: (id: number, talla: string | undefined, qty: number) => void // Resta stock
  aumentarStock: (id: number, talla: string | undefined, qty: number) => void  // Suma stock
  inicializarStockProducto: (id: number, tallas?: string[]) => void // Inicializa stock para nuevo producto
  eliminarStockProducto: (id: number) => void                      // Elimina todas las claves de un producto
}

const StockContext = createContext<StockContextType | undefined>(undefined)

// Proveedor de stock en memoria (useState), sin LocalStorage
export function StockProvider({ children }: { children: React.ReactNode }) {
  // Estado: stock por clave (en memoria). Se inicializa desde PRODUCTOS
  const [stock, setStock] = useState<StockMap>(() => {
    const base: StockMap = {}
    const TALLAS_ROPA: string[] = ['XS','S','M','L','XL']
    for (const p of PRODUCTOS) {
      const esZapatilla = /zapatill/i.test(p.categoria)
      if (esZapatilla) {
        for (let n = 35; n <= 44; n++) base[keyFor(p.id, String(n))] = 20
      } else if (p.stock && Object.keys(p.stock).length > 0) {
        for (const t of TALLAS_ROPA) base[keyFor(p.id, t)] = 20
      } else {
        base[keyFor(p.id, 'U')] = 20
      }
    }
    return base
  })

  // Lee stock disponible para una clave
  const stockDisponible = useCallback((id: number, talla?: string) => {
    const k = keyFor(id, talla ?? 'U')
    return Math.max(0, stock[k] ?? 0)
  }, [stock])

  // Disminuye stock (no baja de 0)
  const disminuirStock = useCallback((id: number, talla: string | undefined, qty: number) => {
    const k = keyFor(id, talla ?? 'U')
    setStock(prev => {
      const cur = Math.max(0, prev[k] ?? 0)
      return { ...prev, [k]: Math.max(0, cur - Math.max(0, Math.floor(qty))) }
    })
  }, [])

  // Aumenta stock
  const aumentarStock = useCallback((id: number, talla: string | undefined, qty: number) => {
    const k = keyFor(id, talla ?? 'U')
    setStock(prev => {
      const cur = Math.max(0, prev[k] ?? 0)
      return { ...prev, [k]: cur + Math.max(0, Math.floor(qty)) }
    })
  }, [])

  // Inicializa stock para un producto nuevo
  const inicializarStockProducto = useCallback((id: number, tallas?: string[]) => {
    setStock(prev => {
      const next = { ...prev }
      if (!tallas || tallas.length === 0) next[keyFor(id, 'U')] = 20
      else for (const t of tallas) next[keyFor(id, t)] = 20
      return next
    })
  }, [])

  // Elimina todas las entradas de stock de un producto
  const eliminarStockProducto = useCallback((id: number) => {
    setStock(prev => {
      const next = { ...prev }
      for (const k of Object.keys(next)) if (k.startsWith(`${id}-`)) delete (next as any)[k]
      return next
    })
  }, [])

  const value = useMemo<StockContextType>(() => ({ stockDisponible, disminuirStock, aumentarStock, inicializarStockProducto, eliminarStockProducto }), [stockDisponible, disminuirStock, aumentarStock, inicializarStockProducto, eliminarStockProducto])

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  )
}

// Hook para consumir el stock
export function useStock() {
  const ctx = useContext(StockContext)
  if (!ctx) throw new Error('useStock debe usarse dentro de <StockProvider>')
  return ctx
}

