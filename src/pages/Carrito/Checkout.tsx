import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CarritoItem } from "../../types/Producto";
import type { Carrito as CarritoType } from "../../api/catalogApi";
import type { CompraItem } from "../../api/ordersApi";
import {
  obtenerCarrito,
  limpiarCarrito,
} from "../../api/catalogApi";
import {
  crearCompra,
  reservarStock,
  type StockReservaItem,
} from "../../api/ordersApi";
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

type MetodoPago = "DEBITO" | "CREDITO" | "TRANSFERENCIA";

export default function Checkout() {
  const navigate = useNavigate();
  const { sesion } = useAuth();

  const [carrito, setCarrito] = useState<CarritoType | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  const [datosEnvio, setDatosEnvio] = useState<DatosEnvio>({
    nombre: "",
    apellidos: "",
    correo: "",
    telefono: "",
    direccion: "",
    comuna: "",
    region: "",
  });

  const [metodoPago, setMetodoPago] =
    useState<MetodoPago>("DEBITO");

  // 🔹 Prefill datos desde la sesión (nombre y correo)
  useEffect(() => {
    if (!sesion) return;

    setDatosEnvio((prev) => ({
      ...prev,
      nombre: sesion.nombre || "",
      correo: sesion.correo || "",
    }));
  }, [sesion]);

  // 🔹 Cargar carrito (y validar sesión)
  useEffect(() => {
    const cargarCarrito = async () => {
      try {
        setCargando(true);
        setError(null);

        if (!sesion) {
          setError("No autenticado");
          navigate("/InicioSesion", {
            state: { from: "/Checkout" },
          });
          return;
        }

        const data = await obtenerCarrito();
        setCarrito(data);

        if (!data || data.items.length === 0) {
          navigate("/Carrito");
          return;
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar carrito"
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

    // Validar datos de envío básicos
    if (
      !datosEnvio.nombre ||
      !datosEnvio.correo ||
      !datosEnvio.telefono ||
      !datosEnvio.direccion
    ) {
      await alertError(
        "Campos requeridos",
        "Por favor completa todos los datos de envío"
      );
      return;
    }

    try {
      setProcesando(true);

      const userRut = sesion?.rut;
      if (!userRut) {
        await alertError(
          "Error",
          "No se encontró la sesión del usuario. Inicia sesión nuevamente."
        );
        navigate("/InicioSesion", {
          state: { from: "/Checkout" },
        });
        return;
      }

      // 1. Reservar stock en catalog-service
      const stockItems: StockReservaItem[] = carrito.items.map(
        (item: CarritoItem) => ({
          productoId: item.productoId,
          talla: item.talla,
          cantidad: item.cantidad,
        })
      );

      await reservarStock(stockItems);

      // 2. Crear compra en orders-service
      const compraItems: CompraItem[] = carrito.items.map(
        (item) => ({
          id: item.productoId,
          nombre: item.nombre,
          cantidad: item.cantidad,
          talla: item.talla,
          precioUnitario: item.precio,
          subtotal: item.precio * item.cantidad,
          imagen: item.imagen,
        })
      );

      const compra = await crearCompra({
        rutUsuario: userRut,
        nombreUsuario: `${datosEnvio.nombre} ${datosEnvio.apellidos}`.trim(),
        correoUsuario: datosEnvio.correo,
        telefono: datosEnvio.telefono,
        direccion: datosEnvio.direccion,
        region: datosEnvio.region,
        comuna: datosEnvio.comuna,
        metodoPago: metodoPago,
        total: carrito.total,
        items: compraItems,
      });

      // 3. Limpiar carrito
      await limpiarCarrito();

      await alertSuccess(
        "Compra realizada",
        `Tu compra #${compra.id} fue creada correctamente`
      );
      navigate("/MisCompras");
    } catch (err) {
      console.error("Error al procesar pago:", err);
      await alertError(
        "Error",
        "No se pudo procesar tu compra. Intenta nuevamente."
      );
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="container py-5">
        <h3>Cargando checkout...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <h3>Error en checkout</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!carrito) {
    return (
      <div className="container py-5">
        <h3>No hay carrito para procesar</h3>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Checkout</h2>
      <div className="row">
        {/* Datos de envío */}
        <div className="col-md-7">
          <div className="card mb-4">
            <div className="card-header fw-bold">
              Datos de envío
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    Nombre *
                  </label>
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
                    placeholder="Nombre"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    Apellidos
                  </label>
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
                    placeholder="Apellidos"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    Correo *
                  </label>
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
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    Teléfono *
                  </label>
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
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">
                    Dirección *
                  </label>
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
                  <label className="form-label fw-bold">
                    Región
                  </label>
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
                    placeholder="Región"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    Comuna
                  </label>
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
                    placeholder="Comuna"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">
                    Método de pago
                  </label>
                  <select
                    className="form-select"
                    value={metodoPago}
                    onChange={(e) =>
                      setMetodoPago(e.target.value as MetodoPago)
                    }
                  >
                    <option value="DEBITO">Tarjeta de débito</option>
                    <option value="CREDITO">
                      Tarjeta de crédito
                    </option>
                    <option value="TRANSFERENCIA">
                      Transferencia bancaria
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="col-md-5">
          <div className="card mb-4">
            <div className="card-header fw-bold">
              Resumen de compra
            </div>
            <div className="card-body">
              {carrito.items.map((item) => (
                <div
                  key={`${item.productoId}-${item.talla}`}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <div>
                    <div className="fw-semibold">
                      {item.nombre} ({item.talla})
                    </div>
                    <small className="text-muted">
                      {item.cantidad} x{" "}
                      {formatearCLP(item.precio)}
                    </small>
                  </div>
                  <div className="fw-bold">
                    {formatearCLP(
                      item.precio * item.cantidad
                    )}
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
                {procesando
                  ? "Procesando pago..."
                  : "Confirmar pago"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
