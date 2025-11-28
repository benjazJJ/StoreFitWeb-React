import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Producto, Talla } from "../../types/Producto";
import { obtenerProductoPorId, agregarAlCarrito } from "../../api/catalogApi";
import { formatearCLP } from "../../utils/formatoMoneda";
import { alertSuccess, alertError } from "../../utils/alerts";

export default function ProductoDetalle() {
    const { id, categoria } = useParams<{ id: string; categoria?: string }>();
    const navigate = useNavigate();

    const [producto, setProducto] = useState<Producto | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cantidad, setCantidad] = useState(1);
    const [tallaSeleccionada, setTallaSeleccionada] = useState<Talla | null>(null);
    const [agregando, setAgregando] = useState(false);

    // 1) Cargar producto
    useEffect(() => {
        const cargarProducto = async () => {
            if (!id) {
                setError("ID de producto inválido");
                setCargando(false);
                return;
            }
            try {
                setCargando(true);
                setError(null);
                const lookupId = categoria ? `${categoria}/${id}` : id;
                const prod = await obtenerProductoPorId(lookupId);
                setProducto(prod);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Error al cargar el producto"
                );
                console.error("Error:", err);
            } finally {
                setCargando(false);
            }
        };

        cargarProducto();
    }, [id, categoria]);

    // 2) Seleccionar automáticamente una talla válida
    useEffect(() => {
        if (!producto || !producto.tallas || producto.tallas.length === 0) return;

        setTallaSeleccionada((prev) => {
            if (prev && producto.tallas.some((t) => t.talla === prev && t.stock > 0)) {
                return prev;
            }

            const conStock = producto.tallas.find((t) => t.stock > 0);
            if (conStock) return conStock.talla;

            return producto.tallas[0].talla;
        });
    }, [producto]);

    // --------- returns condicionales después de los hooks ---------

    if (cargando) {
        return (
            <main className="container py-4">
                <div className="text-center text-muted py-5">
                    <p>Cargando producto...</p>
                </div>
            </main>
        );
    }

    if (error || !producto) {
        return (
            <main className="container py-4">
                <div className="text-center text-danger py-5">
                    <p className="mb-3">{error || "Producto no encontrado"}</p>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate(-1)}
                    >
                        Volver
                    </button>
                </div>
            </main>
        );
    }

    // Imagen principal
    const imagenPrincipal =
        producto.imagenes?.find((img) => img.principal)?.url ??
        producto.imagenes?.[0]?.url ??
        "/img/placeholder.svg";

    // Stock para talla seleccionada
    const stockTallaActual =
        producto.tallas?.find((t) => t.talla === tallaSeleccionada)?.stock ?? 0;

    const handleAgregarCarrito = async () => {
        if (!tallaSeleccionada) {
            await alertError("Selecciona una talla");
            return;
        }

        if (stockTallaActual <= 0) {
            await alertError("Sin stock en esta talla");
            return;
        }

        try {
            setAgregando(true);
            const productoIdToSend =
                producto.variantes &&
                    producto.variantes.length > 0 &&
                    producto.variantes[0].idCategoria
                    ? `${producto.variantes[0].idCategoria}/${producto.id}`
                    : producto.id;

            await agregarAlCarrito(productoIdToSend, cantidad, tallaSeleccionada);
            await alertSuccess(
                "Éxito",
                `${producto.nombre} x${cantidad} agregado al carrito`
            );
            setCantidad(1);
        } catch (err) {
            await alertError(
                "Error",
                err instanceof Error ? err.message : "No se pudo agregar al carrito"
            );
            console.error("Error:", err);
        } finally {
            setAgregando(false);
        }
    };

    return (
        <main className="container py-4">
            <div className="row g-4">
                {/* Galería */}
                <div className="col-md-6">
                    <div className="ratio ratio-1x1 bg-light rounded shadow-sm overflow-hidden">
                        <img
                            src={imagenPrincipal}
                            alt={producto.nombre}
                            className="object-fit-cover"
                            onError={(e) => (e.currentTarget.src = "/img/placeholder.svg")}
                        />
                    </div>

                    {producto.imagenes && producto.imagenes.length > 1 && (
                        <div className="d-flex gap-2 mt-3">
                            {producto.imagenes.map((img) => (
                                <img
                                    key={img.id}
                                    src={img.url}
                                    alt="Miniatura"
                                    className="rounded"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        objectFit: "cover",
                                        cursor: "pointer",
                                        border:
                                            imagenPrincipal === img.url
                                                ? "2px solid var(--sf-primary)"
                                                : "none",
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Detalles */}
                <div className="col-md-6">
                    <h1 className="mb-2">{producto.nombre}</h1>
                    <div className="text-muted mb-3">{producto.categoria}</div>

                    <div className="mb-4">
                        <h2 className="text-primary mb-0">
                            {formatearCLP(producto.precio)}
                        </h2>
                        {producto.tallas?.some((t) => t.precio !== producto.precio) && (
                            <small className="text-muted">
                                Precios pueden variar por talla
                            </small>
                        )}
                    </div>

                    {producto.descripcion && (
                        <p className="text-muted mb-4">{producto.descripcion}</p>
                    )}

                    {/* Selección de talla */}
                    {producto.tallas && producto.tallas.length > 0 && (
                        <div className="mb-4">
                            <label className="form-label fw-bold">Talla</label>

                            {/* debug visual: cuál está seleccionada */}
                            <div className="mb-1">
                                <small className="text-muted">
                                    Talla seleccionada:{" "}
                                    <strong>{tallaSeleccionada ?? "(ninguna)"}</strong>
                                </small>
                            </div>

                            <div className="d-flex flex-wrap gap-2">
                                {producto.tallas.map((t) => (
                                    <button
                                        key={t.talla}
                                        type="button"
                                        className={`btn ${tallaSeleccionada === t.talla
                                                ? "btn-primary"
                                                : "btn-outline-secondary"
                                            } ${t.stock <= 0 ? "disabled" : ""}`}
                                        onClick={() => setTallaSeleccionada(t.talla)}
                                        disabled={t.stock <= 0}
                                        title={t.stock <= 0 ? "Sin stock" : `Stock: ${t.stock}`}
                                    >
                                        {t.talla}
                                    </button>
                                ))}
                            </div>

                            {tallaSeleccionada && (
                                <div className="mt-2">
                                    {stockTallaActual <= 2 && stockTallaActual > 0 ? (
                                        <small className="text-warning">
                                            ⚠️ Pocas unidades: {stockTallaActual} restantes
                                        </small>
                                    ) : stockTallaActual <= 0 ? (
                                        <small className="text-danger">
                                            ❌ Sin stock en esta talla
                                        </small>
                                    ) : (
                                        <small className="text-muted">
                                            ✓ Stock disponible: {stockTallaActual}
                                        </small>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cantidad */}
                    <div className="mb-4">
                        <label className="form-label fw-bold">Cantidad</label>
                        <div className="input-group" style={{ maxWidth: 150 }}>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                disabled={cantidad <= 1}
                            >
                                −
                            </button>
                            <input
                                type="number"
                                className="form-control text-center"
                                value={cantidad}
                                onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                    setCantidad(Math.min(val, stockTallaActual || 99));
                                }}
                                min="1"
                                max={stockTallaActual}
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                    setCantidad(
                                        Math.min(stockTallaActual || 99, cantidad + 1)
                                    )
                                }
                                disabled={cantidad >= (stockTallaActual || 99)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="d-flex gap-2 mb-4">
                        <button
                            className="btn btn-primary btn-lg flex-grow-1"
                            onClick={handleAgregarCarrito}
                            disabled={
                                agregando || !tallaSeleccionada || stockTallaActual <= 0
                            }
                        >
                            {agregando ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    Agregando...
                                </>
                            ) : (
                                "Agregar al carrito"
                            )}
                        </button>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigate(-1)}
                        >
                            Volver
                        </button>
                    </div>

                    <div className="border-top pt-4">
                        <small className="text-muted d-block mb-2">
                            ✓ Envíos a todo Chile
                        </small>
                        <small className="text-muted d-block mb-2">
                            ✓ Cambios y devoluciones
                        </small>
                        <small className="text-muted d-block">
                            ✓ Garantía de calidad
                        </small>
                    </div>
                </div>
            </div>
        </main>
    );
}
