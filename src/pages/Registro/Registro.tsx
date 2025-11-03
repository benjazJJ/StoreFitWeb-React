import { useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom'
import '../../styles/Registro.css'
import { REGIONES } from "../../data/Regiones";
import {
    passwordValida,
    dominioCorreoValido,
    requerido,
    rutValido,
    longitudMaxima,
} from "../../utils/validaciones";
import { registrarUsuario, type RegistroForm } from "../../services/auth";

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
    const [form, setForm] = useState<RegistroForm>(inicial);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();

    const comunasFiltradas = useMemo(
        () => REGIONES.find(r => r.slug === form.regionId)?.comunas || [],
        [form.regionId]
    );

    function set<K extends keyof RegistroForm>(clave: K, valor: RegistroForm[K]) {
        if (clave === "regionId") {
            setForm(prev => ({ ...prev, regionId: valor as string, comunaId: "" }));
            return;
        }
        setForm(prev => ({ ...prev, [clave]: valor }));
    }

    function markTouched(k: keyof RegistroForm) {
        setTouched(prev => ({ ...prev, [k]: true }));
    }

    const rutFormatoValido = (r: string) => {
        return /^\d{1,2}(?:\.\d{3})*-?[0-9Kk]$/.test(r.trim());
    }

    function validar(): boolean {
        const e: Record<string, string> = {};

        if (!requerido(form.rut) || !rutValido(form.rut) || !rutFormatoValido(form.rut))
            e.rut = "RUT inválido (formato 12.345.678-9)";
        if (!requerido(form.nombre) || !longitudMaxima(form.nombre, 100))
            e.nombre = "Requerido (máx. 100)";
        if (!requerido(form.apellidos) || !longitudMaxima(form.apellidos, 100))
            e.apellidos = "Requerido (máx. 100)";

        if (!requerido(form.correo) || !longitudMaxima(form.correo, 100) || !dominioCorreoValido(form.correo))
            e.correo = "Correo inválido o dominio no permitido";

        if (!requerido(form.numeroTelefono))
            e.numeroTelefono = "Número de teléfono requerido";

        if (!requerido(form.fechaNacimiento))
            e.fechaNacimiento = "Requerido";

        if (!requerido(form.regionId))
            e.regionId = "Selecciona una región";

        if (!requerido(form.comunaId))
            e.comunaId = "Selecciona una comuna";

        if (!requerido(form.direccion) || !longitudMaxima(form.direccion, 120))
            e.direccion = "Requerido (máx. 120)";

        if (!requerido(form.password) || !passwordValida(form.password ?? ""))
            e.contrasenia = "Contraseña entre 4 y 10 caracteres";

        setErrores(e);
        return Object.keys(e).length === 0;
    }

    function onSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        if (!validar()) return;

        if (submitting) return;
        setSubmitting(true);
        try {
            console.log('Registro - datos enviados:', form);
            const { ok, mensaje } = registrarUsuario(form);
            if (!ok) {
                setErrores({ global: mensaje ?? "No se pudo registrar" });
                setLastError(mensaje ?? 'registro-failed');
                return;
            }
            setErrores({});
            setLastError(null);
            setForm(inicial);
            navigate('/InicioSesion');
        } catch (err: any) {
            console.error('Error al registrar usuario:', err);
            const msg = err?.message ? String(err.message) : String(err);
            setErrores({ global: 'Error inesperado al registrar. Revisa la consola.' });
            setLastError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="sf-form">
            <h1>Registro</h1>
            {errores.global && <p className="sf-error">{errores.global}</p>}
            {lastError && <pre style={{ color: 'var(--sf-error)' }}>{lastError}</pre>}

            <label className="sf-label">RUT
                <input
                    className="sf-input"
                    placeholder="12.345.678-9"
                    value={form.rut}
                    onChange={(e) => set("rut", e.target.value)}
                />
            </label>
            {errores.rut && <small className="sf-error">{errores.rut}</small>}

            <label className="sf-label">Nombre
                <input className="sf-input" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
            </label>
            {errores.nombre && <small className="sf-error">{errores.nombre}</small>}

            <label className="sf-label">Apellidos
                <input className="sf-input" value={form.apellidos} onChange={(e) => set("apellidos", e.target.value)} />
            </label>
            {errores.apellidos && <small className="sf-error">{errores.apellidos}</small>}

            <label className="sf-label">Correo
                <input
                    type="email"
                    className="sf-input"
                    value={form.correo}
                    onChange={(e) => set("correo", e.target.value)}
                    placeholder="tucorreo@duoc.cl"
                />
            </label>
            {errores.correo && <small className="sf-error">{errores.correo}</small>}

            <label className="sf-label">Teléfono
                <input
                    type="tel"
                    className="sf-input"
                    value={form.numeroTelefono}
                    onChange={(e) => set("numeroTelefono", e.target.value)}
                    placeholder="+56 9 xxxx xxxx"
                />
            </label>
            {errores.numeroTelefono && <small className="sf-error">{errores.numeroTelefono}</small>}

            <label className="sf-label">Fecha de nacimiento
                <input
                    type="date"
                    className="sf-input"
                    value={form.fechaNacimiento}
                    onChange={(e) => set("fechaNacimiento", e.target.value)}
                />
            </label>
            {errores.fechaNacimiento && <small className="sf-error">{errores.fechaNacimiento}</small>}

            <label className="sf-label">Región
                <select className="sf-select" value={form.regionId} onChange={(e) => set("regionId", e.target.value)}>
                    <option value="">-- Selecciona --</option>
                    {REGIONES.map(r => <option key={r.slug} value={r.slug}>{r.nombre}</option>)}
                </select>
            </label>
            {errores.regionId && <small className="sf-error">{errores.regionId}</small>}

            <label className="sf-label">Comuna
                <select
                    className="sf-select"
                    value={form.comunaId}
                    onChange={(e) => set("comunaId", e.target.value)}
                    disabled={!form.regionId}
                >
                    <option value="">-- Selecciona --</option>
                    {comunasFiltradas.map(c => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
                </select>
            </label>
            {errores.comunaId && <small className="sf-error">{errores.comunaId}</small>}

            <label className="sf-label">Dirección
                <input className="sf-input" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
            </label>
            {errores.direccion && <small className="sf-error">{errores.direccion}</small>}


            <label className="sf-label">Contraseña
                <input
                    type="password"
                    className="sf-input"
                    value={form.password ?? ""}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="4 a 10 caracteres"
                />
            </label>
            {errores.contrasenia && <small className="sf-error">{errores.contrasenia}</small>}

            <div className="actions">
                <button type="submit" className="btn btn-accent" disabled={submitting}>
                    {submitting ? 'Registrando...' : 'Registrarme'}
                </button>
            </div>
        </form>
    );
}
