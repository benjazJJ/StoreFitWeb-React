export type Talla = 'XS' | 'S' | 'M' | 'L' | 'XL'

export type Producto = {
  id: number
  nombre: string
  precio: number
  categoria: string
  imagen?: string
  descripcion?: string
  stock?: Partial<Record<Talla, number>>
  tipoTalla?: 'ropa' | 'zapatilla' | 'unica'
}



export const PRODUCTOS: Producto[] = [
  {
    id: 1,
    nombre: 'Polera Deportiva',
    precio: 15990,
    categoria: 'Poleras',
    imagen: 'public/img/PoleraStorefit.png',
    descripcion: 'Polera respirable de rápido secado, ideal para entrenamientos diarios.',
    stock: { XS: 5, S: 12, M: 20, L: 10, XL: 4 }
  },
  {
    id: 2,
    nombre: 'Polerón Deportivo',
    precio: 24990,
    categoria: 'Polerones',
    imagen: 'public/img/PoleronStorefit.png',
    descripcion: 'Polerón térmico con interior suave, perfecto para días fríos.',
    stock: { XS: 2, S: 8, M: 15, L: 7, XL: 3 }
  },
  {
    id: 3,
    nombre: 'Buzo Deportivo',
    precio: 29990,
    categoria: 'Pantalones',
    imagen: 'public/img/BuzosStorefit.png',
    descripcion: 'Buzo ligero y resistente, con ajuste cómodo para movilidad.',
    stock: { XS: 0, S: 6, M: 12, L: 9, XL: 5 }
  },
  {
    id: 4,
    nombre: 'Conjunto Deportivo Mujer',
    precio: 39990,
    categoria: 'Conjunto',
    imagen: 'public/img/TopMujer.png',
    descripcion: 'Conjunto de alto soporte con tela elástica y transpirable.',
    stock: { XS: 3, S: 10, M: 14, L: 6, XL: 2 }
  }
]
