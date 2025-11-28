import { SUPPORT_URL } from "../config/api";

// Los mismos roles que maneja el backend
export type RolNombre = "ADMIN" | "CLIENTE" | "SOPORTE";

// Info mínima para enviar en los headers
export type AuthHeaders = {
  rut: string;
  rol: RolNombre;
};

// ==== Tipos que vienen del backend ====

export type Mensaje = {
  id: number;
  rutRemitente: string;
  idRolDestino: number | null;
  rutDestino: string | null;
  contenido: string;
  creadoEn: number;
  leido: boolean;
  esRespuesta: boolean;
  respondeAId: number | null;
  idHilo: number | null;
  respondidoEn: number | null;
};

export type MensajeConRespuestaDTO = {
  clienteMensaje: Mensaje;
  respuesta: Mensaje | null;
};

// ==== DTO de entrada para cliente → soporte ====

export type EnviarMensajeRequest = {
  rutRemitente: string;
  contenido: string;
};

// Función helper para armar headers con auth
function buildHeaders(auth: AuthHeaders): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-User-Rut": auth.rut,
    "X-User-Rol": auth.rol,
  };
}

// ==================
// 1) Cliente envía mensaje a soporte
// POST /api/v1/mensajes/cliente
// ==================
export async function enviarMensajeCliente(
  payload: EnviarMensajeRequest,
  auth: AuthHeaders
): Promise<Mensaje> {
  const res = await fetch(`${SUPPORT_URL}/mensajes/cliente`, {
    method: "POST",
    headers: buildHeaders(auth),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[enviarMensajeCliente] HTTP ${res.status} ${text}`);
  }

  return (await res.json()) as Mensaje;
}

// ==================
// 2) Bandeja de un cliente
// GET /api/v1/mensajes/usuario/{rut}/bandeja?asc=false
// ==================
export async function obtenerBandejaUsuario(
  rutUsuario: string,
  auth: AuthHeaders,
  asc: boolean = false
): Promise<MensajeConRespuestaDTO[]> {
  const url = new URL(
    `${SUPPORT_URL}/mensajes/usuario/${encodeURIComponent(rutUsuario)}/bandeja`
  );
  url.searchParams.set("asc", String(asc));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: buildHeaders(auth),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[obtenerBandejaUsuario] HTTP ${res.status} ${text}`);
  }

  return (await res.json()) as MensajeConRespuestaDTO[];
}

// ==================
// 3) Bandeja de soporte completa
// GET /api/v1/mensajes/soporte/bandeja?asc=false
// ==================
export async function obtenerBandejaSoporte(
  auth: AuthHeaders,
  asc: boolean = false
): Promise<MensajeConRespuestaDTO[]> {
  const url = new URL(`${SUPPORT_URL}/mensajes/soporte/bandeja`);
  url.searchParams.set("asc", String(asc));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: buildHeaders(auth),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[obtenerBandejaSoporte] HTTP ${res.status} ${text}`);
  }

  return (await res.json()) as MensajeConRespuestaDTO[];
}

// ==================
// 4) Obtener un hilo completo
// GET /api/v1/mensajes/hilos/{idHilo}
// ==================
export async function obtenerHilo(
  idHilo: number,
  auth: AuthHeaders
): Promise<Mensaje[]> {
  const res = await fetch(`${SUPPORT_URL}/mensajes/hilos/${idHilo}`, {
    method: "GET",
    headers: buildHeaders(auth),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[obtenerHilo] HTTP ${res.status} ${text}`);
  }

  return (await res.json()) as Mensaje[];
}

// ==================
// 5) SOPORTE responde a un mensaje del cliente
// POST /api/v1/mensajes/soporte/{idOriginal}/respuesta
// ==================
export async function responderMensaje(
  idMensajeOriginal: number,
  contenido: string,
  auth: AuthHeaders
): Promise<Mensaje> {
  const res = await fetch(
    `${SUPPORT_URL}/mensajes/soporte/${idMensajeOriginal}/respuesta`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Rut": auth.rut,
        "X-User-Rol": auth.rol,
      },
      body: JSON.stringify({
        rutSoporte: auth.rut,  // 👈 nombre correcto que espera el backend
        contenido,             // texto de la respuesta
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[responderMensaje] HTTP ${res.status} ${text}`);
  }

  return (await res.json()) as Mensaje;
}



// ==================
// 6) Marcar mensaje como leído
// PATCH /api/v1/mensajes/{id}/leido
// ==================
export async function marcarMensajeLeido(
  idMensaje: number,
  auth: AuthHeaders
): Promise<void> {
  const res = await fetch(`${SUPPORT_URL}/mensajes/${idMensaje}/leido`, {
    method: "PATCH",
    headers: buildHeaders(auth),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[marcarMensajeLeido] HTTP ${res.status} ${text}`);
  }
}
