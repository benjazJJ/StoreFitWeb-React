// Tarjeta de producto
import { Link } from "react-router-dom";
import type { Producto } from "../../types/Producto";
import { formatearCLP } from "../../utils/formatoMoneda";
import { slugify } from "../../utils/slug";

export default function TarjetaProducto({ producto }: { producto: Producto }) {
  const src = producto.imagen ?? "/img/placeholder.svg";

  return (
    <div className="card sf-card h-100 shadow-sm position-relative">
      <div className="ratio ratio-1x1 bg-body-tertiary">
        <img
          src={src}
          alt={producto.nombre}
          className="object-fit-cover rounded-top"
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "/img/placeholder.svg")}
        />
      </div>

      <div className="card-body d-flex flex-column">
        <h6 className="mb-1">{producto.nombre}</h6>
        <div className="text-muted small mb-2">{producto.categoria}</div>
        <strong className="mb-3">{formatearCLP(producto.precio)}</strong>

        {<Link to={`/productos/${slugify(producto.nombre)}`} className="stretched-link" />}
      </div>
    </div>
  );
}
