import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Producto, Talla } from '../types/Producto'

// Tipos para operaciones CRUD de productos
export type NuevoProducto = Omit<Producto, 'id'> & { id?: never }
export type PatchProducto = Partial<Omit<Producto, 'id'>>

type ProductsContextType = {
  productos: Producto[]                                           // Lista en memoria de productos
  obtenerProductos: () => Producto[]                              // Devuelve la lista actual
  obtenerProductoPorId: (id: string) => Producto | null           // Busca un producto por ID
  crearProducto: (data: NuevoProducto) => Producto                // Crea un producto nuevo
  actualizarProducto: (id: string, patch: PatchProducto) => Producto | null // Actualiza un producto
  eliminarProducto: (id: string) => void                          // Elimina un producto
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

// Proveedor de productos con estado en memoria (useState)
export function ProductsProvider({ children }: { children: React.ReactNode }) {
  // Estado: lista de productos; se inicializa vacía (los datos ahora vienen del API)
  const [productos, setProductos] = useState<Producto[]>([])

  // Lee la lista actual (útil para compatibilidad de llamada)
  const obtenerProductos = useCallback(() => productos, [productos])

  // Encuentra un producto por ID
  const obtenerProductoPorId = useCallback((id: string) => productos.find(p => p.id === id) ?? null, [productos])

  // Crea un nuevo producto, asignando un ID consecutivo
  const crearProducto = useCallback((data: NuevoProducto) => {
    const nextId = (parseInt(productos.reduce((a, p) => Math.max(a, parseInt(p.id) || 0), 0).toString()) || 0) + 1
    const nuevo: Producto = { ...data, id: nextId.toString() } as Producto
    setProductos(prev => [...prev, nuevo])
    return nuevo
  }, [productos])

  // Actualiza parcial o totalmente un producto por ID
  const actualizarProducto = useCallback((id: string, patch: PatchProducto) => {
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
  const eliminarProducto = useCallback((id: string) => {
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

