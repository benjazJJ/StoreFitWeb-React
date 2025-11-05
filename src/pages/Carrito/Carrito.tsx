import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatearCLP } from "../../utils/formatoMoneda";
import { alertSuccess, alertError } from "../../utils/alerts";
import { useAuth } from "../../context/AuthContext";
import { useStock } from "../../context/StockContext";

export default function Carrito() {
  const { items: articulos, setQty, remove, clear, total } = useCart(); // Estado de carrito via useState
  const navigate = useNavigate();
  const { sesion: sesionActual } = useAuth();               // Sesión actual via useState
  const { stockDisponible, disminuirStock } = useStock();   // Stock en memoria via useState

  const aumentar = (id: number, talla?: string) => {
    const it = articulos.find(i => i.id === id && (i.talla ?? 'U') === (talla ?? 'U'));
    if (!it) return;
    const disp = stockDisponible(id, (it.talla as any) ?? 'U');
    if (it.qty >= disp) { alertError('Stock insuficiente'); return; }
    setQty(id, Math.min(disp, it.qty + 1), (it.talla as any) ?? 'U');
  };

  const disminuir = (id: number, talla?: string) => {
    const it = articulos.find(i => i.id === id && (i.talla ?? 'U') === (talla ?? 'U'));
    if (!it) return;
    const next = it.qty - 1;
    if (next <= 0) remove(id, (it.talla as any) ?? 'U'); else setQty(id, next, (it.talla as any) ?? 'U');
  };

  const onCambioCantidad = (id: number, talla: string | undefined, v: string) => {
    const n = Math.max(0, Math.min(99, Number(v.replace(/\D/g, "")) || 0));
    if (n <= 0) { remove(id, (talla as any) ?? 'U'); return; }
    const disp = stockDisponible(id, (talla as any) ?? 'U');
    const final = Math.min(n, disp);
    if (final < n) alertError('Stock insuficiente');
    setQty(id, final, (talla as any) ?? 'U');
  };

  const onQuitar = (id: number, talla?: string) => { remove(id, (talla as any) ?? 'U'); };
  const onVaciar = () => { clear(); };

  const onPagar = async () => {
    try {
      if (articulos.length === 0) return;
      if (!sesionActual) {
        await alertError("Inicia sesión", "Debes iniciar sesión para pagar");
        navigate("/InicioSesion");
        return;
      }
      // Redirige a Checkout para confirmar datos y envío
      navigate("/Checkout");
      return;
      await alertSuccess("Compra realizada", "¡Gracias por tu compra!");
      // Descuenta stock por ítem y talla
      for (const it of articulos) disminuirStock(it.id, (it.talla as any) ?? 'U', it.qty);
      clear();
      navigate("/");
    } catch {
      alertError("No se pudo completar la compra");
    }
  };

  return (
    <main className="container py-4 sf-cart">
      <header className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="m-0">Carrito</h1>
        {articulos.length > 0 && (
          <button className="btn btn-outline-danger btn-sm" onClick={onVaciar}>Vaciar carrito</button>
        )}
      </header>

      {articulos.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p className="mb-3">Tu carrito está vacío.</p>
          <Link to="/productos" className="btn btn-primary">Explorar productos</Link>
        </div>
      ) : (
        <div className="row g-4">
          <section className="col-12 col-lg-8">
            <div className="list-group">
              {articulos.map(it => (
                <div key={`${it.id}-${it.talla ?? 'U'}`} className="list-group-item d-flex flex-wrap gap-3 align-items-center">
                  <img
                    src={it.imagen ?? "/img/placeholder.svg"}
                    alt={it.nombre}
                    width={72}
                    height={72}
                    className="rounded object-fit-cover flex-shrink-0"
                    onError={(e) => (e.currentTarget.src = "/img/placeholder.svg")}
                  />
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{it.nombre}</div>
                    <small className="text-muted">
                      {formatearCLP(it.precio)}{it.talla && it.talla !== 'U' ? ` · Talla ${it.talla}` : ''}
                    </small>
                  </div>
                  <div className="d-inline-flex align-items-center border rounded qty-control">
                    <button className="btn btn-light" onClick={() => disminuir(it.id, it.talla as any)} aria-label="Disminuir">−</button>
                    <input
                      className="form-control text-center"
                      style={{ width: 70, border: "none", boxShadow: "none" }}
                      value={it.qty}
                      onChange={(e) => onCambioCantidad(it.id, it.talla as any, e.target.value)}
                      inputMode="numeric"
                    />
                    <button className="btn btn-light" onClick={() => aumentar(it.id, it.talla as any)} aria-label="Aumentar">+</button>
                  </div>
                  <div className="text-end cart-actions">
                    <div className="fw-semibold">{formatearCLP(it.precio * it.qty)}</div>
                    <button className="btn btn-sm btn-outline-secondary mt-1" onClick={() => onQuitar(it.id, it.talla as any)}>Quitar</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="col-12 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Resumen</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <strong>{formatearCLP(total)}</strong>
                </div>
                <button className="btn btn-primary w-100 mb-2" onClick={onPagar}>Pagar</button>
                {!sesionActual && (
                  <button className="btn btn-outline-secondary w-100" onClick={() => navigate("/InicioSesion")}>Iniciar sesión</button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
