import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { loginApi, LoginResponse } from "../api/authApi";
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
  // Sesión actual (solo en memoria)
  const [sesion, setSesion] = useState<Sesion | null>(null);

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

        // Si quieres, puedes cachear en memoria:
        // setUsuarios(prev => [
        //   ...prev,
        //   { ...input, id: input.rut, createdAt: new Date().toISOString() }
        // ]);

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
  const iniciarSesion = useCallback(async ({ correo, password }: LoginForm) => {
    try {
      // Llama SIEMPRE al servicio de autenticación / usuarios
      const resp: LoginResponse = await loginApi({
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
      };

      // Guardamos solo en memoria (sin localStorage)
      setSesion(nuevaSesion);

      return { ok: true };
    } catch (e) {
      console.error("Error conectando con users-service:", e);
      return {
        ok: false,
        mensaje: "No se pudo conectar con el servidor de autenticación.",
      };
    }
  }, []);

  // -------- Cerrar sesión --------
  const cerrarSesion = useCallback(() => {
    setSesion(null);
  }, []);

  const value = useMemo<AuthContextType>(
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
