import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom'
import '../../styles/Login.css'
import {
    passwordValida,
    dominioCorreoValido,
    longitudMaxima,
    requerido,
} from "../../utils/validaciones";
import { iniciarSesion } from "../../services/auth";

export default function InicioSesion() {
    const [correo, setCorreo] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const [errores, setErrores] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    function validar() {
        const e: Record<string, string> = {};
        if (!requerido(correo) || !longitudMaxima(correo, 100) || !dominioCorreoValido(correo))
            e.correo = "Correo inválido o dominio no permitido";
        if (!passwordValida(contrasenia))
            e.contrasenia = "Contraseña entre 4 y 10 caracteres";
        setErrores(e);
        return Object.keys(e).length === 0;
    }

    function onSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        if (!validar()) return;

        const { ok, mensaje } = iniciarSesion({ correo, password: contrasenia });
        if (!ok) {
            setErrores({ global: mensaje ?? "No se pudo iniciar sesión" });
            return;
        }
        navigate('/');
    }

    return (
        <form onSubmit={onSubmit} className="sf-form sf-form--auth">
            <h1>Iniciar sesión</h1>
            {errores.global && <p className="sf-error">{errores.global}</p>}

            <label className="sf-label">Correo
                <input
                    type="email"
                    className="sf-input"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="tucorreo@duoc.cl"
                />
            </label>
            {errores.correo && <small className="sf-error">{errores.correo}</small>}

            <label className="sf-label">Contraseña
                <input
                    type="password"
                    className="sf-input"
                    value={contrasenia}
                    onChange={(e) => setContrasenia(e.target.value)}
                    placeholder="4 a 10 caracteres"
                />
            </label>
            {errores.contrasenia && <small className="sf-error">{errores.contrasenia}</small>}

            <button type="submit" className="btn btn-accent">Entrar</button>

            <div className="sf-auth-extra">
                ¿No tienes cuenta? <Link className="sf-link" to="/Registro">Crear cuenta</Link>
            </div>
        </form>
    );
}
