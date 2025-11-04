import { PRODUCTOS } from "../types/Producto";

const KEY = "storefit_stock";
const KEY_SEEDED = "storefit_stock_seeded";

type StockMap = Record<string, number>; // clave: `${id}-${talla}` o `${id}-U`

const keyFor = (id: number, talla?: string) => `${id}-${talla ?? 'U'}`;

function leer(): StockMap {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

function escribir(m: StockMap) {
  localStorage.setItem(KEY, JSON.stringify(m));
}

function seedSiNecesario() {
  // No volver a sembrar si ya fue sembrado alguna vez
  const seeded = localStorage.getItem(KEY_SEEDED) === '1';
  const cur = leer();
  if (seeded || Object.keys(cur).length > 0) return;
  const base: StockMap = {};
  const TALLAS_ROPA: string[] = ['XS','S','M','L','XL'];
  for (const p of PRODUCTOS) {
    const esZapatilla = /zapatill/i.test(p.categoria);
    if (esZapatilla) {
      for (let n = 35; n <= 44; n++) base[keyFor(p.id, String(n))] = 20;
    } else if (p.stock && Object.keys(p.stock).length > 0) {
      for (const t of TALLAS_ROPA) base[keyFor(p.id, t)] = 20;
    } else {
      base[keyFor(p.id, 'U')] = 20;
    }
  }
  escribir(base);
  localStorage.setItem(KEY_SEEDED, '1');
}

export function stockDisponible(id: number, talla?: string): number {
  seedSiNecesario();
  const m = leer();
  const k = keyFor(id, (talla ?? 'U'));
  return Math.max(0, m[k] ?? 0);
}

export function disminuirStock(id: number, talla: string | undefined, qty: number) {
  seedSiNecesario();
  const m = leer();
  const k = keyFor(id, (talla ?? 'U'));
  const cur = Math.max(0, m[k] ?? 0);
  m[k] = Math.max(0, cur - Math.max(0, Math.floor(qty)));
  escribir(m);
}

export function aumentarStock(id: number, talla: string | undefined, qty: number) {
  seedSiNecesario();
  const m = leer();
  const k = keyFor(id, (talla ?? 'U'));
  const cur = Math.max(0, m[k] ?? 0);
  m[k] = cur + Math.max(0, Math.floor(qty));
  escribir(m);
}

export function inicializarStockProducto(id: number, tallas?: string[]) {
  seedSiNecesario();
  const m = leer();
  if (!tallas || tallas.length === 0) {
    m[keyFor(id, 'U')] = 20;
  } else {
    for (const t of tallas) m[keyFor(id, t)] = 20;
  }
  escribir(m);
}

export function eliminarStockProducto(id: number) {
  const m = leer();
  const keys = Object.keys(m);
  for (const k of keys) {
    if (k.startsWith(`${id}-`)) delete m[k];
  }
  escribir(m);
}
