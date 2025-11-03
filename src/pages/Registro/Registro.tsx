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
  const navigate = useNavigate();

  const comunasFiltradas = useMemo(
    () => REGIONES.find(r => r.slug === form.regionId)?.comunas || [],
    [form.regionId]
  );

  function set<K extends keyof RegistroForm>(clave: K, valor: RegistroForm[K]) {
    setForm(prev => ({ ...prev, [clave]: valor }));
    if (clave === "regionId") {
      setForm(prev => ({ ...prev, comunaId: "" }));
    }
  }

  function validar(): boolean {
    const e: Record<string, string> = {};

    if (!rutValido(form.rut)) e.rut = "RUT inválido";
    if (!requerido(form.nombre) || !longitudMaxima(form.nombre, 100))
      e.nombre = "Requerido (máx. 100)";
    if (!requerido(form.apellidos) || !longitudMaxima(form.apellidos, 100))
      e.apellidos = "Requerido (máx. 100)";

    if (!requerido(form.correo) || !longitudMaxima(form.correo, 100) || !dominioCorreoValido(form.correo))
      e.correo = "Correo inválido o dominio no permitido";

    if (!requerido(form.fechaNacimiento))
      e.fechaNacimiento = "Requerido";

    if (!requerido(form.regionId))
      e.regionId = "Selecciona una región";

    if (!requerido(form.comunaId))
      e.comunaId = "Selecciona una comuna";

    if (!requerido(form.direccion) || !longitudMaxima(form.direccion, 120))
      e.direccion = "Requerido (máx. 120)";

    if (form.password && !passwordValida(form.password))
      e.contrasenia = "Entre 4 y 10 caracteres";

    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validar()) return;

    const { ok, mensaje } = registrarUsuario(form);
    if (!ok) {
      setErrores({ global: mensaje ?? "No se pudo registrar" });
      return;
    }
    alert("¡Registro exitoso! Ahora inicia sesión.");
    navigate('/InicioSesion');
  }

  return (
    <form onSubmit={onSubmit} className="sf-form">
      <h1>Registro</h1>
      {errores.global && <p className="sf-error">{errores.global}</p>}

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
        <button type="submit" className="btn btn-accent">Registrarme</button>
      </div>
    </form>
  );
}
