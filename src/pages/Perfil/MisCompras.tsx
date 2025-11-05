import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrdersContext'
import { formatearCLP } from '../../utils/formatoMoneda'

export default function MisCompras() {
  const { sesion } = useAuth()
  const { getOrdersByUser } = useOrders()
  const navigate = useNavigate()

  useEffect(() => {
    if (!sesion) navigate('/InicioSesion')
  }, [sesion])

  const userKey = sesion?.correo || sesion?.rut || ''
  const pedidos = useMemo(() => (userKey ? getOrdersByUser(userKey) : []), [userKey, getOrdersByUser])

  return (
    <main className="container py-4">
      <header className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="m-0">Mis compras</h1>
        <Link to="/" className="btn btn-outline-secondary btn-sm">Volver</Link>
      </header>

      {pedidos.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p className="mb-2">Aún no registras compras.</p>
          <Link to="/productos" className="btn btn-primary">Ir a productos</Link>
        </div>
      ) : (
        <div className="vstack gap-3">
          {pedidos.map(p => (
            <div key={p.orderNumber} className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                  <div>
                    <h5 className="m-0">Pedido #{p.orderNumber}</h5>
                    <small className="text-muted">{new Date(p.createdAt).toLocaleString('es-CL')}</small>
                  </div>
                  <div className="text-end">
                    <div><small className="text-muted">Envío</small> <span className="ms-1 badge text-bg-secondary">{p.proveedor}</span></div>
                    <div className="fw-semibold">{formatearCLP(p.total)}</div>
                  </div>
                </div>

                <hr />

                <div className="list-group">
                  {p.items.map(it => (
                    <div key={`${p.orderNumber}-${it.id}-${it.talla ?? 'U'}`} className="list-group-item d-flex align-items-center gap-3">
                      <img
                        src={it.imagen ?? '/img/placeholder.png'}
                        alt={it.nombre}
                        width={56}
                        height={56}
                        className="rounded object-fit-cover"
                        onError={(e) => (e.currentTarget.src = '/img/placeholder.png')}
                      />
                      <div className="me-auto">
                        <div className="fw-semibold">{it.nombre}</div>
                        <small className="text-muted">{it.talla && it.talla !== 'U' ? `Talla ${it.talla} · ` : ''}{it.qty} x {formatearCLP(it.precioUnitario)}</small>
                      </div>
                      <div className="fw-semibold">{formatearCLP(it.subtotal)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

