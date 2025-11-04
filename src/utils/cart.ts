import type { Producto } from "../types/Producto";
import { obtenerSesion } from "../services/auth";
const BASE_KEY = "storefit_cart";
const EVENTO_CARRITO = "storefit:cart-change";

export type CartItem = { id: number; nombre: string; precio: number; imagen?: string; qty: number; talla?: string };
export type Cart = Record<string, CartItem>;

function cartKey(): string {
  try {
    const s = obtenerSesion();
    const id = (s?.correo || s?.rut || null);
    if (id) return `${BASE_KEY}_${String(id).toLowerCase()}`;
    // invitado persistente (almacenado en localStorage)
    let gk = localStorage.getItem('storefit_guest_id');
    if (!gk) {
      gk = `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
      localStorage.setItem('storefit_guest_id', gk);
    }
    return `${BASE_KEY}_${gk}`;
  } catch {
    return `${BASE_KEY}_anon`;
  }
}

function read(): Cart {
  try {
    const data = JSON.parse(localStorage.getItem(cartKey()) || "{}");
    // Migración: si venían claves numéricas, conviértalas a string
    if (data && typeof data === 'object') {
      const out: Record<string, CartItem> = {};
      for (const k of Object.keys(data)) {
        const v = (data as any)[k];
        const kk = /-/.test(k) ? k : `${k}-U`;
        out[kk] = v;
      }
      return out;
    }
    return {};
  } catch {
    return {};
  }
}

function write(c: Cart) {
  localStorage.setItem(cartKey(), JSON.stringify(c));
  try { window.dispatchEvent(new Event(EVENTO_CARRITO)); } catch { /* sin efecto en SSR */ }
}

const keyFor = (id: number, talla?: string) => `${id}-${talla ?? 'U'}`;

export function agregarAlCarrito(p: Producto, qty = 1, talla?: string) {
  const c = read();
  const k = keyFor(p.id, talla ?? 'U');
  const cur = c[k];
  c[k] = {
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    imagen: p.imagen,
    talla: (talla ?? 'U'),
    qty: Math.min(99, Math.max(1, (cur?.qty || 0) + qty)),
  };
  write(c);
}

export function establecerCantidadItem(id: number, qty: number, talla?: string) {
  const c = read();
  const k = keyFor(id, talla ?? 'U');
  if (qty <= 0) {
    delete c[k];
  } else {
    const cur = c[k];
    if (!cur) return; 
    c[k] = { ...cur, qty: Math.min(99, Math.max(1, Math.floor(qty))) };
  }
  write(c);
}

export function quitarItem(id: number, talla?: string) {
  const c = read();
  const k = keyFor(id, talla ?? 'U');
  if (c[k]) {
    delete c[k];
    write(c);
  }
}

export function limpiarCarrito() {
  write({});
}

export function listaCarrito(): CartItem[] {
  return Object.values(read());
}

export const cantidadCarrito = () => listaCarrito().reduce((a, i) => a + i.qty, 0);

export const totalCarrito = () => listaCarrito().reduce((a, i) => a + i.precio * i.qty, 0);

export { EVENTO_CARRITO };

export const addToCart = agregarAlCarrito;
export const setItemQty = establecerCantidadItem;
export const removeItem = quitarItem;
export const clearCart = limpiarCarrito;
export const cartList = listaCarrito;
export const cartCount = cantidadCarrito;
export const cartTotal = totalCarrito;
export const CART_EVENT = EVENTO_CARRITO;
