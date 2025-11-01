import { useState, useCallback } from 'react'
import SitioLayout from './layouts/SitioLayout'
import Inicio from './pages/Inicio/Inicio'
import { CarritoProveedor, useCarrito } from './context/CarritoContext'
import type { Producto } from './types/Producto'
import { PRODUCTOS } from './types/Producto'

function AppContenido() {
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS)
  const { agregar } = useCarrito()

  const manejarBusqueda = useCallback((q?: string) => {
    if (!q) {
      setProductos(PRODUCTOS)
      return
    }
    const ql = q.toLowerCase()
    const filtrados = PRODUCTOS.filter(p =>
      p.nombre.toLowerCase().includes(ql) ||
      p.categoria.toLowerCase().includes(ql)
    )
    setProductos(filtrados)
  }, [])

  return (
    <SitioLayout onBuscar={manejarBusqueda}>
      <Inicio productos={productos} onAgregar={agregar} />
    </SitioLayout>
  )
}

export default function App() {
  return (
    <CarritoProveedor>
      <AppContenido />
    </CarritoProveedor>
  )
}
