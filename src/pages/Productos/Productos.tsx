import { useEffect, useMemo, useState } from "react";
import type { Producto } from "../../types/Producto";
import { obtenerProductos } from "../../api/catalogApi";
import { formatearCLP } from "../../utils/formatoMoneda";
import { Link } from "react-router-dom";

export default function ProductosPage() {
  // 👈 IMPORTANTE: array vacío, nunca null
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("TODAS");

  //  SOLO cargamos productos
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setCargando(true);
        setError(null);

        const data = await obtenerProductos();

        // Normalizamos por si el backend envía {content: [...]} u otra forma
        const lista: Producto[] = Array.isArray(data)
          ? data
          : (data?.content ?? data?.items ?? []);

        setProductos(lista ?? []);
      } catch (err) {
        console.error("Error cargando productos", err);
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar los productos"
        );
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  // 🔹 Categorías derivadas desde los propios productos
  const categorias = useMemo(() => {
    if (!Array.isArray(productos) || productos.length === 0) return [];
    const set = new Set<string>();
    productos.forEach((p) => {
      if (p.categoria) {
        set.add(p.categoria);
      }
    });
    return Array.from(set).sort();
  }, [productos]);

  // 🔹 Filtro combinado por nombre + categoría
  const productosFiltrados = useMemo(() => {
    if (!Array.isArray(productos)) return [];

    return productos.filter((p) => {
      const coincideNombre =
        busqueda.trim().length === 0 ||
        p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase());

      const coincideCategoria =
        categoriaSeleccionada === "TODAS" ||
        p.categoria === categoriaSeleccionada;

      return coincideNombre && coincideCategoria;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  if (cargando) {
    return (
      <main className="container py-4">
        <p className="text-muted text-center py-5">Cargando productos...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-4">
        <div className="text-center text-danger py-5">
          <p className="mb-3">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <header className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <h1 className="m-0">Productos</h1>

        <div className="d-flex flex-column flex-md-row gap-2 flex-grow-1 justify-content-end">
          {/* Buscador */}
          <div className="input-group" style={{ maxWidth: 320 }}>
            <span className="input-group-text">
              <i className="bi bi-search" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Selector de categoría (solo frontend) */}
          <select
            className="form-select"
            style={{ maxWidth: 220 }}
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="TODAS">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </header>

      {productosFiltrados.length === 0 ? (
        <p className="text-muted">No se encontraron productos.</p>
      ) : (
        <section className="row g-4">
          {productosFiltrados.map((p) => {
            const imagenPrincipal =
              p.imagenes?.find((img) => img.principal)?.url ??
              p.imagenes?.[0]?.url ??
              "/img/placeholder.svg";

            return (
              <article key={p.id} className="col-12 col-sm-6 col-lg-3">
                <Link
                  to={`/productos/${p.categoria ?? ""}/${p.id}`}
                  className="text-decoration-none text-body"
                >
                  <div className="card h-100 shadow-sm sf-product-card">
                    <div className="ratio ratio-1x1 bg-light rounded-top overflow-hidden">
                      <img
                        src={imagenPrincipal}
                        alt={p.nombre}
                        className="object-fit-cover"
                        onError={(e) =>
                          (e.currentTarget.src = "/img/placeholder.svg")
                        }
                      />
                    </div>
                    <div className="card-body">
                      <h5 className="card-title mb-1">{p.nombre}</h5>
                      {p.categoria && (
                        <small className="text-muted d-block mb-2">
                          {p.categoria}
                        </small>
                      )}
                      <strong className="text-primary">
                        {formatearCLP(p.precio)}
                      </strong>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
