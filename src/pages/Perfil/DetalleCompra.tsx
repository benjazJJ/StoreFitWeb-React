import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Compra } from "../../api/ordersApi";
import { obtenerCompraPorId } from "../../api/ordersApi";
import { formatearCLP } from "../../utils/formatoMoneda";

const estadoColores: Record<string, string> = {
  pendiente: "#ffc107",
  procesando: "#0d6efd",
  confirmada: "#0dcaf0",
  enviada: "#6f42c1",
  entregada: "#198754",
  cancelada: "#dc3545",
};

const estadoLabels: Record<string, string> = {
  pendiente: "⏳ Pendiente",
  procesando: "⚙️ Procesando",
  confirmada: "✓ Confirmada",
  enviada: "📦 Enviada",
  entregada: "✔️ Entregada",
  cancelada: "✗ Cancelada",
};

export default function DetalleCompra() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [compra, setCompra] = useState<Compra | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarCompra = async () => {
      if (!id) {
        setError("ID de compra inválido");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError(null);
        const data = await obtenerCompraPorId(id);
        setCompra(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar la compra");
        console.error("Error:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarCompra();
  }, [id]);

  if (cargando) {
    return (
      <main className="container py-4">
        <div className="text-center text-muted py-5">
          <p>Cargando detalle de compra...</p>
        </div>
      </main>
    );
  }

  if (error || !compra) {
    return (
      <main className="container py-4">
        <div className="text-center py-5">
          <p className="text-danger mb-3">{error || "Compra no encontrada"}</p>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/MisCompras")}
          >
            Volver a mis compras
          </button>
        </div>
      </main>
    );
  }

  const fechaCreacion = new Date(compra.createdAt).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="mb-1">Detalle de compra</h1>
          <p className="text-muted mb-0">Orden #{compra.idCompra}</p>
        </div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/MisCompras")}
        >
          ← Volver
        </button>
      </div>

      <div className="row g-4">
        {/* Información general */}
        <section className="col-12 col-lg-8">
          {/* Estado de la compra */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="card-title mb-1">Estado de la compra</h5>
                  <small className="text-muted">{fechaCreacion}</small>
                </div>
                <div
                  style={{
                    backgroundColor: estadoColores[compra.estadoCompra] || "#6c757d",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    fontWeight: "bold",
                  }}
                >
                  {estadoLabels[compra.estadoCompra] || compra.estadoCompra}
                </div>
              </div>
            </div>
          </div>

          {/* Información de envío */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Información de envío</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <small className="text-muted d-block">Nombre</small>
                  <strong>{compra.nombreUsuario}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">RUT</small>
                  <strong>{compra.rutUsuario}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Correo</small>
                  <strong>{compra.correoUsuario}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Teléfono</small>
                  <strong>{compra.telefono}</strong>
                </div>
                <div className="col-12">
                  <small className="text-muted d-block">Dirección</small>
                  <strong>{compra.direccion}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Región</small>
                  <strong>{compra.region}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Comuna</small>
                  <strong>{compra.comuna}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Artículos de la compra */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Artículos</h5>
              <div className="list-group list-group-flush">
                {compra.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="list-group-item d-flex gap-3 align-items-start py-3"
                  >
                    <img
                      src={item.imagen || "/img/placeholder.svg"}
                      alt={item.nombre}
                      width={80}
                      height={80}
                      className="rounded object-fit-cover flex-shrink-0"
                      onError={(e) =>
                        (e.currentTarget.src = "/img/placeholder.svg")
                      }
                    />
                    <div className="flex-grow-1">
                      <div className="fw-semibold mb-1">{item.nombre}</div>
                      <small className="text-muted d-block mb-2">
                        Talla: {item.talla} · Cantidad: {item.cantidad}
                      </small>
                      <small className="text-muted">
                        {formatearCLP(item.precioUnitario)} c/u
                      </small>
                    </div>
                    <div className="text-end">
                      <div className="fw-semibold">
                        {formatearCLP(item.subtotal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Resumen de pago */}
        <aside className="col-12 col-lg-4">
          <div className="card shadow-sm sticky-top" style={{ top: "1rem" }}>
            <div className="card-body">
              <h5 className="card-title mb-4">Resumen de pago</h5>

              {/* Método de pago */}
              <div className="mb-4 pb-4 border-bottom">
                <small className="text-muted d-block mb-2">Método de pago</small>
                <strong>
                  {compra.metodoPago === "tarjeta"
                    ? "💳 Tarjeta de crédito/débito"
                    : compra.metodoPago === "transferencia"
                      ? "🏦 Transferencia bancaria"
                      : "🅿️ PayPal"}
                </strong>
              </div>

              {/* Desglose de precios */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <strong>{formatearCLP(compra.total)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Envío</span>
                  <strong className="text-success">Gratis</strong>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Total</span>
                  <strong className="text-primary" style={{ fontSize: "1.25rem" }}>
                    {formatearCLP(compra.total)}
                  </strong>
                </div>
              </div>

              {/* Información adicional */}
              <div className="alert alert-info small mb-0">
                <strong>Nota:</strong> Tu compra fue registrada el{" "}
                {new Date(compra.createdAt).toLocaleDateString("es-CL")}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
