import { useMemo, useState } from 'react'
import { useOrders } from '../../context/OrdersContext'
import { formatearCLP } from '../../utils/formatoMoneda'
import { Link } from 'react-router-dom'

export default function PedidosAdmin() {
  const { allOrders } = useOrders()
  const [q, setQ] = useState('')

  const lista = useMemo(() => {
    const term = q.trim().toLowerCase()
    return allOrders.filter(o => !term || (o.userKey?.toLowerCase().includes(term) || o.orderNumber.includes(term)))
  }, [q, allOrders])

  return (
    <main className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <Link to="/Admin" className="btn btn-outline-secondary btn-sm">Volver al dashboard</Link>
          <h1 className="m-0">Pedidos</h1>
        </div>
        <input className="form-control" style={{maxWidth: 320}} placeholder="Buscar por usuario o N° pedido" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {lista.length === 0 ? (
        <div className="text-muted">No hay pedidos.</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle table-hover">
            <thead>
              <tr>
                <th>N° Pedido</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(p => (
                <tr key={p.orderNumber}>
                  <td>#{p.orderNumber}</td>
                  <td>{p.userKey}</td>
                  <td>{new Date(p.createdAt).toLocaleString('es-CL')}</td>
                  <td>{p.proveedor}</td>
                  <td>{p.items.length}</td>
                  <td>{formatearCLP(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
