export type Producto = {
  id: number
  nombre: string
  precio: number
  categoria: string
  imagen?: string
}



export const PRODUCTOS: Producto[] = [
  { id: 1, nombre: 'Polera Deportiva', precio: 15990, categoria: 'Poleras', imagen: 'public/img/PoleraStorefit.png' },
  { id: 2, nombre: 'Polerón Deportivo', precio: 24990, categoria: 'Polerones', imagen: 'public/img/PoleronStorefit.png' },
  { id: 3, nombre: 'Buzo Deportivo', precio: 29990, categoria: 'Pantalones', imagen: 'public/img/BuzosStorefit.png' },
  { id: 4, nombre: 'Conjunto Deportivo Mujer', precio: 39990, categoria: 'Conjunto', imagen: 'public/img/TopMujer.png' }
]
