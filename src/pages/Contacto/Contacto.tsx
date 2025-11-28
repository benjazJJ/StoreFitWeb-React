import { useEffect, useState } from 'react'
import { validarCorreo, validarNombre, requerido, longitudMaxima } from '../../utils/validaciones'
import { alertSuccess, alertError } from '../../utils/alerts'
import { useAuth } from '../../context/AuthContext'
import {
  enviarMensajeCliente,
  obtenerBandejaUsuario,
  type MensajeConRespuestaDTO,
  type RolNombre,
} from '../../api/supportApi'
import { useMessages } from '../../context/MessagesContext'

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

  // 🔹 NUEVO: bandeja real desde el microservicio
  const [bandeja, setBandeja] = useState<MensajeConRespuestaDTO[]>([])
  const [cargandoBandeja, setCargandoBandeja] = useState(false)

  const { sesion } = useAuth()
  const { addMessage } = useMessages()

  const set = <K extends keyof FormContacto>(k: K, v: FormContacto[K]) =>
    setForm(p => ({ ...p, [k]: v }))

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

  // 🔹 Cargar bandeja del usuario desde el backend
  const cargarBandejaUsuario = async () => {
    if (!sesion?.rut || !sesion.rolNombre) return
    try {
      setCargandoBandeja(true)
      const auth = { rut: sesion.rut, rol: sesion.rolNombre as RolNombre }
      const data = await obtenerBandejaUsuario(sesion.rut, auth, false)
      setBandeja(data)
    } catch (e) {
      console.error(e)
      // No frenamos la página por esto, solo log
    } finally {
      setCargandoBandeja(false)
    }
  }

  useEffect(() => {
    void cargarBandejaUsuario()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion?.rut, sesion?.rolNombre])

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (enviando) return
    if (!validar()) return
    setEnviando(true)
    try {
      if (sesion?.rut && sesion.rolNombre) {
        const auth = { rut: sesion.rut, rol: sesion.rolNombre as RolNombre }

        const contenidoBackend =
          `Asunto: ${form.asunto}\n` +
          `Correo de contacto: ${form.correo}\n\n` +
          `${form.mensaje}`

        await enviarMensajeCliente(
          {
            rutRemitente: sesion.rut,
            contenido: contenidoBackend,
          },
          auth
        )

        // 🔹 Después de enviar, recargamos la bandeja desde la BD
        await cargarBandejaUsuario()

        // 🔹 También lo guardamos en el contexto para el dashboard/admin
        addMessage({
          nombre: form.nombre,
          correo: form.correo,
          asunto: form.asunto,
          mensaje: form.mensaje,
          userKey: sesion.rut,
        })
      }

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
              <input
                className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
              />
              {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Correo</label>
              <input
                type="email"
                className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                value={form.correo}
                onChange={e => set('correo', e.target.value)}
              />
              {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
            </div>
            <div className="col-12">
              <label className="form-label">Asunto</label>
              <input
                className={`form-control ${errores.asunto ? 'is-invalid' : ''}`}
                value={form.asunto}
                onChange={e => set('asunto', e.target.value)}
              />
              {errores.asunto && <div className="invalid-feedback">{errores.asunto}</div>}
            </div>
            <div className="col-12">
              <label className="form-label">Mensaje</label>
              <textarea
                rows={5}
                className={`form-control ${errores.mensaje ? 'is-invalid' : ''}`}
                value={form.mensaje}
                onChange={e => set('mensaje', e.target.value)}
              />
              {errores.mensaje && <div className="invalid-feedback">{errores.mensaje}</div>}
            </div>
          </div>
        </div>
        <div className="card-footer bg-transparent d-flex gap-2 justify-content-end">
          <button
            type="reset"
            className="btn btn-outline-secondary"
            onClick={() => setForm(inicial)}
            disabled={enviando}
          >
            Limpiar
          </button>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      </form>

      {sesion && (
        <section className="mt-4">
          <h2 className="h5 mb-3">Tus mensajes enviados</h2>

          {cargandoBandeja ? (
            <p className="text-muted">Cargando tus mensajes…</p>
          ) : bandeja.length === 0 ? (
            <p className="text-muted">Aún no has enviado mensajes de contacto.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {bandeja.map(dto => {
                const m = dto.clienteMensaje
                const resp = dto.respuesta

                const estadoBadge = resp
                  ? 'bg-success'
                  : m.leido
                  ? 'bg-secondary'
                  : 'bg-warning text-dark'

                const textoEstado = resp ? 'Respondido' : m.leido ? 'Leído' : 'No leído'

                return (
                  <div key={m.id} className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="card-title mb-1">Mensaje #{m.id}</h5>
                          <div className="small text-muted">
                            Enviado el {new Date(m.creadoEn).toLocaleString()}
                          </div>
                        </div>

                        <span className={'badge ' + estadoBadge}>{textoEstado}</span>
                      </div>

                      <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                        {m.contenido}
                      </p>

                      <div className="border-top pt-2">
                        {resp ? (
                          <>
                            <p className="mb-1 fw-semibold">Respuesta de soporte:</p>
                            <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                              {resp.contenido}
                            </p>
                          </>
                        ) : (
                          <p className="mb-0 text-muted">Sin respuesta todavía.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}
    </main>
  )
}
