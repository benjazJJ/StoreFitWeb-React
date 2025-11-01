import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react'
import type { Producto } from '../types/Producto'

type ItemCarrito = Producto & { cantidad: number }
type CarritoValor = { items: ItemCarrito[]; agregar: (p: Producto) => void }

const CarritoCtx = createContext<CarritoValor | null>(null)

export function CarritoProveedor({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([])

  const agregar = useCallback((producto: Producto) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.id === producto.id)
      if (i >= 0) {
        const copia = structuredClone(prev)
        copia[i].cantidad += 1
        return copia
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }, [])

  const valor = useMemo<CarritoValor>(() => ({ items, agregar }), [items, agregar])
  return <CarritoCtx.Provider value={valor}>{children}</CarritoCtx.Provider>
}

export function useCarrito(): CarritoValor {
  const ctx = useContext(CarritoCtx)
  if (!ctx) throw new Error('useCarrito debe usarse dentro de <CarritoProveedor>')
  return ctx
}
