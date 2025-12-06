/**
 * Traduce errores de red/API a mensajes amigables para el usuario
 */
export function obtenerMensajeError(error: unknown): string {
  if (error instanceof TypeError) {
    // Errores de red (Failed to fetch, etc.)
    if (error.message.includes("Failed to fetch")) {
      return "⚠️ Servicio no disponible. Por favor, intenta de nuevo más tarde.";
    }
    if (
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ENOTFOUND")
    ) {
      return "⚠️ No se pudo conectar con el servidor. Verifica tu conexión.";
    }
  }

  if (error instanceof Error) {
    // Errores HTTP
    // Si estamos en modo dev y el error contiene un body JSON, intentar extraerlo
    const showServerBody = (typeof window !== 'undefined') && localStorage.getItem('SHOW_SERVER_BODY') === '1';
    if (showServerBody && error.message.startsWith('HTTP ')) {
      const firstBrace = error.message.indexOf('{');
      if (firstBrace > 0) {
        const raw = error.message.substring(firstBrace);
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.message) {
            return `❌ Error en el servidor: ${parsed.message}`;
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    }

    if (error.message.includes("HTTP 404")) {
      return "❌ Producto no encontrado.";
    }
    if (error.message.includes("HTTP 400")) {
      return "❌ Solicitud inválida. Por favor, intenta de nuevo.";
    }
    if (error.message.includes("HTTP 401")) {
      return "🔐 Tu sesión ha expirado. Por favor, inicia sesión de nuevo.";
    }
    if (error.message.includes("HTTP 403")) {
      return "🔒 No tienes permiso para realizar esta acción.";
    }
    if (error.message.includes("HTTP 409")) {
      return "⚠️ Stock insuficiente. El producto se agotó.";
    }
    if (error.message.includes("HTTP 500")) {
      return "❌ Error en el servidor. Intenta de nuevo más tarde.";
    }
    if (error.message.includes("HTTP 503")) {
      return "⚠️ Servicio no disponible. Intenta de nuevo más tarde.";
    }
    
    // Otros errores
    return error.message;
  }

  return "❌ Error desconocido. Por favor, intenta de nuevo.";
}

/**
 * Wrapper para fetch que captura errores de red y los traduce
 */
export async function fetchConErrores(
  url: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("authToken");

  // Respetar headers que vengan desde quien llama
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const finalOptions: RequestInit = {
    ...options,
    headers,
  };

  const res = await fetch(url, finalOptions);

  // Aquí dejas tu manejo de errores tal como lo tenías
  if (!res.ok) {
    // ejemplo genérico, tú ya tienes algo más trabajado
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${text}`);
  }

  return res;
}

