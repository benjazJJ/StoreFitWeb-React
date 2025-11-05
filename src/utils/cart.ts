import type { Producto } from "../types/Producto";

// Implementación en memoria (módulo) del carrito, sin LocalStorage.
export type CartItem = { id: number; nombre: string; precio: number; imagen?: string; qty: number; talla?: string };
export type Cart = Record<string, CartItem>;
export const EVENTO_CARRITO = "storefit:cart-change"; // Compatibilidad (no se emite)

const keyFor = (id: number, talla?: string) => `${id}-${talla ?? 'U'}`;
let cartMem: Cart = {};

// Agrega un producto al carrito (en memoria)
export function agregarAlCarrito(p: Producto, qty = 1, talla?: string) {
  const k = keyFor(p.id, talla ?? 'U');
  const cur = cartMem[k];
  cartMem = {
    ...cartMem,
    [k]: {
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      imagen: p.imagen,
      talla: (talla ?? 'U'),
      qty: Math.min(99, Math.max(1, (cur?.qty || 0) + qty)),
    }
  };
}

// Establece cantidad exacta para un ítem
export function establecerCantidadItem(id: number, qty: number, talla?: string) {
  const k = keyFor(id, talla ?? 'U');
  if (qty <= 0) {
    const { [k]: _, ...rest } = cartMem; cartMem = rest; return;
  }
  const cur = cartMem[k];
  if (!cur) return;
  cartMem = { ...cartMem, [k]: { ...cur, qty: Math.min(99, Math.max(1, Math.floor(qty))) } };
}

// Quita un ítem del carrito
export function quitarItem(id: number, talla?: string) {
  const k = keyFor(id, talla ?? 'U');
  if (cartMem[k]) { const { [k]: _, ...rest } = cartMem; cartMem = rest; }
}

// Vacía el carrito
export function limpiarCarrito() { cartMem = {}; }

// Lista de ítems del carrito
export function listaCarrito(): CartItem[] { return Object.values(cartMem); }

export const cantidadCarrito = () => listaCarrito().reduce((a, i) => a + i.qty, 0);
export const totalCarrito = () => listaCarrito().reduce((a, i) => a + i.precio * i.qty, 0);

// Aliases compatibles
export const addToCart = agregarAlCarrito;
export const setItemQty = establecerCantidadItem;
export const removeItem = quitarItem;
export const clearCart = limpiarCarrito;
export const cartList = listaCarrito;
export const cartCount = cantidadCarrito;
export const cartTotal = totalCarrito;
export const CART_EVENT = EVENTO_CARRITO;