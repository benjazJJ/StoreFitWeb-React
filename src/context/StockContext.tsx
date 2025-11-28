import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Mapa de stock por clave `${id}-${talla}` o `${id}-U`
type StockMap = Record<string, number>

// Utilidad para construir clave de stock
const keyFor = (id: string, talla?: string) => `${id}-${talla ?? 'U'}`

type StockContextType = {
  stockDisponible: (id: string, talla?: string) => number         // Consulta stock disponible
  disminuirStock: (id: string, talla: string | undefined, qty: number) => void // Resta stock
  aumentarStock: (id: string, talla: string | undefined, qty: number) => void  // Suma stock
  inicializarStockProducto: (id: string, tallas?: string[]) => void // Inicializa stock para nuevo producto
  eliminarStockProducto: (id: string) => void                      // Elimina todas las claves de un producto
}

const StockContext = createContext<StockContextType | undefined>(undefined)

// Proveedor de stock en memoria (useState), sin LocalStorage
export function StockProvider({ children }: { children: React.ReactNode }) {
  // Estado: stock por clave (en memoria). Se inicializa vacío (los datos vienen del API)
  const [stock, setStock] = useState<StockMap>({})

  // Lee stock disponible para una clave
  const stockDisponible = useCallback((id: string, talla?: string) => {
    const k = keyFor(id, talla ?? 'U')
    return Math.max(0, stock[k] ?? 0)
  }, [stock])

  // Disminuye stock (no baja de 0)
  const disminuirStock = useCallback((id: string, talla: string | undefined, qty: number) => {
    const k = keyFor(id, talla ?? 'U')
    setStock(prev => {
      const cur = Math.max(0, prev[k] ?? 0)
      return { ...prev, [k]: Math.max(0, cur - Math.max(0, Math.floor(qty))) }
    })
  }, [])

  // Aumenta stock
  const aumentarStock = useCallback((id: string, talla: string | undefined, qty: number) => {
    const k = keyFor(id, talla ?? 'U')
    setStock(prev => {
      const cur = Math.max(0, prev[k] ?? 0)
      return { ...prev, [k]: cur + Math.max(0, Math.floor(qty)) }
    })
  }, [])

  // Inicializa stock para un producto nuevo
  const inicializarStockProducto = useCallback((id: string, tallas?: string[]) => {
    setStock(prev => {
      const next = { ...prev }
      if (!tallas || tallas.length === 0) next[keyFor(id, 'U')] = 20
      else for (const t of tallas) next[keyFor(id, t)] = 20
      return next
    })
  }, [])

  // Elimina todas las entradas de stock de un producto
  const eliminarStockProducto = useCallback((id: string) => {
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

