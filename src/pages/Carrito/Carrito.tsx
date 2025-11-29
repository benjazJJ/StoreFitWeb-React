import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Carrito as CarritoType, Talla, CarritoItem } from "../../types/Producto";
import {
  obtenerCarrito,
  actualizarItemCarrito,
  removerDelCarrito,
  limpiarCarrito,
  obtenerProductoPorId,
} from "../../api/catalogApi";
import { formatearCLP } from "../../utils/formatoMoneda";
import { alertSuccess, alertError } from "../../utils/alerts";
import { useAuth } from "../../context/AuthContext";

export default function Carrito() {
  const navigate = useNavigate();
  const { sesion } = useAuth();

  const [carrito, setCarrito] = useState<CarritoType | null>(null);
  const [itemsDetallados, setItemsDetallados] = useState<CarritoItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);

  // Helper para construir objeto usuario para las APIs
  const usuarioHeaders =
    sesion != null
      ? { rut: sesion.rut, rol: sesion.rolNombre }
      : undefined;

  // Cargar carrito cuando tengamos sesión
  useEffect(() => {
    const cargarCarrito = async () => {
      try {
        setCargando(true);
        setError(null);

        // Si no hay sesión, mostramos carrito vacío
        if (!sesion) {
          setCarrito(null);
          setItemsDetallados([]);
          setCargando(false);
          return;
        }

        const data = await obtenerCarrito(usuarioHeaders);
        setCarrito(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar carrito");
        console.error("Error:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarCarrito();
  }, [sesion]); // 👈 se recarga cuando la sesión esté lista

  // Enriquecer items con datos reales desde catalog-service
  useEffect(() => {
    const enriquecer = async () => {
      if (!carrito || !carrito.items || carrito.items.length === 0) {
        setItemsDetallados([]);
        return;
      }

      try {
        const enriquecidos = await Promise.all(
          carrito.items.map(async (item) => {
            try {
              const prod = await obtenerProductoPorId(item.productoId);

              const imagen =
                prod.imagenes?.find((img) => img.principal)?.url ??
                prod.imagenes?.[0]?.url ??
                "/img/placeholder.svg";

              let precio = prod.precio;
              if (prod.tallas && prod.tallas.length > 0) {
                const tallaInfo = prod.tallas.find((t) => t.talla === item.talla);
                if (tallaInfo) {
                  precio = tallaInfo.precio;
                }
              }

              return {
                ...item,
                nombre: prod.nombre,
                precio,
                imagen,
              } as CarritoItem;
            } catch (e) {
              console.warn("No se pudo enriquecer item de carrito:", e);
              return item;
            }
          })
        );

        setItemsDetallados(enriquecidos);
      } catch (e) {
        console.error("Error enriqueciendo carrito:", e);
        setItemsDetallados(carrito.items);
      }
    };

    enriquecer();
  }, [carrito]);

  const handleActualizarCantidad = async (
    productoId: string,
    talla: Talla,
    cantidad: number
  ) => {
    if (cantidad < 1) {
      handleRemover(productoId, talla);
      return;
    }

    try {
      setActualizando(true);
      const nuevoCarrito = await actualizarItemCarrito(
        productoId,
        cantidad,
        talla,
        usuarioHeaders
      );
      setCarrito(nuevoCarrito);
    } catch (err) {
      await alertError(
        "Error",
        err instanceof Error ? err.message : "No se pudo actualizar"
      );
      console.error("Error:", err);
    } finally {
      setActualizando(false);
    }
  };

  const handleRemover = async (productoId: string, talla: Talla) => {
    try {
      setActualizando(true);
      const nuevoCarrito = await removerDelCarrito(
        productoId,
        talla,
        usuarioHeaders
      );
      setCarrito(nuevoCarrito);
    } catch (err) {
      await alertError(
        "Error",
        err instanceof Error ? err.message : "No se pudo remover"
      );
      console.error("Error:", err);
    } finally {
      setActualizando(false);
    }
  };

  const handleVaciar = async () => {
    if (!window.confirm("¿Deseas vaciar el carrito?")) return;

    try {
      setActualizando(true);
      await limpiarCarrito(usuarioHeaders);
      setCarrito(null);
      setItemsDetallados([]);
      await alertSuccess("Carrito vaciado");
    } catch (err) {
      await alertError(
        "Error",
        err instanceof Error ? err.message : "No se pudo vaciar"
      );
      console.error("Error:", err);
    } finally {
      setActualizando(false);
    }
  };

  const handlePagar = async () => {
    if (!carrito || carrito.items.length === 0) {
      await alertError("Carrito vacío");
      return;
    }

    // Si no hay sesión en el contexto, mandamos al login
    if (!sesion) {
      await alertError(
        "Inicia sesión",
        "Debes iniciar sesión para continuar con el pago."
      );
      navigate("/InicioSesion", { state: { from: "/Checkout" } });
      return;
    }

    // Si hay sesión, vamos directo al checkout
    navigate("/Checkout");
  };

  if (cargando) {
    return (
      <main className="container py-4">
        <div className="text-center text-muted py-5">
          <p>Cargando carrito...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-4">
        <div className="text-center text-danger py-5">
          <p className="mb-3">{error}</p>
          <button
            className="btn btn-outline-secondary"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  const items = itemsDetallados.length ? itemsDetallados : carrito?.items ?? [];

  const subtotal = items.reduce(
    (s, item) => s + (item.precio || 0) * (item.cantidad || 0),
    0
  );

  return (
    <main className="container py-4 sf-cart">
      <header className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="m-0">Carrito</h1>
        {items.length > 0 && (
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleVaciar}
            disabled={actualizando}
          >
            Vaciar carrito
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p className="mb-3">Tu carrito está vacío.</p>
          <Link to="/productos" className="btn btn-primary">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <section className="col-12 col-lg-8">
            <div className="list-group">
              {items.map((item) => (
                <div
                  key={`${item.productoId}-${item.talla}`}
                  className="list-group-item d-flex flex-wrap gap-3 align-items-center"
                >
                  <img
                    src={item.imagen || "/img/placeholder.svg"}
                    alt={item.nombre}
                    width={72}
                    height={72}
                    className="rounded object-fit-cover flex-shrink-0"
                    onError={(e) =>
                      (e.currentTarget.src = "/img/placeholder.svg")
                    }
                  />

                  <div className="flex-grow-1">
                    <div className="fw-semibold">{item.nombre}</div>
                    <small className="text-muted">
                      {formatearCLP(item.precio)} · Talla {item.talla}
                    </small>
                  </div>

                  <div className="d-inline-flex align-items-center border rounded qty-control">
                    <button
                      className="btn btn-light"
                      onClick={() =>
                        handleActualizarCantidad(
                          item.productoId,
                          item.talla,
                          item.cantidad - 1
                        )
                      }
                      disabled={actualizando || item.cantidad <= 1}
                      aria-label="Disminuir"
                    >
                      −
                    </button>
                    <input
                      className="form-control text-center"
                      style={{
                        width: 70,
                        border: "none",
                        boxShadow: "none",
                      }}
                      value={item.cantidad}
                      onChange={(e) => {
                        const val = Math.max(
                          1,
                          parseInt(e.target.value) || 1
                        );
                        handleActualizarCantidad(
                          item.productoId,
                          item.talla,
                          val
                        );
                      }}
                      disabled={actualizando}
                      inputMode="numeric"
                    />
                    <button
                      className="btn btn-light"
                      onClick={() =>
                        handleActualizarCantidad(
                          item.productoId,
                          item.talla,
                          item.cantidad + 1
                        )
                      }
                      disabled={actualizando}
                      aria-label="Aumentar"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-end cart-actions">
                    <div className="fw-semibold">
                      {formatearCLP(item.precio * item.cantidad)}
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary mt-1"
                      onClick={() =>
                        handleRemover(item.productoId, item.talla)
                      }
                      disabled={actualizando}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="col-12 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Resumen</h5>

                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({items.length} artículos)</span>
                  <strong>{formatearCLP(subtotal)}</strong>
                </div>

                <hr className="my-3" />

                <button
                  className="btn btn-primary w-100 mb-2"
                  onClick={handlePagar}
                  disabled={actualizando || items.length === 0}
                >
                  Proceder al pago
                </button>

                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => navigate("/productos")}
                >
                  Seguir comprando
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
