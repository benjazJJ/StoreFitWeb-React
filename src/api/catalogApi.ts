import { CATALOG_URL, ORDERS_URL } from "../config/api";
import { obtenerMensajeError, fetchConErrores } from "../utils/apiErrors";

/**
 * Types para el microservicio catalog-service
 */

export type Talla = "XS" | "S" | "M" | "L" | "XL";

export type ProductoImagen = {
    id: string;
    url: string;
    principal: boolean;
    orden: number;
};

export type ProductoTalla = {
    talla: Talla;
    stock: number;
    precio: number; // Permitir precio diferente por talla
};

export type Producto = {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    imagenes: ProductoImagen[];
    tallas: ProductoTalla[];
    variantes?: any[]; // variantes con color/talla/stock para detalle
    activo: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ProductoListaResponse = {
    content: Producto[];
    items?: Producto[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
};

export type CarritoItem = {
    productoId: string;
    nombre: string;
    precio: number;
    cantidad: number;
    talla: Talla;
    imagen: string;
};

export type Carrito = {
    id: string;
    usuarioId: string;
    items: CarritoItem[];
    total: number;
    createdAt: string;
    updatedAt: string;
};

// ===== Helpers de transformación =====

function transformarProductoDto(dto: any): Producto {
    const idProducto = dto?.id?.idProducto ?? dto?.idProducto ?? dto?.id ?? null;
    const id = idProducto != null ? String(idProducto) : String(dto?.id ?? "");

    const nombre =
        `${dto?.marca ?? ""} ${dto?.modelo ?? ""}`.trim() ||
        dto?.nombre ||
        dto?.modelo ||
        "Producto";

    const descripcion = dto?.color ?? dto?.descripcion ?? "";
    const precio = Number(dto?.precio ?? dto?.precioUnitario ?? 0) || 0;
    const categoria = dto?.id?.idCategoria
        ? String(dto.id.idCategoria)
        : String(dto?.categoria ?? "");

    const imagenes: ProductoImagen[] = [];
    if (dto?.imageUrl) {
        imagenes.push({
            id: "1",
            url: dto.imageUrl,
            principal: true,
            orden: 0,
        });
    }

    const tallas: ProductoTalla[] = [];

    // stock base razonable (si viene 0 o null, usamos 10)
    const stockBaseRaw = Number(dto?.stock ?? 10);
    const stockBase =
        Number.isNaN(stockBaseRaw) || stockBaseRaw <= 0 ? 10 : stockBaseRaw;

    // Caso típico: un registro = una talla
    if (dto?.talla) {
        const tallaStr = String(dto.talla).toUpperCase();
        tallas.push({
            talla: tallaStr as Talla,
            stock: stockBase,
            precio,
        });
    }

    // Por si algún día vienen tallas en un array
    if (Array.isArray(dto?.tallas)) {
        dto.tallas.forEach((t: any) => {
            const tallaStr = String(t.talla).toUpperCase();
            const stockRaw = Number(t.stock ?? stockBase);
            const stock =
                Number.isNaN(stockRaw) || stockRaw <= 0 ? stockBase : stockRaw;
            const precioTalla = Number(t.precio ?? precio) || precio;

            tallas.push({
                talla: tallaStr as Talla,
                stock,
                precio: precioTalla,
            });
        });
    }

    // SEGURO: si el backend no mandó tallas, inventamos una "M" con stock
    if (tallas.length === 0) {
        tallas.push({
            talla: "M",
            stock: stockBase,
            precio,
        });
    }

    return {
        id,
        nombre,
        descripcion,
        precio,
        categoria,
        imagenes,
        tallas,
        activo: dto?.activo ?? true,
        createdAt: dto?.createdAt ?? dto?.fechaCreacion ?? "",
        updatedAt: dto?.updatedAt ?? dto?.fechaActualizacion ?? "",
    };
}

// Helper: headers por defecto para catalog-service (usa localStorage)
function defaultHeaders(contentTypeJson: boolean = false): Record<string, string> {
    const token = localStorage.getItem("token");
    const userRut = localStorage.getItem("userRut") || "anonymous";
    const userRole = localStorage.getItem("userRole") || "CLIENTE";
    const headers: Record<string, string> = {
        "X-User-Rut": userRut,
        "X-User-Rol": userRole,
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (contentTypeJson) headers["Content-Type"] = "application/json";
    return headers;
}


type UsuarioHeaders = { rut: string; rol: string };

function buildUserHeaders(
    usuario?: UsuarioHeaders,
    contentTypeJson: boolean = false
): Record<string, string> {
    const rut = usuario?.rut || localStorage.getItem("userRut") || "";
    const rol = usuario?.rol || localStorage.getItem("userRole") || "CLIENTE";
    const token = localStorage.getItem("token") || "";

    const headers: Record<string, string> = {
        "X-User-Rut": rut,
        "X-User-Rol": rol,
    };
    if (contentTypeJson) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
}

function transformarListaProductosDto(raw: any): ProductoListaResponse {
    // El backend puede retornar content o una lista directa
    const content = raw?.content ?? raw ?? [];
    const items = Array.isArray(content) ? content.map(transformarProductoDto) : [];

    // Agrupar por marca+modelo para mostrar una sola tarjeta por modelo
    const groups: Record<string, Producto[]> = {};
    for (const p of items) {
        const key = `${p.nombre}`; // nombre ya construido como 'marca modelo'
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
    }

    const DESCRIPCIONES: Record<string, string> = {
        "StoreFit XFITRX":
            "Polera deportiva de alto rendimiento, ideal para entrenamiento funcional y running.",
        "StoreFit WARMGLIDE":
            "Polerón térmico para días fríos, comodidad y estilo en cualquier ocasión.",
        "StoreFit FLEXRUN":
            "Buzo flexible y ligero, perfecto para actividades al aire libre y fitness.",
        "StoreFit FITQUEEN":
            "Conjunto femenino diseñado para máxima comodidad y elegancia deportiva.",
    };

    const grouped: Producto[] = Object.values(groups).map((group) => {
        const first = group[0];
        let principalImg = group.find(
            (g) => g.imagenes && g.imagenes[0]?.url
        )?.imagenes[0]?.url;
        if (!principalImg) principalImg = "/img/placeholder.svg";
        const precio = Math.min(...group.map((g) => g.precio || Number.MAX_SAFE_INTEGER));
        const descripcion =
            DESCRIPCIONES[first.nombre] || "Producto deportivo StoreFit.";
        return {
            ...first,
            imagenes: [{ id: "0", url: principalImg, principal: true, orden: 0 }],
            precio: precio === Number.MAX_SAFE_INTEGER ? first.precio : precio,
            descripcion,
            tallas: [],
        } as Producto;
    });

    return {
        content: grouped,
        totalElements: grouped.length,
        totalPages: 1,
        currentPage: 0,
        pageSize: grouped.length,
    };
}

function transformarCarritoDto(dto: any): Carrito {
    const itemsRaw = dto?.items ?? dto?.detalles ?? dto?.lineItems ?? [];

    const items: CarritoItem[] = Array.isArray(itemsRaw)
        ? itemsRaw.map((it: any) => {
            const producto =
                it.producto ??
                it.productoDTO ??
                it.productoDto ??
                it.productoData ??
                it;

            const idCategoria =
                it.idCategoria ??
                producto?.idCategoria ??
                producto?.id?.idCategoria;
            const idProducto =
                it.idProducto ??
                producto?.idProducto ??
                producto?.id?.idProducto ??
                it.productoId ??
                producto?.id;

            const productoId =
                idCategoria != null && idProducto != null
                    ? `${idCategoria}/${idProducto}`
                    : String(idProducto ?? it.productoId ?? "");

            const nombreBaseRaw = `${producto?.marca ?? ""} ${producto?.modelo ?? ""
                }`.trim();
            const nombreBase = nombreBaseRaw || `Producto ${productoId}`;

            const nombre =
                it.nombreProducto ??
                it.nombre ??
                producto?.nombre ??
                nombreBase;

            const precioUnit =
                Number(
                    it.precioUnitario ??
                    it.precio ??
                    it.montoUnitario ??
                    producto?.precio ??
                    producto?.precioUnitario ??
                    0
                ) || 0;

            const cantidad = Number(it.cantidad ?? it.qty ?? 1) || 1;

            const talla = (it.talla ?? producto?.talla ?? "M") as Talla;

            const imagen =
                it.imageUrl ??
                it.imagen ??
                producto?.imageUrl ??
                (Array.isArray(producto?.imagenes) && producto.imagenes[0]?.url) ??
                "/img/placeholder.svg";

            return {
                productoId,
                nombre,
                precio: precioUnit,
                cantidad,
                talla,
                imagen,
            } as CarritoItem;
        })
        : [];

    const total =
        Number(dto?.total ?? dto?.montoTotal) ||
        items.reduce((s, i) => s + i.precio * i.cantidad, 0);

    return {
        id: String(dto?.id ?? dto?.carritoId ?? dto?.idCarrito ?? ""),
        usuarioId: String(
            dto?.usuarioId ?? dto?.userId ?? dto?.rutUsuario ?? ""
        ),
        items,
        total,
        createdAt:
            dto?.createdAt ??
            dto?.createdAtMillis ??
            dto?.fechaCreacion ??
            "",
        updatedAt:
            dto?.updatedAt ??
            dto?.updatedAtMillis ??
            dto?.fechaActualizacion ??
            "",
    };
}

// ================== PRODUCTOS ==================

export async function obtenerProductos(
    page: number = 0,
    size: number = 12,
    categoria?: string,
    busqueda?: string
): Promise<ProductoListaResponse> {
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());

        if (categoria) {
            params.append("categoria", categoria);
        }
        if (busqueda) {
            params.append("busqueda", busqueda);
        }

        const res = await fetchConErrores(
            `${CATALOG_URL}/productos?${params.toString()}`,
            {
                headers: defaultHeaders(),
            }
        );

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status} ${text}`);
        }

        const raw = await res.json().catch(() => null);
        return transformarListaProductosDto(raw);
    } catch (error) {
        throw new Error(obtenerMensajeError(error));
    }
}

export async function obtenerProductoPorId(id: string): Promise<Producto> {
    try {
        const res = await fetchConErrores(`${CATALOG_URL}/productos/${id}`, {
            headers: defaultHeaders(),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status} ${text}`);
        }

        const raw = await res.json().catch(() => null);
        const producto = transformarProductoDto(raw);

        try {
            const allRes = await fetchConErrores(
                `${CATALOG_URL}/productos?size=1000`,
                { headers: defaultHeaders() }
            );
            const allRaw = await allRes.json().catch(() => []);
            const all = Array.isArray(allRaw) ? allRaw : allRaw?.content ?? [];
            const variantes = (all as any[])
                .filter((v: any) => {
                    const vNombre = `${v?.marca ?? ""} ${v?.modelo ?? ""}`.trim();
                    return vNombre === producto.nombre;
                })
                .map((v: any) => ({
                    idCategoria: v?.id?.idCategoria ?? v?.idCategoria ?? null,
                    idProducto: v?.id?.idProducto ?? v?.idProducto ?? v?.id ?? null,
                    color: v?.color ?? v?.descripcion ?? "",
                    talla: v?.talla ?? "",
                    stock: Number(v?.stock ?? 0),
                    precio:
                        Number(v?.precio ?? v?.precioUnitario ?? (producto.precio ?? 0)) ||
                        producto.precio ||
                        0,
                    imageUrl:
                        v?.imageUrl ??
                        (Array.isArray(v?.imagenes) && v.imagenes[0]?.url) ??
                        "/img/placeholder.svg",
                }));
            producto.variantes = variantes;

            try {
                const tallaOrder: Talla[] = ["XS", "S", "M", "L", "XL"];
                const map: Record<
                    string,
                    { talla: Talla; stock: number; precio: number }
                > = {};

                for (const v of variantes) {
                    const t = String(v.talla || "").toUpperCase();
                    if (!t) continue;
                    const tallaKey = t as Talla;

                    const stockRaw = Number(v.stock ?? 1);
                    const stockVar =
                        Number.isNaN(stockRaw) || stockRaw <= 0 ? 1 : stockRaw;
                    const precioVar =
                        Number(v.precio ?? producto.precio ?? 0) || producto.precio;

                    if (!map[tallaKey]) {
                        map[tallaKey] = {
                            talla: tallaKey,
                            stock: stockVar,
                            precio: precioVar,
                        };
                    } else {
                        map[tallaKey].stock = (map[tallaKey].stock || 0) + stockVar;
                        map[tallaKey].precio = Math.min(map[tallaKey].precio, precioVar);
                    }
                }

                const tallasArr = Object.values(map)
                    .sort(
                        (a, b) => tallaOrder.indexOf(a.talla) - tallaOrder.indexOf(b.talla)
                    )
                    .map((x) => ({
                        talla: x.talla as Talla,
                        stock: x.stock > 0 ? x.stock : 1,
                        precio: x.precio || producto.precio || 0,
                    }));

                producto.tallas = tallasArr.length > 0 ? tallasArr : producto.tallas;
            } catch {
                // ignorar error de tallas
            }
        } catch {
            producto.variantes = [];
        }

        return producto;
    } catch (error) {
        throw new Error(obtenerMensajeError(error));
    }
}

export async function obtenerCategorias(): Promise<string[]> {
    try {
        const res = await fetchConErrores(`${CATALOG_URL}/categorias`, {
            headers: defaultHeaders(),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status} ${text}`);
        }

        const raw = await res.json().catch(() => []);
        if (Array.isArray(raw))
            return raw.map((r) =>
                typeof r === "string"
                    ? r
                    : r.nombreCategoria ?? r.nombre ?? String(r)
            );
        if (raw?.content && Array.isArray(raw.content))
            return raw.content.map((r: any) =>
                typeof r === "string"
                    ? r
                    : r.nombreCategoria ?? r.nombre ?? String(r)
            );
        return [];
    } catch (error) {
        throw new Error(obtenerMensajeError(error));
    }
}

export async function obtenerStockProducto(
    productoId: string
): Promise<Record<string, number>> {
    try {
        const res = await fetchConErrores(
            `${CATALOG_URL}/productos/${productoId}/stock`,
            {
                headers: defaultHeaders(),
            }
        );

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status} ${text}`);
        }

        const raw = await res.json().catch(() => null);
        if (raw == null) return { XS: 0, S: 0, M: 0, L: 0, XL: 0 };
        if (typeof raw === "number") {
            return { XS: raw, S: raw, M: raw, L: raw, XL: raw };
        }
        if (Array.isArray(raw)) {
            const map: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0 };
            raw.forEach((r: any) => {
                if (r.talla) map[String(r.talla)] = Number(r.stock ?? r.cantidad ?? 0);
            });
            return map;
        }
        const posible: Record<string, any> = raw as any;
        const map: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0 };
        for (const k of Object.keys(posible)) {
            map[k] = Number(posible[k] ?? 0);
        }
        return map;
    } catch (error) {
        throw new Error(obtenerMensajeError(error));
    }
}

// ================== CARRITO (orders-service) ==================

/**
 * Obtener el carrito del usuario actual (o del usuario pasado por parámetro)
 */
export async function obtenerCarrito(
    usuario?: UsuarioHeaders
): Promise<Carrito> {
    try {
        const headers = buildUserHeaders(usuario);

        const res = await fetchConErrores(`${ORDERS_URL}/carrito`, {
            headers,
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status} ${text}`);
        }

        const raw = await res.json().catch(() => ({}));
        return transformarCarritoDto(raw);
    } catch (error) {
        throw new Error(obtenerMensajeError(error));
    }
}

/**
 * Agregar un producto al carrito
 */
export async function agregarAlCarrito(
    productoId: string,
    cantidad: number,
    talla: Talla,
    extra?: { nombre?: string; precio?: number },
    usuario?: UsuarioHeaders
) {
    try {
        const rut =
            usuario?.rut || localStorage.getItem("userRut") || "";

        if (!rut) {
            throw new Error("No se encontró la sesión del usuario (rut vacío).");
        }

        const headers = buildUserHeaders(usuario, true);

        const body = {
            productoId,
            cantidad,
            talla,
            nombre: extra?.nombre,
            precio: extra?.precio,
        };

        const res = await fetchConErrores(`${ORDERS_URL}/carrito/items`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status} ${text}`);
        }

        return res.json(); // carrito actualizado
    } catch (error) {
        throw new Error(obtenerMensajeError(error));
    }
}

/**
 * Actualizar cantidad de un item en el carrito
 */
export async function actualizarItemCarrito(
    productoId: string,
    cantidad: number,
    talla: Talla,
    usuario?: UsuarioHeaders
): Promise<Carrito> {
    try {
        const url = `${ORDERS_URL}/carrito/items?productoId=${encodeURIComponent(
            productoId
        )}`;

        const headers = buildUserHeaders(usuario, true);

        const res = await fetchConErrores(url, {
            method: "PUT",
            headers,
            body: JSON.stringify({
                cantidad,
                talla,
            }),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status} ${text}`);
        }

        const raw = await res.json().catch(() => ({}));
        return transformarCarritoDto(raw);
    } catch (error) {
        throw new Error(obtenerMensajeError(error));
    }
}

/**
 * Remover un item del carrito
 */
export async function removerDelCarrito(
    productoId: string,
    talla: Talla,
    usuario?: UsuarioHeaders
): Promise<Carrito> {
    try {
        const url = `${ORDERS_URL}/carrito/items?productoId=${encodeURIComponent(
            productoId
        )}&talla=${encodeURIComponent(talla)}`;

        const headers = buildUserHeaders(usuario);

        const res = await fetchConErrores(url, {
            method: "DELETE",
            headers,
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status} ${text}`);
        }

        const raw = await res.json().catch(() => ({}));
        return transformarCarritoDto(raw);
    } catch (error) {
        throw new Error(obtenerMensajeError(error));
    }
}

/**
 * Limpiar el carrito completo
 */
export async function limpiarCarrito(
    usuario?: UsuarioHeaders
): Promise<void> {
    try {
        const headers = buildUserHeaders(usuario);

        const res = await fetchConErrores(`${ORDERS_URL}/carrito`, {
            method: "DELETE",
            headers,
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
 * Procesar pago del carrito
 */
export async function procesarPago(
    carritoId: string,
    metodoPago: "tarjeta" | "transferencia" | "paypal"
): Promise<{ exito: boolean; numeroOrden?: string; error?: string }> {
    try {
        const res = await fetchConErrores(
            `${ORDERS_URL}/carrito/${carritoId}/pagar`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    metodoPago,
                }),
            }
        );

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status} ${text}`);
        }

        return res.json();
    } catch (error) {
        throw new Error(obtenerMensajeError(error));
    }
}
