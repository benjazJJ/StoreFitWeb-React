import type { Producto, Talla } from "../types/Producto";
import { PRODUCTOS } from "../types/Producto";
import { inicializarStockProducto, eliminarStockProducto } from "../utils/stock";

const KEY = "storefit_products";
export const EVENTO_PRODUCTOS = "storefit:products-change";

function leer(): Producto[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Producto[];
  } catch {
    return [];
  }
}

function escribir(lista: Producto[]) {
  localStorage.setItem(KEY, JSON.stringify(lista));
  try { window.dispatchEvent(new Event(EVENTO_PRODUCTOS)); } catch {}
}

export function seedProductosSiVacio() {
  const cur = leer();
  if (cur.length > 0) return;
  escribir(PRODUCTOS);
}

export function obtenerProductos(): Producto[] {
  seedProductosSiVacio();
  return leer();
}

export function obtenerProductoPorId(id: number): Producto | null {
  seedProductosSiVacio();
  return leer().find(p => p.id === id) ?? null;
}

export type NuevoProducto = Omit<Producto, "id"> & { id?: never };
export type PatchProducto = Partial<Omit<Producto, "id">>;

export function crearProducto(data: NuevoProducto): Producto {
  const lista = obtenerProductos();
  const nextId = (lista.reduce((a, p) => Math.max(a, p.id), 0) || 0) + 1;
  const nuevo: Producto = { ...data, id: nextId } as Producto;
  lista.push(nuevo);
  escribir(lista);
  const tallas: Talla[] | undefined = (data.stock ? (Object.keys(data.stock) as Talla[]) : undefined);
  inicializarStockProducto(nextId, tallas);
  return nuevo;
}

export function actualizarProducto(id: number, patch: PatchProducto): Producto | null {
  const lista = obtenerProductos();
  const i = lista.findIndex(p => p.id === id);
  if (i < 0) return null;
  const actualizado = { ...lista[i], ...patch, id } as Producto;
  lista[i] = actualizado;
  escribir(lista);
  return actualizado;
}

export function eliminarProducto(id: number) {
  const lista = obtenerProductos();
  const filtrada = lista.filter(p => p.id !== id);
  escribir(filtrada);
  eliminarStockProducto(id);
}

