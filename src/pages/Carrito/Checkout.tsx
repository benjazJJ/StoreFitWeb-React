// src/pages/Carrito/Checkout.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CarritoItem } from "../../types/Producto";
import type { Carrito as CarritoType } from "../../api/catalogApi";
import type { CompraItem, StockReservaItem } from "../../api/ordersApi";
import { obtenerCarrito, limpiarCarrito } from "../../api/catalogApi";
import { crearCompra, reservarStock } from "../../api/ordersApi";
import { formatearCLP } from "../../utils/formatoMoneda";
import { alertError, alertSuccess } from "../../utils/alerts";
import { useAuth } from "../../context/AuthContext";

type DatosEnvio = {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  direccion: string;
  comuna: string;
  region: string;
};

type MetodoPago = "tarjeta" | "transferencia" | "paypal";

export default function Checkout() {
  const navigate = useNavigate();
  const { sesion } = useAuth();

  const [carrito, setCarrito] = useState<CarritoType | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  const [metodoPago, setMetodoPago] = useState<MetodoPago>("tarjeta");

  const [datosEnvio, setDatosEnvio] = useState<DatosEnvio>({
    nombre: "",
    apellidos: "",
    correo: "",
    telefono: "",
    direccion: "",
    comuna: "",
    region: "",
  });

  // Prefill datos de envío desde la sesión
  useEffect(() => {
    if (!sesion) return;
    setDatosEnvio((prev) => ({
      ...prev,
      nombre: sesion.nombre || "",
      correo: sesion.correo || "",
    }));
  }, [sesion]);

  // Cargar carrito desde orders-service usando la sesión
  useEffect(() => {
    const cargarCarrito = async () => {
      try {
        setCargando(true);
        setError(null);

        if (!sesion) {
          setError("No autenticado");
          navigate("/InicioSesion", { state: { from: "/Checkout" } });
          return;
        }

        const data = await obtenerCarrito({
          rut: sesion.rut,
          rol: sesion.rolNombre || "CLIENTE",
        });

        setCarrito(data);

        if (!data || data.items.length === 0) {
          navigate("/Carrito");
          return;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar carrito"
        );
        console.error("Error:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarCarrito();
  }, [sesion, navigate]);

  const handleProcesarPago = async () => {
    if (!carrito || !carrito.items || carrito.items.length === 0) {
      await alertError("Carrito vacío");
      return;
    }

    // Validar datos básicos de envío
    if (
      !datosEnvio.nombre ||
      !datosEnvio.correo ||
      !datosEnvio.telefono ||
      !datosEnvio.direccion
    ) {
      await alertError(
        "Datos incompletos",
        "Completa al menos nombre, correo, teléfono y dirección."
      );
      return;
    }

    try {
      setProcesando(true);

      const userRut = sesion?.rut;
      const userRol = sesion?.rolNombre || "CLIENTE";

      if (!userRut) {
        await alertError(
          "Error",
          "No se encontró la sesión del usuario. Inicia sesión nuevamente."
        );
        navigate("/InicioSesion", { state: { from: "/Checkout" } });
        return;
      }

      // 1. Preparar items para reservar stock en catalog-service
      const stockItems: StockReservaItem[] = carrito.items
        .map((item) => {
          // productoId puede venir como "2/2001" (categoria/producto) o "2001"
          const parts = String(item.productoId).split("/");
          const idProductoStr = parts.length === 2 ? parts[1] : parts[0];
          const idProducto = Number(idProductoStr);

          return {
            idProducto: Number.isNaN(idProducto) ? 0 : idProducto,
            cantidad: item.cantidad,
          };
        })
        .filter((it) => it.idProducto > 0 && it.cantidad > 0);

      if (stockItems.length === 0) {
        await alertError(
          "Error",
          "No se pudo preparar la reserva de stock. Revisa el carrito."
        );
        return;
      }

      // 2. Reservar stock en catalog-service
      await reservarStock(stockItems);

      // 3. Crear compra en orders-service
      const compraItems: CompraItem[] = carrito.items.map((item) => ({
        id: item.productoId,
        nombre: item.nombre,
        cantidad: item.cantidad,
        talla: item.talla,
        precioUnitario: item.precio,
        subtotal: item.precio * item.cantidad,
        imagen: item.imagen,
      }));

      const compra = await crearCompra({
        rutUsuario: userRut,
        nombreUsuario: `${datosEnvio.nombre} ${datosEnvio.apellidos}`.trim(),
        correoUsuario: datosEnvio.correo,
        telefono: datosEnvio.telefono,
        direccion: datosEnvio.direccion,
        region: datosEnvio.region,
        comuna: datosEnvio.comuna,
        metodoPago,
        total: carrito.total,
        items: compraItems,
      });

      // 4. Limpiar carrito para este usuario
      await limpiarCarrito({ rut: userRut, rol: userRol });

      // 5. Mostrar éxito
      await alertSuccess(
        "¡Compra exitosa!",
        `Número de orden: ${compra.idCompra}`
      );

      // 6. Redirigir a detalle de compra / MisCompras
      navigate(`/MisCompras/${compra.idCompra}`);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error desconocido";
      await alertError("Error en el pago", errorMsg);
      console.error("Error:", err);
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <main className="container py-4">
        <div className="text-center text-muted py-5">
          <p>Cargando checkout...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-4">
        <div className="text-center text-danger py-5">
          <p className="mb-3">{error || "Carrito no disponible"}</p>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/Carrito")}
          >
            Volver al carrito
          </button>
        </div>
      </main>
    );
  }

  if (!carrito) {
    return (
      <main className="container py-4">
        <div className="text-center py-5">
          <p>No hay carrito para procesar.</p>
        </div>
      </main>
    );
  }

  const items = carrito.items || [];

  return (
    <main className="container py-4">
      <h2 className="mb-4">Checkout</h2>
      <div className="row">
        {/* Datos de envío */}
        <div className="col-md-7">
          <div className="card mb-4">
            <div className="card-header fw-bold">Datos de envío</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={datosEnvio.nombre}
                    onChange={(e) =>
                      setDatosEnvio({
                        ...datosEnvio,
                        nombre: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Apellidos</label>
                  <input
                    type="text"
                    className="form-control"
                    value={datosEnvio.apellidos}
                    onChange={(e) =>
                      setDatosEnvio({
                        ...datosEnvio,
                        apellidos: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Correo *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={datosEnvio.correo}
                    onChange={(e) =>
                      setDatosEnvio({
                        ...datosEnvio,
                        correo: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Teléfono *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={datosEnvio.telefono}
                    onChange={(e) =>
                      setDatosEnvio({
                        ...datosEnvio,
                        telefono: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">Dirección *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={datosEnvio.direccion}
                    onChange={(e) =>
                      setDatosEnvio({
                        ...datosEnvio,
                        direccion: e.target.value,
                      })
                    }
                    placeholder="Calle, número, depto."
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Región</label>
                  <input
                    type="text"
                    className="form-control"
                    value={datosEnvio.region}
                    onChange={(e) =>
                      setDatosEnvio({
                        ...datosEnvio,
                        region: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Comuna</label>
                  <input
                    type="text"
                    className="form-control"
                    value={datosEnvio.comuna}
                    onChange={(e) =>
                      setDatosEnvio({
                        ...datosEnvio,
                        comuna: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">Método de pago</label>
                  <select
                    className="form-select"
                    value={metodoPago}
                    onChange={(e) =>
                      setMetodoPago(e.target.value as MetodoPago)
                    }
                  >
                    <option value="tarjeta">Tarjeta (crédito / débito)</option>
                    <option value="transferencia">
                      Transferencia bancaria
                    </option>
                    <option value="paypal">PayPal (simulado)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="col-md-5">
          <div className="card mb-4">
            <div className="card-header fw-bold">Resumen de compra</div>
            <div className="card-body">
              {items.map((item) => (
                <div
                  key={`${item.productoId}-${item.talla}`}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <div>
                    <div className="fw-semibold">
                      {item.nombre} ({item.talla})
                    </div>
                    <small className="text-muted">
                      {item.cantidad} x {formatearCLP(item.precio)}
                    </small>
                  </div>
                  <div className="fw-bold">
                    {formatearCLP(item.precio * item.cantidad)}
                  </div>
                </div>
              ))}

              <hr />
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Total</span>
                <span className="fw-bold">
                  {formatearCLP(carrito.total)}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-success w-100"
                onClick={handleProcesarPago}
                disabled={procesando}
              >
                {procesando ? "Procesando pago..." : "Confirmar pago"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
