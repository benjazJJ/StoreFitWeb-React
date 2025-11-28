import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Compra } from "../../api/ordersApi";
import { obtenerComprasPorRut } from "../../api/ordersApi";
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
  pendiente: "Pendiente",
  procesando: "Procesando",
  confirmada: "Confirmada",
  enviada: "Enviada",
  entregada: "Entregada",
  cancelada: "Cancelada",
};

export default function MisCompras() {
  const navigate = useNavigate();

  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarCompras = async () => {
      try {
        setCargando(true);
        setError(null);

        const token = localStorage.getItem("token");
        const userRut = localStorage.getItem("userRut");

        if (!token || !userRut) {
          setError("No autenticado");
          navigate("/InicioSesion");
          return;
        }

        const data = await obtenerComprasPorRut(userRut);
        setCompras(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar compras");
        console.error("Error:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarCompras();
  }, [navigate]);

  const handleNavigateDetalle = (compraId: string) => {
    navigate(`/DetalleCompra/${compraId}`);
  };

  if (cargando) {
    return (
      <main className="container py-4">
        <div className="text-center text-muted py-5">
          <p>Cargando tus compras...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <header className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="m-0">Mis compras</h1>
        <Link to="/Perfil" className="btn btn-outline-secondary btn-sm">
          ← Volver
        </Link>
      </header>

      {error ? (
        <div className="text-center text-danger py-5">
          <p className="mb-3">{error}</p>
          <button
            className="btn btn-outline-secondary"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      ) : compras.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p className="mb-3">Aún no registras compras.</p>
          <Link to="/productos" className="btn btn-primary">
            Ir a comprar
          </Link>
        </div>
      ) : (
        <div className="vstack gap-3">
          {compras.map((compra) => (
            <div
              key={compra.idCompra}
              className="card shadow-sm cursor-pointer transition-all"
              style={{ cursor: "pointer" }}
              onClick={() => handleNavigateDetalle(compra.idCompra)}
            >
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="m-0">Orden #{compra.idCompra}</h5>
                    <small className="text-muted">
                      {new Date(compra.createdAt).toLocaleDateString("es-CL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                  <div className="text-end">
                    <div className="mb-2">
                      <span
                        style={{
                          backgroundColor: estadoColores[compra.estadoCompra] || "#6c757d",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "4px",
                          fontSize: "0.875rem",
                          fontWeight: "bold",
                        }}
                      >
                        {estadoLabels[compra.estadoCompra] || compra.estadoCompra}
                      </span>
                    </div>
                    <div className="fw-semibold" style={{ fontSize: "1.25rem" }}>
                      {formatearCLP(compra.total)}
                    </div>
                  </div>
                </div>

                <hr className="my-2" />

                {/* Preview de artículos (máximo 3) */}
                <div className="list-group list-group-sm">
                  {compra.items.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="list-group-item d-flex align-items-center gap-2 py-2"
                    >
                      <img
                        src={item.imagen || "/img/placeholder.svg"}
                        alt={item.nombre}
                        width={48}
                        height={48}
                        className="rounded object-fit-cover flex-shrink-0"
                        onError={(e) =>
                          (e.currentTarget.src = "/img/placeholder.svg")
                        }
                      />
                      <div className="flex-grow-1 min-width-0">
                        <div className="fw-semibold text-truncate">
                          {item.nombre}
                        </div>
                        <small className="text-muted text-truncate">
                          Talla {item.talla} · Cant. {item.cantidad}
                        </small>
                      </div>
                      <div className="fw-semibold text-end flex-shrink-0">
                        {formatearCLP(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Si hay más artículos */}
                {compra.items.length > 3 && (
                  <small className="text-muted d-block mt-2">
                    + {compra.items.length - 3} producto{
                      compra.items.length - 3 !== 1 ? "s" : ""
                    } más
                  </small>
                )}

                {/* Footer con método de pago */}
                <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {compra.metodoPago === "tarjeta"
                      ? "💳 Tarjeta"
                      : compra.metodoPago === "transferencia"
                        ? "🏦 Transferencia"
                        : "🅿️ PayPal"}
                  </small>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateDetalle(compra.idCompra);
                    }}
                  >
                    Ver detalle →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
