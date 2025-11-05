import type { Producto } from "../types/Producto";
import { PRODUCTOS } from "../types/Producto";

// ATENCIÓN: Este módulo fue migrado para no usar LocalStorage.
// La app ahora usa ProductsContext (estado con useState). Este archivo queda como
// implementación en memoria solo para compatibilidad con llamadas antiguas.

export const EVENTO_PRODUCTOS = "storefit:products-change"; // Conservado por compatibilidad (no se emite)

// Almacenamiento en memoria (módulo) de productos
let productosMem: Producto[] = [...PRODUCTOS]

export function seedProductosSiVacio() {
  // Sin efecto: ya iniciamos productos en memoria con PRODUCTOS
}

export function obtenerProductos(): Producto[] {
  return productosMem
}

export function obtenerProductoPorId(id: number): Producto | null {
  return productosMem.find(p => p.id === id) ?? null
}

export type NuevoProducto = Omit<Producto, "id"> & { id?: never };
export type PatchProducto = Partial<Omit<Producto, "id">>;

export function crearProducto(data: NuevoProducto): Producto {
  const nextId = (productosMem.reduce((a, p) => Math.max(a, p.id), 0) || 0) + 1
  const nuevo: Producto = { ...data, id: nextId } as Producto
  productosMem = [...productosMem, nuevo]
  return nuevo
}

export function actualizarProducto(id: number, patch: PatchProducto): Producto | null {
  let actualizado: Producto | null = null
  productosMem = productosMem.map(p => {
    if (p.id !== id) return p
    actualizado = { ...p, ...patch, id } as Producto
    return actualizado
  })
  return actualizado
}

export function eliminarProducto(id: number) {
  productosMem = productosMem.filter(p => p.id !== id)
}

