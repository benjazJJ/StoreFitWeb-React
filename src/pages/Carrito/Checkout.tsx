import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { formatearCLP } from '../../utils/formatoMoneda'
import { alertError, alertSuccess } from '../../utils/alerts'
import { useStock } from '../../context/StockContext'
import { useOrders, type ProveedorEnvio } from '../../context/OrdersContext'

export default function Checkout() {
  const navigate = useNavigate()
  const { sesion, usuarios } = useAuth()
  const { items, total, clear } = useCart()
  const { disminuirStock } = useStock()
  const { addOrder } = useOrders()

  const [proveedor, setProveedor] = useState<ProveedorEnvio>('Blue Express')

  // Usuario completo según sesión (prioriza correo)
  const usuario = useMemo(() => {
    if (!sesion) return null
    const byCorreo = sesion.correo ? usuarios.find(u => u.correo.toLowerCase() === sesion.correo!.toLowerCase()) : undefined
    if (byCorreo) return byCorreo
    const byRut = sesion.rut ? usuarios.find(u => u.rut && u.rut === sesion.rut) : undefined
    return byRut ?? null
  }, [sesion, usuarios])

  // Si no hay sesión o carrito vacío, redirige
  useEffect(() => {
    if (!sesion) navigate('/InicioSesion')
    if (items.length === 0) navigate('/Carrito')
  }, [sesion, items.length])

  const confirmar = async () => {
    try {
      if (!sesion) { await alertError('Inicia sesión'); navigate('/InicioSesion'); return }
      if (items.length === 0) { await alertError('Carrito vacío'); navigate('/Carrito'); return }

      const order = addOrder({
        userKey: sesion.correo || sesion.rut,
        correo: sesion.correo,
        rut: sesion.rut,
        nombre: usuario ? `${usuario.nombre} ${usuario.apellidos}`.trim() : sesion.nombre,
        direccion: usuario?.direccion || '',
        regionId: usuario?.regionId || '',
        comunaId: usuario?.comunaId || '',
        telefono: usuario?.numeroTelefono || '',
        proveedor,
        total,
        items: items.map(it => ({
          id: it.id,
          nombre: it.nombre,
          qty: it.qty,
          talla: (it.talla as any) ?? 'U',
          precioUnitario: it.precio,
          subtotal: it.precio * it.qty,
          imagen: it.imagen,
        })),
      })

      // Descuenta stock por ítem
      for (const it of items) disminuirStock(it.id, (it.talla as any) ?? 'U', it.qty)
      clear()

      await alertSuccess('Compra exitosa', `N° de pedido: ${order.orderNumber}`)
      navigate('/')
    } catch {
      alertError('No se pudo confirmar la compra')
    }
  }

  return (
    <main className="container py-4">
      <div className="row g-4">
        <section className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">Datos del comprador</h4>
              {usuario ? (
                <div className="row g-2">
                  <div className="col-md-6"><strong>Nombre:</strong> {usuario.nombre} {usuario.apellidos}</div>
                  <div className="col-md-6"><strong>RUT:</strong> {usuario.rut || '—'}</div>
                  <div className="col-md-6"><strong>Correo:</strong> {usuario.correo}</div>
                  <div className="col-md-6"><strong>Teléfono:</strong> {usuario.numeroTelefono || '—'}</div>
                  <div className="col-md-12"><strong>Dirección:</strong> {usuario.direccion || '—'}</div>
                  <div className="col-md-6"><strong>Región:</strong> {usuario.regionId || '—'}</div>
                  <div className="col-md-6"><strong>Comuna:</strong> {usuario.comunaId || '—'}</div>
                </div>
              ) : (
                <div className="text-muted">No hay datos de perfil, se usará la información de sesión.</div>
              )}
            </div>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-body">
              <h4 className="card-title mb-3">Resumen de compra</h4>
              <div className="list-group">
                {items.map(it => (
                  <div key={`${it.id}-${it.talla ?? 'U'}`} className="list-group-item d-flex flex-wrap align-items-center gap-3">
                    <img
                      src={it.imagen ?? '/img/placeholder.png'}
                      alt={it.nombre}
                      width={64}
                      height={64}
                      className="rounded object-fit-cover"
                      onError={(e) => (e.currentTarget.src = '/img/placeholder.png')}
                    />
                    <div className="me-auto">
                      <div className="fw-semibold">{it.nombre}</div>
                      <small className="text-muted">{it.talla && it.talla !== 'U' ? `Talla ${it.talla} · ` : ''}{it.qty} x {formatearCLP(it.precio)}</small>
                    </div>
                    <div className="fw-semibold">{formatearCLP(it.precio * it.qty)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="col-12 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Envío</h5>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="envio" id="env-blue" checked={proveedor === 'Blue Express'} onChange={() => setProveedor('Blue Express')} />
                <label className="form-check-label" htmlFor="env-blue">Blue Express</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="envio" id="env-starken" checked={proveedor === 'Starken'} onChange={() => setProveedor('Starken')} />
                <label className="form-check-label" htmlFor="env-starken">Starken</label>
              </div>

              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Total</span>
                <strong>{formatearCLP(total)}</strong>
              </div>
              <button className="btn btn-primary w-100" onClick={confirmar}>Confirmar compra</button>
              <Link to="/Carrito" className="btn btn-outline-secondary w-100 mt-2">Volver al carrito</Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
