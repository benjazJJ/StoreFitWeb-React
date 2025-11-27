import { useMemo, useState } from "react";
import { alertSuccess, alertError } from "../../utils/alerts";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Registro.css";
import { REGIONES } from "../../data/Regiones";
import {
    validarRut,
    validarNombre,
    validarCorreo,
    validarTelefono,
    validarPassword,
    formatearRut,
    longitudMaxima,
} from "../../utils/validaciones";
import { useAuth, type RegistroForm } from "../../context/AuthContext";

const inicial: RegistroForm = {
    rut: "",
    nombre: "",
    apellidos: "",
    correo: "",
    numeroTelefono: "",
    fechaNacimiento: "",
    regionId: "",
    comunaId: "",
    direccion: "",
    password: "",
};

export default function Registro() {
    const { registrarUsuario } = useAuth(); // Acción de registro desde contexto (useState)
    const [form, setForm] = useState<RegistroForm>(inicial);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [enviando, setEnviando] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();

    const comunasFiltradas = useMemo(
        () => REGIONES.find((r) => r.slug === form.regionId)?.comunas || [],
        [form.regionId]
    );

    function set<K extends keyof RegistroForm>(clave: K, valor: RegistroForm[K]) {
        if (clave === "regionId") {
            setForm((prev) => ({ ...prev, regionId: valor as string, comunaId: "" }));
            return;
        }
        setForm((prev) => ({ ...prev, [clave]: valor }));
    }

    function markTouched(k: keyof RegistroForm) {
        setTouched((prev) => ({ ...prev, [k]: true }));
    }

    function validarCampo(campo: keyof RegistroForm): string | undefined {
        const valor = form[campo];
        if (typeof valor !== "string") return undefined;

        switch (campo) {
            case "rut":
                return validarRut(valor);
            case "nombre":
                return validarNombre(valor, "nombre");
            case "apellidos":
                return validarNombre(valor, "apellidos");
            case "correo":
                return validarCorreo(valor);
            case "numeroTelefono":
                return validarTelefono(valor);
            case "fechaNacimiento":
                if (!valor) return "La fecha de nacimiento es obligatoria";
                const fecha = new Date(valor);
                const hoy = new Date();
                if (fecha > hoy) return "La fecha no puede ser futura";
                if (fecha.getFullYear() > hoy.getFullYear() - 15)
                    return "Debes tener al menos 15 años";
                return undefined;
            case "regionId":
                return !valor ? "Selecciona una región" : undefined;
            case "comunaId":
                return !valor ? "Selecciona una comuna" : undefined;
            case "direccion":
                if (!valor) return "La dirección es obligatoria";
                if (!longitudMaxima(valor, 120)) return "Máximo 120 caracteres";
                return undefined;
            case "password":
                return validarPassword(valor);
            default:
                return undefined;
        }
    }

    function validarCampoOnChange(campo: keyof RegistroForm) {
        if (!touched[campo]) return;
        const error = validarCampo(campo);
        setErrores((prev) => {
            const next = { ...prev };
            const key = campo === "password" ? "contrasenia" : campo;
            if (error) {
                next[key] = error;
            } else {
                delete next[key];
            }
            return next;
        });
    }

    function validarCampoOnBlur(campo: keyof RegistroForm) {
        markTouched(campo);
        const error = validarCampo(campo);
        const key = campo === "password" ? "contrasenia" : campo;
        if (error) {
            setErrores((prev) => ({ ...prev, [key]: error }));
        } else {
            setErrores((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    }

    function validar(): boolean {
        const e: Record<string, string> = {};
        (Object.keys(form) as Array<keyof RegistroForm>).forEach((campo) => {
            const error = validarCampo(campo);
            if (error) e[campo === "password" ? "contrasenia" : campo] = error;
        });
        setErrores(e);
        return Object.keys(e).length === 0;
    }

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();

        // Limpiar errores previos
        setErrores({});

        // Evitar doble submit
        if (enviando) return;

        // Validar front
        if (!validar()) return;

        setEnviando(true);
        try {
            // Llamar SIEMPRE al microservicio vía AuthContext
            const { ok, mensaje } = await registrarUsuario(form);

            if (!ok) {
                // Error de backend
                if (mensaje) {
                    setErrores((prev) => ({ ...prev, global: mensaje }));
                    alertError(mensaje);
                } else {
                    alertError("No se pudo completar el registro.");
                }
                return;
            }

            // Éxito
            alertSuccess(
                "Usuario registrado correctamente. Ahora puedes iniciar sesión."
            );
            setForm(inicial);
            setTouched({});
            navigate("/InicioSesion");
        } catch (e) {
            console.error("[Registro] Error inesperado en registro:", e);
            alertError("Ocurrió un error inesperado al registrar el usuario.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="sf-auth-container">
            <form onSubmit={onSubmit} className="sf-form--auth">
                <div className="sf-auth-header">
                    <h1>Crear cuenta</h1>
                    <p className="sf-auth-subtitle">
                        Completa tus datos para registrarte
                    </p>
                </div>

                {errores.global && (
                    <div className="sf-alert sf-alert--error">
                        <svg
                            className="sf-alert-icon"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{errores.global}</span>
                    </div>
                )}

                <div className="sf-form-body">
                    {/* RUT y Nombre */}
                    <div className="sf-field">
                        <label className="sf-field-label">RUT</label>
                        <div className="sf-input-wrapper">
                            <svg
                                className="sf-input-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                                />
                            </svg>
                            <input
                                className={`sf-input ${errores.rut ? "sf-input--error" : ""}`}
                                placeholder="12.345.678-9"
                                value={form.rut}
                                onChange={(e) => {
                                    const formateado = formatearRut(e.target.value);
                                    set("rut", formateado);
                                    validarCampoOnChange("rut");
                                }}
                                onBlur={() => validarCampoOnBlur("rut")}
                                disabled={enviando}
                            />
                        </div>
                        {errores.rut && (
                            <small className="sf-field-error">{errores.rut}</small>
                        )}
                    </div>

                    <div className="sf-field">
                        <label className="sf-field-label">Nombre</label>
                        <div className="sf-input-wrapper">
                            <svg
                                className="sf-input-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            <input
                                className={`sf-input ${errores.nombre ? "sf-input--error" : ""
                                    }`}
                                placeholder="Tu nombre"
                                value={form.nombre}
                                onChange={(e) => {
                                    set("nombre", e.target.value);
                                    validarCampoOnChange("nombre");
                                }}
                                onBlur={() => validarCampoOnBlur("nombre")}
                                disabled={enviando}
                            />
                        </div>
                        {errores.nombre && (
                            <small className="sf-field-error">{errores.nombre}</small>
                        )}
                    </div>

                    {/* Apellidos */}
                    <div className="sf-field sf-field--full">
                        <label className="sf-field-label">Apellidos</label>
                        <div className="sf-input-wrapper">
                            <svg
                                className="sf-input-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <input
                                className={`sf-input ${errores.apellidos ? "sf-input--error" : ""
                                    }`}
                                placeholder="Tus apellidos"
                                value={form.apellidos}
                                onChange={(e) => {
                                    set("apellidos", e.target.value);
                                    validarCampoOnChange("apellidos");
                                }}
                                onBlur={() => validarCampoOnBlur("apellidos")}
                                disabled={enviando}
                            />
                        </div>
                        {errores.apellidos && (
                            <small className="sf-field-error">{errores.apellidos}</small>
                        )}
                    </div>

                    {/* Correo y Teléfono */}
                    <div className="sf-field">
                        <label className="sf-field-label">Correo electrónico</label>
                        <div className="sf-input-wrapper">
                            <svg
                                className="sf-input-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            <input
                                type="email"
                                className={`sf-input ${errores.correo ? "sf-input--error" : ""
                                    }`}
                                placeholder="tucorreo@duocuc.cl"
                                value={form.correo}
                                onChange={(e) => {
                                    set("correo", e.target.value);
                                    validarCampoOnChange("correo");
                                }}
                                onBlur={() => validarCampoOnBlur("correo")}
                                disabled={enviando}
                            />
                        </div>
                        {errores.correo && (
                            <small className="sf-field-error">{errores.correo}</small>
                        )}
                    </div>

                    <div className="sf-field">
                        <label className="sf-field-label">Teléfono</label>
                        <div className="sf-input-wrapper">
                            <svg
                                className="sf-input-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                            </svg>
                            <input
                                type="tel"
                                className={`sf-input ${errores.numeroTelefono ? "sf-input--error" : ""
                                    }`}
                                placeholder="+56 9 xxxx xxxx"
                                value={form.numeroTelefono}
                                onChange={(e) => {
                                    set("numeroTelefono", e.target.value);
                                    validarCampoOnChange("numeroTelefono");
                                }}
                                onBlur={() => validarCampoOnBlur("numeroTelefono")}
                                disabled={enviando}
                            />
                        </div>
                        {errores.numeroTelefono && (
                            <small className="sf-field-error">{errores.numeroTelefono}</small>
                        )}
                    </div>

                    {/* Fecha de nacimiento */}
                    <div className="sf-field sf-field--full">
                        <label className="sf-field-label">Fecha de nacimiento</label>
                        <div className="sf-input-wrapper">
                            <svg
                                className="sf-input-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <input
                                type="date"
                                className={`sf-input ${errores.fechaNacimiento ? "sf-input--error" : ""
                                    }`}
                                value={form.fechaNacimiento}
                                onChange={(e) => {
                                    set("fechaNacimiento", e.target.value);
                                    validarCampoOnChange("fechaNacimiento");
                                }}
                                onBlur={() => validarCampoOnBlur("fechaNacimiento")}
                                disabled={enviando}
                            />
                        </div>
                        {errores.fechaNacimiento && (
                            <small className="sf-field-error">
                                {errores.fechaNacimiento}
                            </small>
                        )}
                    </div>

                    {/* Región y Comuna */}
                    <div className="sf-field">
                        <label className="sf-field-label">Región</label>
                        <div className="sf-input-wrapper">
                            <svg
                                className="sf-input-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <select
                                className={`sf-input sf-select ${errores.regionId ? "sf-input--error" : ""
                                    }`}
                                value={form.regionId}
                                onChange={(e) => {
                                    set("regionId", e.target.value);
                                    validarCampoOnChange("regionId");
                                }}
                                onBlur={() => validarCampoOnBlur("regionId")}
                                disabled={enviando}
                            >
                                <option value="">-- Selecciona --</option>
                                {REGIONES.map((r) => (
                                    <option key={r.slug} value={r.slug}>
                                        {r.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errores.regionId && (
                            <small className="sf-field-error">{errores.regionId}</small>
                        )}
                    </div>

                    <div className="sf-field">
                        <label className="sf-field-label">Comuna</label>
                        <div className="sf-input-wrapper">
                            <svg
                                className="sf-input-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            <select
                                className={`sf-input sf-select ${errores.comunaId ? "sf-input--error" : ""
                                    }`}
                                value={form.comunaId}
                                onChange={(e) => {
                                    set("comunaId", e.target.value);
                                    validarCampoOnChange("comunaId");
                                }}
                                onBlur={() => validarCampoOnBlur("comunaId")}
                                disabled={!form.regionId || enviando}
                            >
                                <option value="">-- Selecciona --</option>
                                {comunasFiltradas.map((c) => (
                                    <option key={c.slug} value={c.slug}>
                                        {c.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errores.comunaId && (
                            <small className="sf-field-error">{errores.comunaId}</small>
                        )}
                    </div>

                    {/* Dirección */}
                    <div className="sf-field sf-field--full">
                        <label className="sf-field-label">Dirección</label>
                        <div className="sf-input-wrapper">
                            <svg
                                className="sf-input-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            <input
                                className={`sf-input ${errores.direccion ? "sf-input--error" : ""
                                    }`}
                                placeholder="Calle, número, depto..."
                                value={form.direccion}
                                onChange={(e) => {
                                    set("direccion", e.target.value);
                                    validarCampoOnChange("direccion");
                                }}
                                onBlur={() => validarCampoOnBlur("direccion")}
                                disabled={enviando}
                            />
                        </div>
                        {errores.direccion && (
                            <small className="sf-field-error">{errores.direccion}</small>
                        )}
                    </div>

                    {/* Contraseña */}
                    <div className="sf-field sf-field--full">
                        <label className="sf-field-label">Contraseña</label>
                        <div className="sf-input-wrapper">
                            <svg
                                className="sf-input-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            <input
                                type="password"
                                className={`sf-input ${errores.contrasenia ? "sf-input--error" : ""
                                    }`}
                                placeholder="4 a 10 caracteres"
                                value={form.password ?? ""}
                                onChange={(e) => {
                                    set("password", e.target.value);
                                    validarCampoOnChange("password");
                                }}
                                onBlur={() => validarCampoOnBlur("password")}
                                disabled={enviando}
                            />
                        </div>
                        {errores.contrasenia && (
                            <small className="sf-field-error">{errores.contrasenia}</small>
                        )}
                    </div>

                    {/* Enviar */}
                    <button
                        type="submit"
                        className="sf-btn sf-btn--primary"
                        disabled={enviando}
                    >
                        {enviando ? (
                            <>
                                <svg className="sf-btn-spinner" viewBox="0 0 24 24">
                                    <circle
                                        className="sf-spinner-track"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        fill="none"
                                        strokeWidth="3"
                                    />
                                    <circle
                                        className="sf-spinner-circle"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        fill="none"
                                        strokeWidth="3"
                                    />
                                </svg>
                                Registrando...
                            </>
                        ) : (
                            "Registrarme"
                        )}
                    </button>
                </div>

                <div className="sf-auth-footer">
                    <span className="sf-auth-footer-text">¿Ya tienes cuenta?</span>
                    <Link to="/InicioSesion" className="sf-auth-link">
                        Inicia sesión
                    </Link>
                </div>
            </form>
        </div>
    );
}
