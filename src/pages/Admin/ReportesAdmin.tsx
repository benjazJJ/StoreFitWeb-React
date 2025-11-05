import { useReports } from '../../context/ReportsContext'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrdersContext'
import { Link } from 'react-router-dom'

export default function ReportesAdmin() {
  const { entries, clear } = useReports()
  const { usuarios } = useAuth()
  const { allOrders } = useOrders()

  return (
    <main className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <Link to="/Admin" className="btn btn-outline-secondary btn-sm">Volver al dashboard</Link>
          <h1 className="m-0">Reportes</h1>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={clear}>Limpiar reportes</button>
      </div>

      <section className="mb-4">
        <h5 className="mb-2">Resumen</h5>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <div className="text-muted small">Usuarios registrados</div>
                <div className="h4 m-0">{usuarios.length}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <div className="text-muted small">Pedidos</div>
                <div className="h4 m-0">{allOrders.length}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <div className="text-muted small">Eventos de productos</div>
                <div className="h4 m-0">{entries.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h5 className="mb-2">Cambios en productos</h5>
        {entries.length === 0 ? (
          <div className="text-muted">No hay eventos registrados en esta sesión.</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Producto</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id}>
                    <td>{new Date(e.at).toLocaleString('es-CL')}</td>
                    <td>{e.type.replace('producto_', '').toUpperCase()}</td>
                    <td>{e.producto.id} · {e.producto.nombre}</td>
                    <td>
                      {e.type === 'producto_creado' && 'Creado'}
                      {e.type === 'producto_actualizado' && 'Actualizado'}
                      {e.type === 'producto_eliminado' && 'Eliminado'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
