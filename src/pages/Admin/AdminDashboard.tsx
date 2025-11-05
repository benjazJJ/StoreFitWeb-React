import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductsContext'
import { useOrders } from '../../context/OrdersContext'
import { useReports } from '../../context/ReportsContext'
import { formatearCLP } from '../../utils/formatoMoneda'
import { useMessages } from '../../context/MessagesContext'

export default function AdminDashboard() {
  const { usuarios } = useAuth()
  const { productos } = useProducts()
  const { allOrders } = useOrders()
  const { entries } = useReports()
  const { messages } = useMessages()

  const lastOrders = allOrders.slice(0, 5)
  const lastEvents = entries.slice(0, 5)

  return (
    <main>
      <section className="row g-3 mb-3">
        <KPI title="Usuarios" value={usuarios.length} to="/Admin/Usuarios" />
        <KPI title="Pedidos" value={allOrders.length} to="/Admin/Pedidos" />
        <KPI title="Productos" value={productos.length} to="/Admin/Productos" />
        <KPI title="Eventos" value={entries.length} to="/Admin/Reportes" />
        <KPI title="Mensajes" value={messages.length} to="/Admin/Mensajes" />
      </section>

      <section className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">Últimos pedidos</h5>
                <Link className="btn btn-sm btn-outline-secondary" to="/Admin/Pedidos">Ver todos</Link>
              </div>
              {lastOrders.length === 0 ? (
                <div className="text-muted">No hay pedidos aún.</div>
              ) : (
                <div className="list-group">
                  {lastOrders.map(p => (
                    <div key={p.orderNumber} className="list-group-item d-flex flex-wrap align-items-center justify-content-between">
                      <div className="me-3">
                        <div className="fw-semibold">Pedido #{p.orderNumber}</div>
                        <small className="text-muted">{new Date(p.createdAt).toLocaleString('es-CL')} · {p.userKey}</small>
                      </div>
                      <div className="text-end">
                        <div className="badge text-bg-secondary me-2">{p.proveedor}</div>
                        <strong>{formatearCLP(p.total)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">Cambios recientes</h5>
                <Link className="btn btn-sm btn-outline-secondary" to="/Admin/Reportes">Ver todos</Link>
              </div>
              {lastEvents.length === 0 ? (
                <div className="text-muted">Sin cambios registrados en esta sesión.</div>
              ) : (
                <div className="list-group">
                  {lastEvents.map(e => (
                    <div key={e.id} className="list-group-item d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-semibold">{(e.producto.nombre || 'Producto')} {e.producto.id ? `(#${e.producto.id})` : ''}</div>
                        <small className="text-muted">{new Date(e.at).toLocaleString('es-CL')}</small>
                      </div>
                      <span className="badge text-bg-secondary">{e.type.replace('producto_', '').toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">Últimos mensajes</h5>
                <Link className="btn btn-sm btn-outline-secondary" to="/Admin/Mensajes">Ver todos</Link>
              </div>
              {messages.length === 0 ? (
                <div className="text-muted">No hay mensajes.</div>
              ) : (
                <div className="list-group">
                  {messages.slice(0,5).map(m => (
                    <div key={m.id} className="list-group-item d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-semibold">{m.asunto || 'Sin asunto'}</div>
                        <small className="text-muted">{m.nombre} · {m.correo}</small>
                      </div>
                      {!m.leido && <span className="badge text-bg-warning">Nuevo</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function KPI({ title, value, to }: { title: string; value: number | string; to: string }) {
  return (
    <div className="col-12 col-sm-6 col-lg-3">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <div className="text-muted small">{title}</div>
          <div className="display-6 fw-bold">{value}</div>
          <div className="mt-auto">
            <Link className="btn btn-sm btn-outline-secondary" to={to}>Ir a {title}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
