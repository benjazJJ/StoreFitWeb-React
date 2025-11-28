import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerBandejaSoporte,
  responderMensaje,
  marcarMensajeLeido,
  type MensajeConRespuestaDTO,
  type RolNombre,
} from "../../api/supportApi";
import { alertError, alertSuccess } from "../../utils/alerts";

export default function MensajesSoporte() {
  const { sesion } = useAuth();

  const [bandeja, setBandeja] = useState<MensajeConRespuestaDTO[]>([]);
  const [cargando, setCargando] = useState(false);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Auth para headers al microservicio
  const auth =
    sesion && sesion.rut && sesion.rolNombre
      ? { rut: sesion.rut, rol: sesion.rolNombre as RolNombre }
      : null;

  // Cargar bandeja desde el microservicio
  const cargarBandeja = async () => {
    if (!auth) return;
    try {
      setCargando(true);
      setError(null);
      const data = await obtenerBandejaSoporte(auth, false);
      setBandeja(data);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar la bandeja de mensajes.");
      alertError("Error al cargar mensajes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (auth) {
      void cargarBandeja();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion?.rut, sesion?.rolNombre]);

  const handleChangeRespuesta = (idMensajeOriginal: number, texto: string) => {
    setRespuestas((prev) => ({ ...prev, [idMensajeOriginal]: texto }));
  };

  const handleResponder = async (idMensajeOriginal: number) => {
    if (!auth) return;
    const texto = respuestas[idMensajeOriginal]?.trim();
    if (!texto) return;

    try {
      await responderMensaje(idMensajeOriginal, texto, auth);
      await alertSuccess("Respuesta enviada", "El cliente podrá ver tu respuesta.");
      setRespuestas((prev) => ({ ...prev, [idMensajeOriginal]: "" }));
      await cargarBandeja();
    } catch (e) {
      console.error(e);
      alertError("No se pudo enviar la respuesta.");
    }
  };

  const handleMarcarLeido = async (idMensaje: number) => {
    if (!auth) return;
    try {
      await marcarMensajeLeido(idMensaje, auth);
      await cargarBandeja();
    } catch (e) {
      console.error(e);
      alertError("No se pudo marcar como leído.");
    }
  };

  // Seguridad extra: si alguien entra sin rol SOPORTE
  if (!sesion || sesion.rolNombre !== "SOPORTE") {
    return (
      <main className="container py-4">
        <h1 className="mb-3">Panel de Mensajes de Soporte</h1>
        <p>No tienes permisos para ver esta sección.</p>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <h1 className="mb-3">Panel de Mensajes de Soporte</h1>
      <p className="text-muted">
        Aquí los usuarios con rol SOPORTE ven todos los mensajes enviados desde el formulario de contacto,
        pueden marcarlos como leídos y responderlos.
      </p>

      {cargando && <p className="mt-3">Cargando mensajes…</p>}
      {error && !cargando && <p className="mt-3 text-danger">{error}</p>}

      {!cargando && !error && bandeja.length === 0 && (
        <p className="mt-4">No hay mensajes registrados.</p>
      )}

      {!cargando && !error && bandeja.length > 0 && (
        <div className="d-flex flex-column gap-3 mt-4">
          {bandeja.map((dto) => {
            const m = dto.clienteMensaje;
            const resp = dto.respuesta;

            const estadoBadge = resp
              ? "bg-success"
              : m.leido
                ? "bg-secondary"
                : "bg-warning text-dark";

            const textoEstado = resp ? "Respondido" : m.leido ? "Leído" : "Nuevo";

            return (
              <div key={m.id} className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      {/* El backend solo guarda "contenido", así que usamos eso */}
                      <h5 className="card-title mb-1">
                        Mensaje de cliente #{m.id}
                      </h5>
                      <div className="small text-muted">
                        {m.rutRemitente} ·{" "}
                        {new Date(m.creadoEn).toLocaleString()}
                      </div>
                    </div>
                    <span className={"badge " + estadoBadge}>
                      {textoEstado}
                    </span>
                  </div>

                  <p className="mt-2 mb-3" style={{ whiteSpace: "pre-wrap" }}>
                    {m.contenido}
                  </p>

                  <div className="border-top pt-2 mt-2">
                    {resp ? (
                      <>
                        <p className="mb-1 fw-semibold">Respuesta enviada:</p>
                        <p className="mb-2" style={{ whiteSpace: "pre-wrap" }}>
                          {resp.contenido}
                        </p>
                      </>
                    ) : (
                      <p className="mb-2 text-muted">
                        No se ha respondido todavía.
                      </p>
                    )}

                    <div className="mt-2">
                      {/* Solo mostrar el formulario de respuesta si aún NO hay respuesta */}
                      {!resp && (
                        <>
                          <label className="form-label mb-1">Responder</label>
                          <textarea
                            className="form-control mb-2"
                            rows={3}
                            placeholder="Escribe aquí la respuesta al usuario…"
                            value={respuestas[m.id] ?? ""}
                            onChange={(e) =>
                              handleChangeRespuesta(m.id, e.target.value)
                            }
                          />
                        </>
                      )}

                      <div className="d-flex gap-2">
                        {/* Botón Enviar respuesta SOLO si no existe respuesta aún */}
                        {!resp && (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => handleResponder(m.id)}
                          >
                            Enviar respuesta
                          </button>
                        )}

                        {/* Seguir permitiendo marcar como leído si aún no lo está */}
                        {!m.leido && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleMarcarLeido(m.id)}
                          >
                            Marcar como leído
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
