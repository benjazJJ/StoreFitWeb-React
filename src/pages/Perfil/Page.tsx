import { useEffect, useMemo, useState } from "react";
import Perfil from "../../pages/Perfil/Perfil";
import "../../styles/Perfil.css";
import { useAuth } from "../../context/AuthContext"; // Estado de sesión en memoria (useState)

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

// Componente de página de Perfil con estado 100% en memoria usando useState
export default function Page() {
  const { sesion, usuarios } = useAuth(); // Accede a la sesión y usuarios registrados
  const userId = useMemo(() => (sesion?.correo || sesion?.rut || 'user-local'), [sesion]); // ID lógico del usuario
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);          // Estado del perfil visible
  const [cargando, setCargando] = useState(true);                            // Flag de carga
  const [guardando, setGuardando] = useState(false);                         // Flag de guardado
  const [mensaje, setMensaje] = useState<string | null>(null);               // Mensaje de éxito
  const [error, setError] = useState<string | null>(null);                   // Mensaje de error
  const [mapPerfiles, setMapPerfiles] = useState<Record<string, PerfilUsuario>>({}); // Mapa en memoria por usuario

  // Usuario completo registrado (si existe en memoria). Se prioriza por correo y luego por RUT
  const usuario = useMemo(() => {
    if (!sesion) return null;
    const byCorreo = sesion.correo ? usuarios.find(u => u.correo.toLowerCase() === sesion.correo!.toLowerCase()) : undefined;
    if (byCorreo) return byCorreo;
    const byRut = sesion.rut ? usuarios.find(u => u.rut && u.rut === sesion.rut) : undefined;
    return byRut ?? null;
  }, [sesion, usuarios]);

  useEffect(() => {
    setCargando(true);
    setError(null);
    // Obtiene el perfil en memoria o inicializa usando datos del usuario registrado si existen
    const base: PerfilUsuario = mapPerfiles[userId]
      ?? (usuario ? {
        id: userId,
        nombre: usuario.nombre || "",
        apellidos: usuario.apellidos || "",
        rut: usuario.rut || "",
        correo: usuario.correo || "",
        telefono: usuario.numeroTelefono || "",
        fechaNacimiento: usuario.fechaNacimiento || "",
        regionId: usuario.regionId || "",
        comunaId: usuario.comunaId || "",
        direccion: usuario.direccion || "",
        avatar: "",
      } : {
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
      });

    setMapPerfiles(prev => ({ ...prev, [userId]: base })); // Guarda/actualiza en el mapa global en memoria
    setPerfil(base);                                       // Actualiza el estado del perfil mostrado
    setCargando(false);                                    // Finaliza carga
  }, [userId, usuario]);

  // Guarda cambios de perfil en el mapa en memoria
  async function handleSubmit(nuevo: PerfilUsuario) {
    setGuardando(true);
    setMensaje(null);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 200)); // Simula I/O
      setMapPerfiles(prev => ({ ...prev, [userId]: { ...nuevo, id: userId } })); // Escribe en memoria
      setPerfil({ ...nuevo, id: userId });                                       // Refleja cambios en pantalla
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

      {/* El componente arranca en modo lectura (readonly) */}
      <Perfil value={perfil} onSubmit={handleSubmit} submitting={guardando} startReadonly />
    </main>
  );
}
