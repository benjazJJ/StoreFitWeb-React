import { useEffect, useMemo, useState } from "react";
import Perfil from "../../pages/Perfil/Perfil";
import "../../styles/Perfil.css";

export type PerfilUsuario = {
  id: string;              // ID de usuario
  nombre: string;
  apellidos: string;
  rut: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string; // Fecha (yyyy-mm-dd)
  regionId: string;
  comunaId: string;
  direccion: string;
  avatar?: string;
};

const KEY_SESSION = "storefit_sesion";           // { ID/tipo, opcional }
const KEY_PROFILES = "storefit_profiles";    // { [userId]: PerfilUsuario }
const REGISTRO_KEYS = ["storefit_usuarios"];

function getSessionUserId(): string {
  try {
    const raw = localStorage.getItem(KEY_SESSION);
    const s = raw ? JSON.parse(raw) : null;
    return s?.userId || s?.email || s?.correo || s?.rut || "user-local";
  } catch {
    return "user-local";
  }
}


function readProfiles(): Record<string, PerfilUsuario> {
  try {
    const raw = localStorage.getItem(KEY_PROFILES);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeProfiles(map: Record<string, PerfilUsuario>) {
  localStorage.setItem(KEY_PROFILES, JSON.stringify(map));
}


function hydrateFromRegistros(userId: string): PerfilUsuario | null {
  for (const key of REGISTRO_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const arr = JSON.parse(raw) as any[];
      const found =
        arr.find(x => (x.email || x.correo) === userId) ||
        arr.find(x => (x.rut || "").toUpperCase() === userId.toUpperCase());
      if (found) {
        return {
          id: userId,
          nombre: found.nombre || found.name || "",
          apellidos: found.apellidos || found.lastname || "",
          rut: (found.rut || "").toUpperCase(),
          correo: found.correo || found.email || userId,
          telefono: found.numeroTelefono || found.telefono || "",
          fechaNacimiento: found.fechaNacimiento || found.nacimiento || "",
          regionId: String(found.regionId || ""),
          comunaId: String(found.comunaId || ""),
          direccion: found.direccion || "",
          avatar: found.avatar || "",
        };
      }
    } catch { /* sigue buscando */ }
  }
  return null;
}

export default function Page() {
  const userId = useMemo(getSessionUserId, []);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    setError(null);

    const map = readProfiles();
    let p: PerfilUsuario | null = map[userId] ?? null;

    // migración user-local → userId
    if (!p && map["user-local"]) {
      map[userId] = { ...map["user-local"], id: userId, correo: /@/.test(userId) ? userId : (map["user-local"].correo || "") };
      delete map["user-local"];
      p = map[userId];
      writeProfiles(map);
    }

    // Carga desde registros
    if (!p) {
      const seeded = hydrateFromRegistros(userId); 
      p = seeded ?? {
        id: userId,
        nombre: "",
        apellidos: "",
        rut: "",
        correo: /@/.test(userId) ? userId : "",
        telefono: "",
        fechaNacimiento: "",
        regionId: "",
        comunaId: "",
        direccion: "",
        avatar: "",
      };
    }

    
    if (!map[userId]) {
      map[userId] = p;              
      writeProfiles(map);
    } else {
      map[userId] = { ...p, id: userId };   
      writeProfiles(map);
    }

    setPerfil(p);
    setCargando(false);
  }, [userId]);


  async function handleSubmit(nuevo: PerfilUsuario) {
    setGuardando(true);
    setMensaje(null);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 200));
      const map = readProfiles();
      map[userId] = { ...nuevo, id: userId };
      writeProfiles(map);
      setPerfil(map[userId]);
      setMensaje("Perfil actualizado correctamente.");
    } catch {
      setError("Error al guardar localmente.");
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje(null), 2500);
    }
  }

  if (cargando || !perfil) {
    return (
      <main className="perfil-page container">
        <div className="perfil-skeleton">
          <div className="avatar-skel" />
          <div className="line-skel" />
          <div className="line-skel short" />
        </div>
      </main>
    );
  }

  return (
    <main className="perfil-page container">
      <header className="perfil-header">
        <h1 className="perfil-title">Mi Perfil</h1>
        <p className="perfil-subtitle">Administra tu información personal y de contacto.</p>
      </header>

      {mensaje && <div className="perfil-alert">{mensaje}</div>}
      {error && (
        <div className="perfil-alert" style={{ borderColor: "rgba(255,92,124,.35)", background: "rgba(255,92,124,.1)" }}>
          {error}
        </div>
      )}

      {/* 👇 arranca en modo lectura (readonly) */}
      <Perfil value={perfil} onSubmit={handleSubmit} submitting={guardando} startReadonly />
    </main>
  );
}
