import type { Producto } from "../../types/Producto";
import { useMemo } from "react";

import { PRODUCTOS } from "../../types/Producto";

type Props = {
  productos?: Producto[];
};

export default function CuadriculaProductos({ productos }: Props) {
  const lista = useMemo<Producto[]>(() => productos ?? PRODUCTOS, [productos]);

  const verDetalle = (p: Producto) => {
    // Abre detalle
    alert(`Detalle de: ${p.nombre}`);
  };

  return (
    <div className="row g-4">
      {lista.map((p) => (
        <div key={p.id} className="col-12 col-sm-6 col-lg-4">
          <article className="card h-100 shadow-sm">
            <img src={p.imagen ?? p.imagen} className="card-img-top" alt={p.nombre} />
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">{p.nombre}</h5>
              <small className="text-muted mb-2">{p.categoria}</small>
              <strong className="mb-3">
                {Number(p.precio).toLocaleString("es-CL", { style: "currency", currency: "CLP" })}
              </strong>
              <button className="btn btn-outline-primary mt-auto" onClick={() => verDetalle(p)}>
                Ver detalle
              </button>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
