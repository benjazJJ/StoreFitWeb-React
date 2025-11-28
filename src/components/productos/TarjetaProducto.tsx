// Tarjeta de producto
import { Link } from "react-router-dom";
import type { Producto } from "../../types/Producto";
import { formatearCLP } from "../../utils/formatoMoneda";

export default function TarjetaProducto({ producto }: { producto: Producto }) {
  // Obtener la imagen principal
  const imagenPrincipal = producto.imagenes?.find(img => img.principal)?.url 
    ?? producto.imagenes?.[0]?.url 
    ?? "/img/placeholder.svg";

  return (
    <div className="card sf-card h-100 shadow-sm position-relative">
      <div className="ratio ratio-1x1 bg-body-tertiary">
        <img
          src={imagenPrincipal}
          alt={producto.nombre}
          className="object-fit-cover rounded-top"
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "/img/placeholder.svg")}
        />
      </div>

      <div className="card-body d-flex flex-column">
        <h6 className="mb-1">{producto.nombre}</h6>
        <div className="text-muted small mb-2">{producto.categoria}</div>
        {/* Breve detalle/descripcion en la tarjeta */}
        {producto.descripcion && (
          <div className="text-muted small mb-2 text-truncate" title={producto.descripcion}>
            {producto.descripcion}
          </div>
        )}
        <strong className="mb-3">{formatearCLP(producto.precio)}</strong>

        {/* Navegar a detalle usando ruta compuesta categoria/id cuando esté disponible */}
        {<Link to={`/productos/${encodeURIComponent(String(producto.categoria))}/${encodeURIComponent(String(producto.id))}`} className="stretched-link" />}
      </div>
    </div>
  );
}
