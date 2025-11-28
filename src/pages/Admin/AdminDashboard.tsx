import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../context/ProductsContext";
import { useOrders } from "../../context/OrdersContext";
import { formatearCLP } from "../../utils/formatoMoneda";
import { useMessages } from "../../context/MessagesContext";

export default function AdminDashboard() {
  const { usuarios = [] } = useAuth();
  const { productos = [] } = useProducts();
  const { allOrders = [] } = useOrders();
  const { messages = [] } = useMessages();

  // Tomamos los últimos 5 pedidos (del más reciente al más antiguo)
  const lastOrders = [...allOrders].slice(-5).reverse();
  // Tomamos los primeros 5 mensajes (ya entran en orden de llegada desde el contexto)
  const lastMessages = messages.slice(0, 5);

  return (
    <main>
      {/* ==== KPIs superiores ==== */}
      <section className="row g-3 mb-3">
        <KPI title="Usuarios" value={usuarios.length} to="/Admin/Usuarios" />
        <KPI title="Pedidos" value={allOrders.length} to="/Admin/Pedidos" />
        <KPI title="Productos" value={productos.length} to="/Admin/Productos" />
        <KPI title="Mensajes" value={messages.length} to="/Admin/Mensajes" />
      </section>

      {/* ==== Secciones inferiores ==== */}
      <section className="row g-3">
        {/* Últimos pedidos */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">Últimos pedidos</h5>
                <Link
                  className="btn btn-sm btn-outline-secondary"
                  to="/Admin/Pedidos"
                >
                  Ver todos
                </Link>
              </div>

              {lastOrders.length === 0 ? (
                <div className="text-muted">No hay pedidos aún.</div>
              ) : (
                <div className="list-group">
                  {lastOrders.map((p: any) => (
                    <div
                      key={p.orderNumber}
                      className="list-group-item d-flex flex-wrap align-items-center justify-content-between"
                    >
                      <div className="me-3">
                        <div className="fw-semibold">
                          Pedido #{p.orderNumber}
                        </div>
                        <small className="text-muted">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleString("es-CL")
                            : ""}
                          {p.userKey ? ` · ${p.userKey}` : ""}
                        </small>
                      </div>
                      <div className="text-end">
                        {p.proveedor && (
                          <div className="badge text-bg-secondary me-2">
                            {p.proveedor}
                          </div>
                        )}
                        <strong>{formatearCLP(p.total ?? 0)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Últimos mensajes */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">Últimos mensajes</h5>
                <Link
                  className="btn btn-sm btn-outline-secondary"
                  to="/Admin/Mensajes"
                >
                  Ver todos
                </Link>
              </div>

              {lastMessages.length === 0 ? (
                <div className="text-muted">No hay mensajes.</div>
              ) : (
                <div className="list-group">
                  {lastMessages.map((m) => (
                    <div
                      key={m.id}
                      className="list-group-item d-flex flex-column gap-1"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">
                            {m.asunto || "Sin asunto"}
                          </div>
                          <small className="text-muted">
                            {m.nombre} · {m.correo}
                          </small>
                        </div>
                        <div className="text-end">
                          <small className="text-muted d-block">
                            {m.fecha
                              ? new Date(m.fecha).toLocaleString("es-CL")
                              : ""}
                          </small>
                          {!m.leido && (
                            <span className="badge text-bg-warning">
                              Nuevo
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mb-0 small text-muted">
                        {m.mensaje.length > 80
                          ? m.mensaje.slice(0, 80) + "..."
                          : m.mensaje}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <p className="mt-4 small text-muted text-center">
        Este panel es solo de lectura. El administrador solo visualiza el
        estado general de usuarios, pedidos, productos y mensajes.
      </p>
    </main>
  );
}

function KPI({
  title,
  value,
  to,
}: {
  title: string;
  value: number | string;
  to: string;
}) {
  return (
    <div className="col-12 col-sm-6 col-lg-3">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <div className="text-muted small">{title}</div>
          <div className="display-6 fw-bold">{value}</div>
          <div className="mt-auto">
            <Link className="btn btn-sm btn-outline-secondary" to={to}>
              Ir a {title}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
