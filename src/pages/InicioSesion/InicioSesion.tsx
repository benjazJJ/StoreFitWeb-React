import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../../styles/Login.css";
import { validarCorreo, passwordValida } from "../../utils/validaciones";
import { useAuth } from "../../context/AuthContext";
import { alertSuccess, alertError } from "../../utils/alerts"; // Alertas

export default function InicioSesion() {
    const { iniciarSesion } = useAuth(); // Acción de autenticación desde contexto
    const [correo, setCorreo] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const [recordar, setRecordar] = useState(false);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [enviando, setEnviando] = useState(false);
    const [mostrarContrasenia, setMostrarContrasenia] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: string } | null)?.from || "/";

    const validarCampo = (campo: "correo" | "contrasenia"): string | undefined => {
        if (campo === "correo") return validarCorreo(correo);
        if (campo === "contrasenia") {
            return !passwordValida(contrasenia)
                ? "Contraseña entre 4 y 20 caracteres"
                : undefined;
        }
        return undefined;
    };

    const validar = () => {
        const e: Record<string, string> = {};
        const eCorreo = validarCampo("correo");
        const ePass = validarCampo("contrasenia");
        if (eCorreo) e.correo = eCorreo;
        if (ePass) e.contrasenia = ePass;
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async (ev: FormEvent) => {
        ev.preventDefault();
        setErrores({});
        if (!validar() || enviando) return;

        setEnviando(true);
        try {
            const { ok, mensaje } = await iniciarSesion({
                correo,
                password: contrasenia,
            });

            if (!ok) {
                if (mensaje?.toLowerCase().includes("correo")) {
                    setErrores({ correo: mensaje });
                } else if (mensaje?.toLowerCase().includes("contraseña")) {
                    setErrores({ contrasenia: mensaje });
                } else {
                    setErrores({ global: mensaje ?? "No se pudo iniciar sesión" });
                    await alertError(
                        "No se pudo iniciar sesión",
                        mensaje ?? "Revisa tus credenciales"
                    );
                }
                return;
            }

            if (recordar) {
                sessionStorage.setItem("remember", "1");
            }

            // Éxito
            await alertSuccess("¡Has iniciado sesión exitosamente!");

            // 👉 Vuelve a la página que pidió autenticación (por ejemplo /Checkout)
            navigate(from, { replace: true });
        } catch (err) {
            console.error("Error al iniciar sesión:", err);
            setErrores({
                global: "Error inesperado al iniciar sesión. Intenta nuevamente.",
            });
            await alertError("Error inesperado", "Intenta nuevamente.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="sf-auth-container">
            <form onSubmit={onSubmit} className="sf-form--auth" noValidate>
                <div className="sf-auth-header">
                    <h1>¡Bienvenido de vuelta!</h1>
                    <p className="sf-auth-subtitle">
                        Ingresa tus credenciales para continuar
                    </p>
                </div>

                {errores.global && (
                    <div className="sf-alert sf-alert--error" role="alert">
                        <svg className="sf-alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    {/* Correo */}
                    <div className="sf-field">
                        <label className="sf-field-label" htmlFor="email">
                            Correo electrónico
                        </label>
                        <div className="sf-input-wrapper">
                            <svg className="sf-input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                />
                            </svg>
                            <input
                                id="email"
                                type="email"
                                className={`sf-input ${errores.correo ? "sf-input--error" : ""}`}
                                placeholder="tucorreo@duoc.cl"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                onBlur={() => {
                                    const error = validarCampo("correo");
                                    if (error) setErrores((p) => ({ ...p, correo: error }));
                                }}
                                aria-invalid={!!errores.correo}
                                aria-describedby={errores.correo ? "correo-error" : undefined}
                                disabled={enviando}
                            />
                        </div>
                        {errores.correo && (
                            <span id="correo-error" className="sf-field-error">
                                {errores.correo}
                            </span>
                        )}
                    </div>

                    {/* Contraseña */}
                    <div className="sf-field">
                        <label className="sf-field-label" htmlFor="password">
                            Contraseña
                        </label>
                        <div className="sf-input-wrapper">
                            <svg className="sf-input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 10-6 0v2c0 1.657 1.343 3 3 3zm-6 2a6 6 0 0112 0v3a2 2 0 01-2 2H8a2 2 0 01-2-2v-3z"
                                />
                            </svg>
                            <input
                                id="password"
                                type={mostrarContrasenia ? "text" : "password"}
                                className={`sf-input ${errores.contrasenia ? "sf-input--error" : ""}`}
                                placeholder="4 a 20 caracteres"
                                value={contrasenia}
                                onChange={(e) => setContrasenia(e.target.value)}
                                onBlur={() => {
                                    const error = validarCampo("contrasenia");
                                    if (error) setErrores((p) => ({ ...p, contrasenia: error }));
                                }}
                                aria-invalid={!!errores.contrasenia}
                                aria-describedby={errores.contrasenia ? "pass-error" : undefined}
                                disabled={enviando}
                            />
                            <button
                                type="button"
                                className="sf-input-action"
                                onClick={() => setMostrarContrasenia(!mostrarContrasenia)}
                                aria-label={mostrarContrasenia ? "Ocultar contraseña" : "Mostrar contraseña"}
                                disabled={enviando}
                            >
                                {mostrarContrasenia ? "Ocultar" : "Ver"}
                            </button>
                        </div>
                        {errores.contrasenia && (
                            <span id="pass-error" className="sf-field-error">
                                {errores.contrasenia}
                            </span>
                        )}
                    </div>

                    {/* Recordar */}
                    <div className="sf-field sf-field--inline">
                        <label className="sf-checkbox">
                            <input
                                type="checkbox"
                                checked={recordar}
                                onChange={(e) => setRecordar(e.target.checked)}
                                disabled={enviando}
                            />
                            <span>Recordarme en este dispositivo</span>
                        </label>
                    </div>

                    {/* Botón */}
                    <button
                        type="submit"
                        className="sf-btn sf-btn--primary"
                        disabled={enviando}
                    >
                        {enviando ? "Iniciando sesión..." : "Iniciar sesión"}
                    </button>
                </div>

                {/* Registro */}
                <div className="sf-auth-footer">
                    <span className="sf-auth-footer-text">¿No tienes cuenta?</span>
                    <Link className="sf-auth-link" to="/Registro">
                        Crear cuenta
                    </Link>
                </div>
            </form>
        </div>
    );
}
