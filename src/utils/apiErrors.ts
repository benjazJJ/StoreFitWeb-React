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
  options?: RequestInit
): Promise<Response> {
  try {
    const res = await fetch(url, options);
    // Si el servidor respondió con error, leemos el body para diagnosticar en desarrollo
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      // Mostrar body en consola cuando estemos en entorno de desarrollo o se active manualmente
      const devMode = localStorage.getItem('SHOW_SERVER_BODY') === '1' || (typeof window !== 'undefined' && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1'));
      if (devMode) {
        // eslint-disable-next-line no-console
        console.error(`HTTP ${res.status} response body:`, text);
      }
      throw new Error(`HTTP ${res.status} ${text}`);
    }
    return res;
  } catch (error) {
    if (error instanceof TypeError) {
      // Lanzar con contexto adicional
      const mensaje = obtenerMensajeError(error);
      throw new Error(mensaje);
    }
    throw error;
  }
}
