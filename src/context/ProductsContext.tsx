import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Producto, Talla } from '../types/Producto'
import { PRODUCTOS } from '../types/Producto'

// Tipos para operaciones CRUD de productos
export type NuevoProducto = Omit<Producto, 'id'> & { id?: never }
export type PatchProducto = Partial<Omit<Producto, 'id'>>

type ProductsContextType = {
  productos: Producto[]                                           // Lista en memoria de productos
  obtenerProductos: () => Producto[]                              // Devuelve la lista actual
  obtenerProductoPorId: (id: number) => Producto | null           // Busca un producto por ID
  crearProducto: (data: NuevoProducto) => Producto                // Crea un producto nuevo
  actualizarProducto: (id: number, patch: PatchProducto) => Producto | null // Actualiza un producto
  eliminarProducto: (id: number) => void                          // Elimina un producto
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

// Proveedor de productos con estado en memoria (useState) y sin LocalStorage
export function ProductsProvider({ children }: { children: React.ReactNode }) {
  // Estado: lista de productos; se inicializa con PRODUCTOS (semilla)
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS)

  // Lee la lista actual (útil para compatibilidad de llamada)
  const obtenerProductos = useCallback(() => productos, [productos])

  // Encuentra un producto por ID
  const obtenerProductoPorId = useCallback((id: number) => productos.find(p => p.id === id) ?? null, [productos])

  // Crea un nuevo producto, asignando un ID consecutivo
  const crearProducto = useCallback((data: NuevoProducto) => {
    const nextId = (productos.reduce((a, p) => Math.max(a, p.id), 0) || 0) + 1
    const nuevo: Producto = { ...data, id: nextId } as Producto
    setProductos(prev => [...prev, nuevo])
    return nuevo
  }, [productos])

  // Actualiza parcial o totalmente un producto por ID
  const actualizarProducto = useCallback((id: number, patch: PatchProducto) => {
    let updated: Producto | null = null
    setProductos(prev => {
      const list = [...prev]
      const i = list.findIndex(p => p.id === id)
      if (i < 0) return prev
      const nuevo = { ...list[i], ...patch, id } as Producto
      list[i] = nuevo
      updated = nuevo
      return list
    })
    return updated
  }, [])

  // Elimina un producto por ID
  const eliminarProducto = useCallback((id: number) => {
    setProductos(prev => prev.filter(p => p.id !== id))
  }, [])

  const value = useMemo<ProductsContextType>(() => ({ productos, obtenerProductos, obtenerProductoPorId, crearProducto, actualizarProducto, eliminarProducto }), [productos, obtenerProductos, obtenerProductoPorId, crearProducto, actualizarProducto, eliminarProducto])

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  )
}

// Hook de consumo de productos
export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts debe usarse dentro de <ProductsProvider>')
  return ctx
}

