import { useEffect, useMemo, useState } from "react";
import Perfil from "../../pages/Perfil/Perfil";
import "../../styles/Perfil.css";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerPerfilUsuario,
  actualizarPerfilUsuario,
  UsuarioPerfilResponse,
} from "../../api/usersApi";


export type PerfilUsuario = {
  id: string;              // ID de usuario (usamos RUT)
  nombre: string;
  apellidos: string;
  rut: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string; // yyyy-mm-dd
  regionId: string;
  comunaId: string;
  direccion: string;
  avatar?: string;
};

// Página de Perfil conectada al microservicio users-service
export default function Page() {
  const { sesion } = useAuth();

  const rutSesion = useMemo(() => sesion?.rut ?? "", [sesion]);

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // === Cargar perfil desde la BD ===
  useEffect(() => {
    if (!sesion || !rutSesion) {
      setCargando(false);
      setError("No hay sesión activa.");
      return;
    }

    setCargando(true);
    setError(null);
    setMensaje(null);

    obtenerPerfilUsuario(rutSesion, {
      rut: sesion.rut,
      rol: sesion.rolNombre,
    })
      .then((u: UsuarioPerfilResponse) => {
        const perfilUi: PerfilUsuario = {
          id: u.rut,
          rut: u.rut,
          nombre: u.nombre,
          apellidos: u.apellidos,
          correo: u.correo,
          telefono: u.telefono ?? "",
          fechaNacimiento: u.fechaNacimiento ?? "",
          direccion: u.direccion ?? "",
          // De momento región/comuna solo existen en el front
          regionId: "",
          comunaId: "",
          avatar: u.fotoUri ?? "",
        };
        setPerfil(perfilUi);
      })
      .catch((e) => {
        console.error("[Perfil] Error al cargar perfil:", e);
        setError("No se pudo cargar tu perfil desde el servidor.");
      })
      .finally(() => setCargando(false));
  }, [sesion, rutSesion]);

  // === Guardar cambios en la BD ===
  async function handleSubmit(nuevo: PerfilUsuario) {
    if (!sesion || !rutSesion) return;
    setGuardando(true);
    setMensaje(null);
    setError(null);

    try {
      const actualizado = await actualizarPerfilUsuario(
        rutSesion,
        {
          nombre: nuevo.nombre,
          apellidos: nuevo.apellidos,
          correo: nuevo.correo,
          telefono: nuevo.telefono,
          direccion: nuevo.direccion,
          fechaNacimiento: nuevo.fechaNacimiento,
          fotoUri: nuevo.avatar,
        },
        {
          rut: sesion.rut,
          rol: sesion.rolNombre,
        }
      );

      // Refrescamos el estado con lo que devolvió la BD
      setPerfil({
        id: actualizado.rut,
        rut: actualizado.rut,
        nombre: actualizado.nombre,
        apellidos: actualizado.apellidos,
        correo: actualizado.correo,
        telefono: actualizado.telefono ?? "",
        fechaNacimiento: actualizado.fechaNacimiento ?? "",
        direccion: actualizado.direccion ?? "",
        regionId: nuevo.regionId,   // siguen siendo sólo del front
        comunaId: nuevo.comunaId,
        avatar: actualizado.fotoUri ?? nuevo.avatar,
      });

      setMensaje("Perfil actualizado correctamente.");
    } catch (e) {
      console.error("[Perfil] Error al actualizar perfil:", e);
      setError("No se pudo actualizar tu perfil en el servidor.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <main className="perfil-page">
        <h1>Mi perfil</h1>
        <p>Cargando...</p>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className="perfil-page">
        <h1>Mi perfil</h1>
        <p>No se pudo cargar tu perfil.</p>
      </main>
    );
  }

  return (
    <main className="perfil-page">
      <header className="perfil-header">
        <div>
          <h1>Mi perfil</h1>
          <p>Gestiona tu información personal.</p>
        </div>
      </header>

      {mensaje && <div className="perfil-alert">{mensaje}</div>}
      {error && (
        <div
          className="perfil-alert"
          style={{
            borderColor: "rgba(255,92,124,.35)",
            background: "rgba(255,92,124,.1)",
          }}
        >
          {error}
        </div>
      )}

      {/* El componente `Perfil` maneja el formulario y validaciones,
          y aquí le pasamos la función que realmente guarda en la BD */}
      <Perfil
        value={perfil}
        onSubmit={handleSubmit}
        submitting={guardando}
        startReadonly
      />
    </main>
  );
}