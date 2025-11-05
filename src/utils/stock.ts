import { PRODUCTOS } from "../types/Producto";

// Estado de stock en memoria (módulo) para compatibilidad, sin LocalStorage
type StockMap = Record<string, number>
const keyFor = (id: number, talla?: string) => `${id}-${talla ?? 'U'}`

// Inicializa stock en memoria a partir de PRODUCTOS
const TALLAS_ROPA: string[] = ['XS','S','M','L','XL']
let stockMem: StockMap = (() => {
  const base: StockMap = {}
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
})()

export function stockDisponible(id: number, talla?: string): number {
  const k = keyFor(id, (talla ?? 'U'))
  return Math.max(0, stockMem[k] ?? 0)
}

export function disminuirStock(id: number, talla: string | undefined, qty: number) {
  const k = keyFor(id, (talla ?? 'U'))
  const cur = Math.max(0, stockMem[k] ?? 0)
  stockMem = { ...stockMem, [k]: Math.max(0, cur - Math.max(0, Math.floor(qty))) }
}

export function aumentarStock(id: number, talla: string | undefined, qty: number) {
  const k = keyFor(id, (talla ?? 'U'))
  const cur = Math.max(0, stockMem[k] ?? 0)
  stockMem = { ...stockMem, [k]: cur + Math.max(0, Math.floor(qty)) }
}

export function inicializarStockProducto(id: number, tallas?: string[]) {
  if (!tallas || tallas.length === 0) {
    stockMem = { ...stockMem, [keyFor(id, 'U')]: 20 }
  } else {
    const next: StockMap = { ...stockMem }
    for (const t of tallas) next[keyFor(id, t)] = 20
    stockMem = next
  }
}

export function eliminarStockProducto(id: number) {
  const next: StockMap = { ...stockMem }
  for (const k of Object.keys(next)) if (k.startsWith(`${id}-`)) delete (next as any)[k]
  stockMem = next
}
