import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Login.css";
import { validarCorreo, passwordValida } from "../../utils/validaciones";
import { iniciarSesion } from "../../services/auth";

export default function InicioSesion() {
    const [correo, setCorreo] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const [remember, setRemember] = useState(false);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const validarCampo = (campo: "correo" | "contrasenia"): string | undefined => {
        if (campo === "correo") return validarCorreo(correo);
        if (campo === "contrasenia")
            return !passwordValida(contrasenia)
                ? "Contraseña entre 4 y 10 caracteres"
                : undefined;
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

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        setErrores({});
        if (!validar() || submitting) return;

        setSubmitting(true);
        try {
            const { ok, mensaje } = iniciarSesion({ correo, password: contrasenia });

            if (!ok) {
                if (mensaje?.toLowerCase().includes("correo")) {
                    setErrores({ correo: mensaje });
                } else if (mensaje?.toLowerCase().includes("contraseña")) {
                    setErrores({ contrasenia: mensaje });
                } else {
                    setErrores({ global: mensaje ?? "No se pudo iniciar sesión" });
                }
                return;
            }

            if (remember) sessionStorage.setItem("remember", "1");
            navigate("/");
        } catch (err) {
            console.error("Error al iniciar sesión:", err);
            setErrores({
                global: "Error inesperado al iniciar sesión. Intenta nuevamente.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="sf-auth-container">
            <form onSubmit={onSubmit} className="sf-form--auth" noValidate>
                <div className="sf-auth-header">
                    <h1>¡Bienvenido de vuelta!</h1>
                    <p className="sf-auth-subtitle">Ingresa tus credenciales para continuar</p>
                </div>

                {errores.global && (
                    <div className="sf-alert sf-alert--error" role="alert">
                        <svg className="sf-alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{errores.global}</span>
                    </div>
                )}

                <div className="sf-form-body">
                    {/* Email */}
                    <div className="sf-field">
                        <label className="sf-field-label" htmlFor="email">
                            Correo electrónico
                        </label>
                        <div className="sf-input-wrapper">
                            <svg className="sf-input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
                                disabled={submitting}
                            />
                        </div>
                        {errores.correo && (
                            <span id="correo-error" className="sf-field-error">
                                {errores.correo}
                            </span>
                        )}
                    </div>

                    {/* Password */}
                    <div className="sf-field">
                        <label className="sf-field-label" htmlFor="password">
                            Contraseña
                        </label>
                        <div className="sf-input-wrapper">
                            <svg className="sf-input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className={`sf-input ${errores.contrasenia ? "sf-input--error" : ""}`}
                                placeholder="4 a 10 caracteres"
                                value={contrasenia}
                                onChange={(e) => setContrasenia(e.target.value)}
                                onBlur={() => {
                                    const error = validarCampo("contrasenia");
                                    if (error) setErrores((p) => ({ ...p, contrasenia: error }));
                                }}
                                aria-invalid={!!errores.contrasenia}
                                aria-describedby={errores.contrasenia ? "pass-error" : undefined}
                                disabled={submitting}
                            />
                            <button
                                type="button"
                                className="sf-input-action"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                disabled={submitting}
                            >
                                {showPassword ? (
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errores.contrasenia && (
                            <span id="pass-error" className="sf-field-error">
                                {errores.contrasenia}
                            </span>
                        )}
                    </div>

                    {/* Recordarme */}
                    <div className="sf-checkbox-wrapper">
                        <label className="sf-checkbox-label">
                            <input
                                type="checkbox"
                                className="sf-checkbox-input"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                disabled={submitting}
                            />
                            <span className="sf-checkbox-custom"></span>
                            <span className="sf-checkbox-text">Recordarme por 30 días</span>
                        </label>
                    </div>

                    {/* Botón */}
                    <button type="submit" className="sf-btn sf-btn--primary" disabled={submitting}>
                        {submitting ? (
                            <>
                                <svg className="sf-btn-spinner" viewBox="0 0 24 24">
                                    <circle className="sf-spinner-track" cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
                                    <circle className="sf-spinner-circle" cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
                                </svg>
                                Iniciando sesión...
                            </>
                        ) : (
                            "Iniciar sesión"
                        )}
                    </button>
                </div>

                {/* CTA registro */}
                <div className="sf-auth-footer">
                    <span className="sf-auth-footer-text">¿No tienes cuenta?</span>
                    <Link className="sf-auth-link" to="/Registro">Crear cuenta</Link>
                </div>
            </form>
        </div>
    );
}