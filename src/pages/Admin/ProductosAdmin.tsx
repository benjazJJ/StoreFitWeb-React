import { useEffect, useMemo, useState } from 'react'
import type { Producto, Talla } from '../../types/Producto'
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto, EVENTO_PRODUCTOS } from '../../data/db'
import { formatearCLP } from '../../utils/formatoMoneda'
import { stockDisponible, aumentarStock, disminuirStock } from '../../utils/stock'
import { alertConfirm, alertSuccess } from '../../utils/alerts'

type Form = {
  nombre: string
  precio: number
  categoria: string
  descripcion: string
  imagen?: string
  tallas: Record<Talla, boolean>
}

const initForm: Form = {
  nombre: '', precio: 0, categoria: '', descripcion: '', imagen: '', tallas: { XS:false, S:false, M:false, L:false, XL:false }
}

export default function ProductosAdmin() {
  const [lista, setLista] = useState<Producto[]>([])
  const [form, setForm] = useState<Form>(initForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [selTalla, setSelTalla] = useState<Record<number, string>>({})
  const [tick, setTick] = useState(0)

  const cargar = () => setLista(obtenerProductos())
  useEffect(() => {
    cargar();
    const h = () => cargar();
    window.addEventListener(EVENTO_PRODUCTOS, h as EventListener)
    return () => window.removeEventListener(EVENTO_PRODUCTOS, h as EventListener)
  }, [])

  const tallasSeleccionadas = useMemo(() => (Object.keys(form.tallas).filter(k => form.tallas[k as Talla]) as Talla[]), [form.tallas])

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!form.nombre.trim() || !form.categoria.trim() || form.precio <= 0) return
    const stock = tallasSeleccionadas.length ? Object.fromEntries(tallasSeleccionadas.map(t => [t, 20])) : undefined
    if (editId) {
      actualizarProducto(editId, { nombre: form.nombre, categoria: form.categoria, descripcion: form.descripcion, precio: form.precio, imagen: form.imagen, stock })
    } else {
      crearProducto({ nombre: form.nombre, categoria: form.categoria, descripcion: form.descripcion, precio: form.precio, imagen: form.imagen, stock })
    }
    setForm(initForm)
    setEditId(null)
  }

  const onEdit = (p: Producto) => {
    setEditId(p.id)
    setForm({
      nombre: p.nombre,
      categoria: p.categoria,
      descripcion: p.descripcion || '',
      precio: p.precio,
      imagen: p.imagen,
      tallas: { XS:false, S:false, M:false, L:false, XL:false, ...Object.fromEntries((Object.keys(p.stock || {}) as Talla[]).map(t => [t, true])) as any }
    })
  }

  const onDelete = async (p: Producto) => {
    const ok = await alertConfirm('Eliminar producto', `¿Seguro que deseas eliminar "${p.nombre}" (ID ${p.id})?`, 'Sí, eliminar', 'Cancelar')
    if (!ok) return
    eliminarProducto(p.id)
    await alertSuccess('Producto eliminado')
  }

  const tallasDe = (p: Producto): string[] => {
    const esZ = /zapatill/i.test(p.categoria)
    if (esZ) return Array.from({ length: 10 }, (_, i) => String(35 + i))
    const claves = Object.keys(p.stock || {})
    return claves.length ? claves : ['U']
  }

  const seleccionTalla = (p: Producto) => selTalla[p.id] ?? tallasDe(p)[0]

  const cambiarStock = (p: Producto, delta: number) => {
    const t = seleccionTalla(p)
    if (delta > 0) aumentarStock(p.id, t, delta)
    else disminuirStock(p.id, t, -delta)
    setTick(x => x + 1)
  }

  return (
    <main className="container py-4 sf-admin">
      <h1 className="mb-3">Administrar productos</h1>

      <form className="card shadow-sm mb-4" onSubmit={onSubmit}>
        <div className="card-body row g-3">
          <div className="col-md-4">
            <label className="form-label">Nombre</label>
            <input className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Categoría</label>
            <input className="form-control" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Precio</label>
            <input type="number" min={0} className="form-control" value={form.precio} onChange={e => setForm({ ...form, precio: Number(e.target.value) || 0 })} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Imagen (URL)</label>
            <input className="form-control" value={form.imagen} onChange={e => setForm({ ...form, imagen: e.target.value })} />
          </div>
          <div className="col-12">
            <label className="form-label">Descripción</label>
            <textarea className="form-control" rows={2} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="col-12">
            <label className="form-label me-2">Tallas</label>
            {(['XS','S','M','L','XL'] as Talla[]).map(t => (
              <div key={t} className="form-check form-check-inline">
                <input id={`t-${t}`} className="form-check-input" type="checkbox" checked={!!form.tallas[t]} onChange={e => setForm({ ...form, tallas: { ...form.tallas, [t]: e.target.checked } })} />
                <label className="form-check-label" htmlFor={`t-${t}`}>{t}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="card-footer d-flex justify-content-end gap-2 bg-transparent">
          {editId && (
            <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditId(null); setForm(initForm); }}>Cancelar</button>
          )}
          <button type="submit" className="btn btn-primary">{editId ? 'Guardar' : 'Crear'}</button>
        </div>
      </form>

      <div className="table-responsive">
        <table className="table align-middle table-hover">
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Tallas</th><th>Inventario</th><th></th>
            </tr>
          </thead>
          <tbody>
            {lista.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{formatearCLP(p.precio)}</td>
                <td>{Object.keys(p.stock || {}).join(', ') || 'U'}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    {tallasDe(p).length > 1 ? (
                      <select
                        className="form-select form-select-sm"
                        style={{ maxWidth: 100 }}
                        value={seleccionTalla(p)}
                        onChange={(e) => setSelTalla(prev => ({ ...prev, [p.id]: e.target.value }))}
                      >
                        {tallasDe(p).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="badge text-bg-secondary">U</span>
                    )}
                    <div className="d-inline-flex align-items-center gap-1">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => cambiarStock(p, -1)} title="-1">-</button>
                      <small className="text-muted" title="Stock actual">
                        {stockDisponible(p.id, seleccionTalla(p))}
                      </small>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => cambiarStock(p, +1)} title="+1">+</button>
                    </div>
                  </div>
                </td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => onEdit(p)}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(p)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
