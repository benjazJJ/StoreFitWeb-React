import type { Producto } from '../../types/Producto'
import { formatearCLP } from '../../utils/formatoMoneda'

export default function TarjetaProducto({ producto }: { producto: Producto }) {
  const src = (producto as any).imagen ?? (producto as any).image ?? '' // por si queda algún "image"

  const verDetalle = () => {
    alert(`Detalle de: ${producto.nombre}`)
  }

  return (
    <div className="card sf-card h-100">
      <img src={src} className="card-img-top p-3" alt={producto.nombre} height={180} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{producto.nombre}</h5>
        <p className="card-text text-muted mb-2">{producto.categoria}</p>
        <p className="fw-bold mb-4">{formatearCLP(producto.precio)}</p>
        <button className="btn btn-outline-primary mt-auto" onClick={verDetalle}>
          Ver detalle
        </button>
      </div>
    </div>
  )
}
