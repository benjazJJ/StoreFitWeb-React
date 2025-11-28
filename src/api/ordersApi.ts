import { ORDERS_URL, CATALOG_URL } from "../config/api";
import { obtenerMensajeError, fetchConErrores } from "../utils/apiErrors";

/**
 * Types para el microservicio orders-service
 */

export type CompraItem = {
  id: string;
  nombre: string;
  cantidad: number;
  talla: string;
  precioUnitario: number;
  subtotal: number;
  imagen: string;
};

export type Compra = {
  idCompra: string;
  rutUsuario: string;
  nombreUsuario: string;
  correoUsuario: string;
  telefono: string;
  direccion: string;
  region: string;
  comuna: string;
  total: number;
  metodoPago: "tarjeta" | "transferencia" | "paypal";
  estadoCompra: "pendiente" | "procesando" | "confirmada" | "enviada" | "entregada" | "cancelada";
  items: CompraItem[];
  createdAt: string;
  updatedAt: string;
};

export type CompraResponse = {
  idCompra: string;
  rutUsuario: string;
  nombreUsuario: string;
  correoUsuario: string;
  telefono: string;
  direccion: string;
  region: string;
  comuna: string;
  total: number;
  metodoPago: "tarjeta" | "transferencia" | "paypal";
  estadoCompra: "pendiente" | "procesando" | "confirmada" | "enviada" | "entregada" | "cancelada";
  items: CompraItem[];
  createdAt: string;
  updatedAt: string;
};

export type StockReservaItem = {
  categoriaId: string;
  productoId: string;
  talla: string;
  cantidad: number;
};

// Helpers para transformar DTOs del backend (orders-service) a los tipos frontend
function transformarCompraDto(dto: any): Compra {
  const itemsRaw = dto?.detalles ?? dto?.items ?? dto?.detallesCompra ?? [];
  const items: CompraItem[] = Array.isArray(itemsRaw)
    ? itemsRaw.map((d: any) => {
        const id = String(d?.idProducto ?? d?.productoId ?? d?.id ?? d?.idDetalle ?? '');
        const nombre = d?.nombreProducto ?? d?.nombre ?? d?.productoNombre ?? '';
        const cantidad = Number(d?.cantidad ?? d?.qty ?? 0) || 0;
        const precioUnitario = Number(d?.precioUnitario ?? d?.precio ?? 0) || 0;
        const subtotal = Number(d?.subtotal ?? precioUnitario * cantidad) || precioUnitario * cantidad;
        const talla = d?.talla ?? '';
        const imagen = d?.imagen ?? d?.imageUrl ?? '';
        return { id, nombre, cantidad, talla, precioUnitario, subtotal, imagen } as CompraItem;
      })
    : [];

  // Según el model Java Compra y CompraDetalle:
  // Compra { Long idCompra; String rutUsuario; Long fechaMillis; List<CompraDetalle> detalles; }
  // CompraDetalle { Long idDetalle; Long idProducto; String nombreProducto; Integer cantidad; Integer precioUnitario; }
  return {
    idCompra: String(dto?.idCompra ?? dto?.id ?? null),
    rutUsuario: dto?.rutUsuario ?? dto?.usuario ?? "",
    nombreUsuario: dto?.nombreUsuario ?? dto?.nombre ?? "",
    correoUsuario: dto?.correoUsuario ?? dto?.correo ?? "",
    telefono: dto?.telefono ?? dto?.telefonoContacto ?? "",
    direccion: dto?.direccion ?? dto?.direccionEnvio ?? "",
    region: dto?.region ?? dto?.region ?? "",
    comuna: dto?.comuna ?? dto?.comuna ?? "",
    total: Number(dto?.total ?? dto?.monto ?? 0) || 0,
    metodoPago: dto?.metodoPago ?? dto?.paymentMethod ?? 'transferencia',
    estadoCompra: dto?.estadoCompra ?? dto?.estado ?? 'pendiente',
    items,
    createdAt: dto?.createdAt ?? dto?.fechaMillis ?? '',
    updatedAt: dto?.updatedAt ?? dto?.updatedAt ?? '',
  };
}

/**
 * Obtener todas las compras del usuario (solo ADMIN o el usuario mismo)
 */
export async function obtenerComprasPorRut(rut: string): Promise<Compra[]> {
  try {
    const token = localStorage.getItem("token");
    const res = await fetchConErrores(`${ORDERS_URL}/compras/usuario/${rut}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Rut": rut,
        "X-User-Rol": localStorage.getItem("userRole") || "CLIENTE",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${text}`);
    }

    const raw = await res.json().catch(() => []);
    const arr = Array.isArray(raw) ? raw : raw?.content ?? [];
    return Array.isArray(arr) ? arr.map(transformarCompraDto) : [];
  } catch (error) {
    throw new Error(obtenerMensajeError(error));
  }
}

/**
 * Obtener detalle de una compra específica
 */
export async function obtenerCompraPorId(id: string): Promise<Compra> {
  try {
    const token = localStorage.getItem("token");
    const userRut = localStorage.getItem("userRut") || "";
    
    const res = await fetchConErrores(`${ORDERS_URL}/compras/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Rut": userRut,
        "X-User-Rol": localStorage.getItem("userRole") || "CLIENTE",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${text}`);
    }

    const raw = await res.json().catch(() => ({}));
    return transformarCompraDto(raw);
  } catch (error) {
    throw new Error(obtenerMensajeError(error));
  }
}

/**
 * Obtener total gastado por RUT
 */
export async function obtenerTotalGastado(rut: string): Promise<number> {
  try {
    const token = localStorage.getItem("token");
    const res = await fetchConErrores(`${ORDERS_URL}/compras/usuario/${rut}/total`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Rut": rut,
        "X-User-Rol": localStorage.getItem("userRole") || "CLIENTE",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${text}`);
    }

    return res.json();
  } catch (error) {
    throw new Error(obtenerMensajeError(error));
  }
}

/**
 * Reservar stock en catalog-service
 */
export async function reservarStock(items: StockReservaItem[]): Promise<void> {
  try {
    const res = await fetchConErrores(`${CATALOG_URL}/productos/stock/reservar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "X-User-Rut": localStorage.getItem("userRut") || "",
        "X-User-Rol": localStorage.getItem("userRole") || "CLIENTE",
      },
      body: JSON.stringify(items),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${text}`);
    }
  } catch (error) {
    throw new Error(obtenerMensajeError(error));
  }
}

/**
 * Crear una compra en orders-service
 */
export async function crearCompra(compra: {
  rutUsuario: string;
  nombreUsuario: string;
  correoUsuario: string;
  telefono: string;
  direccion: string;
  region: string;
  comuna: string;
  metodoPago: "tarjeta" | "transferencia" | "paypal";
  total: number;
  items: CompraItem[];
}): Promise<Compra> {
  try {
    const token = localStorage.getItem("token");
    const userRut = localStorage.getItem("userRut") || "";

    const res = await fetchConErrores(`${ORDERS_URL}/compras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-User-Rut": userRut,
        "X-User-Rol": localStorage.getItem("userRole") || "CLIENTE",
      },
      body: JSON.stringify(compra),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${text}`);
    }

    const raw = await res.json().catch(() => ({}));
    return transformarCompraDto(raw);
  } catch (error) {
    throw new Error(obtenerMensajeError(error));
  }
}
