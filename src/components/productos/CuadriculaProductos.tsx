import type { Producto } from '../../types/Producto'
import TarjetaProducto from './TarjetaProducto'

export default function CuadriculaProductos({
  productos,
  onAgregar
}: {
  productos: Producto[]
  onAgregar?: (p: Producto) => void
}) {
  return (
    <div className="row g-3">
      {productos.map((p) => (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p.id}>
          <TarjetaProducto producto={p} onAgregar={onAgregar} />
        </div>
      ))}
      {productos.length === 0 && (
        <div className="text-center py-5 text-secondary">No hay productos para mostrar.</div>
      )}
    </div>
  )
}
