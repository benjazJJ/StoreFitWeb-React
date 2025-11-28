import { useMessages } from "../../context/MessagesContext";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function MensajesAdmin() {
  const { messages } = useMessages(); // 👈 solo leemos, no usamos markRead
  const [filtro, setFiltro] = useState<"todos" | "leidos" | "no-leidos">(
    "todos"
  );
  const [q, setQ] = useState("");

  const lista = useMemo(() => {
    const term = q.trim().toLowerCase();
    return messages.filter((m) => {
      if (filtro === "leidos" && !m.leido) return false;
      if (filtro === "no-leidos" && m.leido) return false;
      if (!term) return true;
      return (
        m.nombre.toLowerCase().includes(term) ||
        m.correo.toLowerCase().includes(term) ||
        m.asunto.toLowerCase().includes(term) ||
        m.mensaje.toLowerCase().includes(term)
      );
    });
  }, [messages, filtro, q]);

  return (
    <main className="container-fluid p-0">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <Link to="/Admin" className="btn btn-outline-secondary btn-sm">
            Volver al dashboard
          </Link>
          <h2 className="m-0">Mensajes</h2>
        </div>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="Buscar..."
            style={{ maxWidth: 300 }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: 160 }}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as any)}
          >
            <option value="todos">Todos</option>
            <option value="no-leidos">No leídos</option>
            <option value="leidos">Leídos</option>
          </select>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="text-muted">No hay mensajes.</div>
      ) : (
        <div className="list-group">
          {lista.map((m) => (
            <div key={m.id} className="list-group-item">
              <div className="d-flex align-items-start justify-content-between">
                <div className="me-3">
                  <div className="d-flex align-items-center gap-2">
                    <strong>{m.asunto || "Sin asunto"}</strong>
                    {!m.leido && (
                      <span className="badge text-bg-warning">Nuevo</span>
                    )}
                  </div>
                  <div className="small text-muted">
                    {new Date(m.fecha).toLocaleString("es-CL")} · {m.nombre} ·{" "}
                    {m.correo}
                  </div>
                </div>
                <div className="text-end small text-muted">
                  {/* Solo mostramos el estado, no hay botón */}
                  Estado: {m.leido ? "Leído" : "No leído"}
                </div>
              </div>
              <p className="mb-0 mt-2" style={{ whiteSpace: "pre-wrap" }}>
                {m.mensaje}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 small text-muted">
        Esta sección es solo de lectura. El administrador no puede modificar el
        estado de los mensajes.
      </p>
    </main>
  );
}
