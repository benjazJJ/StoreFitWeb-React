import { useState } from 'react'
import { validarCorreo, validarNombre, requerido, longitudMaxima } from '../../utils/validaciones'
import { alertSuccess, alertError } from '../../utils/alerts'

type FormContacto = {
  nombre: string
  correo: string
  asunto: string
  mensaje: string
}

const inicial: FormContacto = { nombre: '', correo: '', asunto: '', mensaje: '' }

export default function Contacto() {
  const [form, setForm] = useState<FormContacto>(inicial)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)
  const [mensajes, setMensajes] = useState<any[]>([]) // Estado en memoria para simular almacenamiento de contactos

  const set = <K extends keyof FormContacto>(k: K, v: FormContacto[K]) => setForm(p => ({ ...p, [k]: v }))

  const validar = (): boolean => {
    const e: Record<string, string> = {}
    const eNom = validarNombre(form.nombre, 'nombre')
    const eCor = validarCorreo(form.correo)
    if (!form.asunto.trim()) e.asunto = 'El asunto es obligatorio'
    if (!requerido(form.mensaje)) e.mensaje = 'El mensaje es obligatorio'
    if (!longitudMaxima(form.mensaje, 1000)) e.mensaje = 'Máximo 1000 caracteres'
    if (eNom) e.nombre = eNom
    if (eCor) e.correo = eCor
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (enviando) return
    if (!validar()) return
    setEnviando(true)
    try {
      // Agrega el mensaje al estado en memoria (useState) en lugar de LocalStorage
      setMensajes(prev => [...prev, { ...form, fecha: new Date().toISOString() }])
      await alertSuccess('Mensaje enviado', 'Te contactaremos pronto')
      setForm(inicial)
      setErrores({})
    } catch (e) {
      console.error(e)
      alertError('No se pudo enviar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="container py-4">
      <header className="mb-4">
        <h1 className="m-0">Contacto</h1>
        <small className="text-muted">Envíanos tu consulta</small>
      </header>

      <form className="card shadow-sm" onSubmit={onSubmit} noValidate>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre</label>
              <input className={`form-control ${errores.nombre ? 'is-invalid' : ''}`} value={form.nombre} onChange={e => set('nombre', e.target.value)} />
              {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Correo</label>
              <input type="email" className={`form-control ${errores.correo ? 'is-invalid' : ''}`} value={form.correo} onChange={e => set('correo', e.target.value)} />
              {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
            </div>
            <div className="col-12">
              <label className="form-label">Asunto</label>
              <input className={`form-control ${errores.asunto ? 'is-invalid' : ''}`} value={form.asunto} onChange={e => set('asunto', e.target.value)} />
              {errores.asunto && <div className="invalid-feedback">{errores.asunto}</div>}
            </div>
            <div className="col-12">
              <label className="form-label">Mensaje</label>
              <textarea rows={5} className={`form-control ${errores.mensaje ? 'is-invalid' : ''}`} value={form.mensaje} onChange={e => set('mensaje', e.target.value)} />
              {errores.mensaje && <div className="invalid-feedback">{errores.mensaje}</div>}
            </div>
          </div>
        </div>
        <div className="card-footer bg-transparent d-flex gap-2 justify-content-end">
          <button type="reset" className="btn btn-outline-secondary" onClick={() => setForm(inicial)} disabled={enviando}>Limpiar</button>
          <button type="submit" className="btn btn-primary" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar'}</button>
        </div>
      </form>
    </main>
  )
}

