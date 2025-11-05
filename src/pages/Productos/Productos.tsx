import { useEffect, useMemo, useState } from "react";
import "../../styles/Producto.css";
import { PRODUCTOS, type Producto } from "../../types/Producto";
import TarjetaProducto from "../../components/productos/TarjetaProducto";
import { useProducts } from "../../context/ProductsContext";

export default function ProductosPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [datos, setDatos] = useState<Producto[]>([]);
  const { productos } = useProducts(); // Obtiene lista de productos desde contexto (useState)

  useEffect(() => {
    setDatos(productos);
  }, [productos]);

  const categorias = useMemo(
    () => Array.from(new Set(datos.map(p => p.categoria))).sort(),
    [datos]
  );

  const lista = useMemo(() => {
    const term = q.trim().toLowerCase();
    return datos.filter(p => {
      const okCat = !cat || p.categoria === cat;
      const okQ =
        !term ||
        p.nombre.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term);
      return okCat && okQ;
    });
  }, [q, cat, datos]);

  const limpiarFiltros = () => {
    setQ("");
    setCat("");
  };

  return (
    <main className="container py-4">
      {/* Barra */}
      <header className="sf-products-toolbar card border-0 shadow-sm mb-3">
        <div className="card-body d-flex flex-wrap gap-2 align-items-center">
          <h2 className="m-0 me-auto">Productos</h2>

          {/* Búsqueda */}
          <form
            className="input-group sf-input-ghost"
            role="search"
            style={{ maxWidth: 380 }}
            onSubmit={(e) => e.preventDefault()}
          >
            <span className="input-group-text" aria-hidden="true">
              <i className="bi bi-search" />
            </span>
            <input
              className="form-control"
              placeholder="Buscar por nombre o categoría..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar productos"
            />
            {q && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setQ("")}
                aria-label="Limpiar búsqueda"
                title="Limpiar"
              >
                <i className="bi bi-x-lg" />
              </button>
            )}
          </form>

          {/* Categorías */}
          <select
            className="form-select sf-select-ghost"
            style={{ maxWidth: 240 }}
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Limpiar */}
          {(q || cat) && (
            <button className="btn btn-outline-secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>

        {(q || cat) && (
          <div className="px-3 pb-3 d-flex flex-wrap gap-2">
            {q && (
              <span className="sf-chip" role="button" onClick={() => setQ("")}>Búsqueda: “{q}” <i className="bi bi-x"></i></span>
            )}
            {cat && (
              <span className="sf-chip" role="button" onClick={() => setCat("")}>Categoría: “{cat}” <i className="bi bi-x"></i></span>
            )}
          </div>
        )}
      </header>

      {/* Estado */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <small className="text-muted">
          {lista.length} resultado{lista.length !== 1 ? "s" : ""}{cat ? ` en “${cat}”` : ""}{q ? ` para “${q}”` : ""}
        </small>
      </div>

      {/* Grid */}
      {lista.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p className="mb-1">No encontramos resultados</p>
          <small>Prueba con otros términos o limpia los filtros.</small>
        </div>
      ) : (
        <section className="row g-3 row-cols-2 row-cols-md-3 row-cols-lg-4">
          {lista.map((p) => (
            <div className="col" key={p.id}>
              <TarjetaProducto producto={p} />
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
