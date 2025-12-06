import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { loginApi } from "../api/authApi";
import { registrarUsuarioApi, RegistroRequest } from "../api/authApi";

// ===== Tipos para formularios/entidades de autenticación =====

export type RegistroForm = {
  rut: string;
  nombre: string;
  apellidos: string;
  correo: string;
  numeroTelefono: string;
  fechaNacimiento: string;
  regionId: string;
  comunaId: string;
  direccion: string;
  password: string;
};

export type Usuario = RegistroForm & {
  id: string; // Identificador del usuario (usamos RUT)
  createdAt: string; // Fecha de creación
};

export type LoginForm = { correo: string; password: string };

export type Sesion = {
  correo: string;
  rut: string;
  nombre: string;
  rolNombre: "ADMIN" | "CLIENTE" | "SOPORTE";
  isAdmin: boolean;
  token: string;
};

// ===== Forma del contexto expuesto a la app =====

type AuthContextType = {
  usuarios: Usuario[];
  sesion: Sesion | null;
  registrarUsuario: (
    input: RegistroForm
  ) => Promise<{ ok: boolean; mensaje?: string }>;
  iniciarSesion: (
    input: LoginForm
  ) => Promise<{ ok: boolean; mensaje?: string }>;
  cerrarSesion: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== Proveedor de autenticación =====

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Lista de usuarios en memoria (si la usas en algún admin local)
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Sesión actual, inicializada desde localStorage para sobrevivir al F5
  const [sesion, setSesion] = useState<Sesion | null>(() => {
    try {
      const token = localStorage.getItem("authToken");
      const rut = localStorage.getItem("userRut");
      const rol = localStorage.getItem("userRole") as
        | Sesion["rolNombre"]
        | null;
      const correo = localStorage.getItem("userEmail");
      const nombre = localStorage.getItem("userName");

      if (token && rut && rol && correo && nombre) {
        return {
          token,
          rut,
          rolNombre: rol,
          correo,
          nombre,
          isAdmin: rol === "ADMIN",
        };
      }
    } catch {
      // si localStorage falla, no restauramos sesión
    }
    return null;
  });

  // -------- Registro SOLO contra microservicio --------
  const registrarUsuario = useCallback(
    async (input: RegistroForm): Promise<{ ok: boolean; mensaje?: string }> => {
      try {
        // Validaciones básicas en el front
        if (!input.rut || !input.correo || !input.password) {
          return {
            ok: false,
            mensaje: "RUT, correo y contraseña son obligatorios.",
          };
        }

        // Llama SIEMPRE al microservicio
        const resp = await registrarUsuarioApi({
          rut: input.rut,
          nombre: input.nombre,
          apellidos: input.apellidos,
          correo: input.correo,
          numeroTelefono: input.numeroTelefono,
          fechaNacimiento: input.fechaNacimiento,
          direccion: input.direccion,
          password: input.password,
        } as RegistroRequest);

        if (!resp.success) {
          return {
            ok: false,
            mensaje: resp.mensaje ?? "No se pudo registrar el usuario.",
          };
        }

        // También lo guardamos en memoria para el dashboard/admin
        setUsuarios((prev) => [
          ...prev,
          {
            ...input,
            id: input.rut,
            createdAt: new Date().toISOString(),
          },
        ]);

        return { ok: true };
      } catch (e) {
        console.error(
          "[AuthContext] Error conectando con users-service (registro):",
          e
        );
        return {
          ok: false,
          mensaje: "No se pudo contactar con el servicio de usuarios.",
        };
      }
    },
    []
  );

  // -------- Inicio de sesión SOLO contra microservicio --------
  const iniciarSesion = useCallback(
    async (
      input: LoginForm
    ): Promise<{ ok: boolean; mensaje?: string }> => {
      try {
        const { correo, password } = input;

        const resp = await loginApi({
          correo,
          contrasenia: password,
        });

        if (!resp.success) {
          return {
            ok: false,
            mensaje: "Correo o contraseña incorrectos.",
          };
        }

        const nuevaSesion: Sesion = {
          correo: resp.correo,
          rut: resp.rut,
          nombre: resp.nombre,
          rolNombre: resp.rolNombre,
          isAdmin: resp.rolNombre === "ADMIN",
          token: resp.token, // usamos el token del backend
        };

        setSesion(nuevaSesion);

        // Guardamos para sobrevivir a F5
        localStorage.setItem("authToken", resp.token);
        localStorage.setItem("userRut", resp.rut);
        localStorage.setItem("userRole", resp.rolNombre);
        localStorage.setItem("userEmail", resp.correo);
        localStorage.setItem("userName", resp.nombre);

        return { ok: true };
      } catch (error: any) {
        console.error("[AuthContext] Error en iniciarSesion:", error);
        return {
          ok: false,
          mensaje: error?.message ?? "Error al iniciar sesión",
        };
      }
    },
    []
  );

  // -------- Cerrar sesión --------
  const cerrarSesion = useCallback(() => {
    setSesion(null);
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRut");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
    } catch {
      // ignoramos errores de localStorage
    }
  }, []);

  // Memo del value para no re-renderizar todo a cada rato
  const value = useMemo(
    () => ({
      usuarios,
      sesion,
      registrarUsuario,
      iniciarSesion,
      cerrarSesion,
    }),
    [usuarios, sesion, registrarUsuario, iniciarSesion, cerrarSesion]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook de consumo del contexto de autenticación
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
