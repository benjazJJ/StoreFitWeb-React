import { useParams, useNavigate } from "react-router-dom";
import { PRODUCTOS } from "../../types/Producto";
import { agregarAlCarrito } from "../../utils/cart";
import { useEffect, useState } from "react";
import { formatearCLP } from "../../utils/formatoMoneda";
import { alertSuccess, alertError } from "../../utils/alerts";
import { stockDisponible } from "../../utils/stock";

export default function ProductoDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const pid = Number(id);
    const p = PRODUCTOS.find(x => x.id === pid);
    const [qty, setQty] = useState(1);
    const [talla, setTalla] = useState<string | null>(null);

    if (!p) return <div className="container py-4">Producto no encontrado.</div>;

    const esZapatilla = /zapatill/i.test(p.categoria);

    const disponible = (t: string | null) => {
        if (!p) return 0;
        if (esZapatilla) { if (!t) return 0; return stockDisponible(p.id, t); }
        if (p.stock) { if (!t) return 0; return stockDisponible(p.id, t); }
        return stockDisponible(p.id, 'U');
    };

  const inc = () => setQty(q => Math.min(disponible(talla) || 99, q + 1));
  const dec = () => setQty(q => Math.max(1, q - 1));
  const stockSeleccionado = disponible(talla);

    // Selección automática de talla disponible
    useEffect(() => {
        if (!p) return;
        if (!p.stock && !esZapatilla) { if (talla === null) setTalla('U'); return; }
        if (talla) return;
        const tallas = esZapatilla
            ? Array.from({ length: 10 }, (_, i) => String(35 + i))
            : ['XS', 'S', 'M', 'L', 'XL'];
        for (const t of tallas) {
            if ((disponible(t) || 0) > 0) { setTalla(t); break; }
        }
    }, [p?.id]);

    const handleAdd = async () => {
        try {
            if (esZapatilla || p.stock) {
                if (!talla) { await alertError('Selecciona una talla'); return; }
                if (disponible(talla) <= 0) { await alertError('Sin stock en esta talla'); return; }
            }
            agregarAlCarrito(p, qty, talla ?? undefined);
            await alertSuccess("Producto añadido", `${p.nombre} x${qty}${talla ? ` (${talla})` : ''}`);
            navigate("/Carrito");
        } catch {
            alertError("No se pudo añadir", "Intenta nuevamente");
        }
    };

    return (
        <main className="container py-4">
            <div className="row g-4">
                <div className="col-md-6">
                    <img
                        className="img-fluid rounded shadow-sm"
                        src={p.imagen ?? "/img/placeholder.png"}
                        alt={p.nombre}
                        onError={(e) => (e.currentTarget.src = "/img/placeholder.png")}
                    />
                </div>

                <div className="col-md-6">
                    <h3 className="mb-1">{p.nombre}</h3>
                    <div className="text-muted mb-2">{p.categoria}</div>
                    <h4 className="mb-3">{formatearCLP(p.precio)}</h4>
                    {p.descripcion && <p className="text-muted mb-3">{p.descripcion}</p>}

          {(p.stock || esZapatilla) && (
            <div className="mb-3">
              <div className="mb-1">Talla</div>
              <div className="btn-group" role="group" aria-label="Tallas">
                                {(esZapatilla ? Array.from({ length: 10 }, (_, i) => String(35 + i)) : ['XS', 'S', 'M', 'L', 'XL']).map(t => {
                                    const stock = disponible(t);
                                    const active = talla === t;
                                    return (
                                        <button
                                            key={t}
                                            type="button"
                                            className={`btn btn-sm ${active ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                            onClick={() => { setTalla(t); setQty(q => Math.min(Math.max(1, stock), q)); }}
                                            disabled={stock <= 0}
                                            aria-pressed={active}
                                            title={stock <= 0 ? 'Sin stock' : `Stock: ${stock}`}
                                        >
                                            {t}
                                        </button>
                                    )
                })}
              </div>
              {talla && (
                <div className="mt-2">
                  {stockSeleccionado <= 2 ? (
                    <small className="text-danger">Pocas unidades: {stockSeleccionado} restantes</small>
                  ) : (
                    <small className="text-muted">Stock: {stockSeleccionado}</small>
                  )}
                </div>
              )}
            </div>
          )}

                    {/* Cantidad */}
                    <div className="d-inline-flex align-items-center border rounded mb-3">
                        <button className="btn btn-light" onClick={dec} aria-label="Disminuir">-</button>
                        <input
                            className="form-control text-center"
                            style={{ width: 70, border: "none", boxShadow: "none" }}
                            value={qty}
                            onChange={(e) => {
                                const v = Number(e.target.value.replace(/\D/g, "")) || 1;
                                setQty(Math.min(disponible(talla) || 99, Math.max(1, v)));
                            }}
                        />
                        <button className="btn btn-light" onClick={inc} aria-label="Aumentar">+</button>
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" onClick={handleAdd}>
                            Añadir al carrito
                        </button>
                        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                            Volver
                        </button>
                    </div>

                    <p className="mt-4 text-muted">Tela respirable, costuras reforzadas. Envíos a todo Chile.</p>
                </div>
            </div>
        </main>
    );
}
