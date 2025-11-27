// src/context/AuthContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loginApi, LoginResponse } from "../api/authApi";

// Tipos para formularios/entidades de autenticación
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

// Sesión ahora incluye el rol que viene del backend
export type Sesion = {
  correo: string;
  rut: string;
  nombre: string;
  rolNombre: "ADMIN" | "CLIENTE" | "SOPORTE";
  isAdmin: boolean;
};

// Cuentas administrativas válidas y clave (puedes mantenerlas o quitarlas luego)
const ADMIN_CUENTAS = ["admin@storefit.cl", "admin@adminstorefit.cl"];
const ADMIN_PASSWORD = "Admin123";

const SESION_KEY = "storefit_sesion";

// Utilidad: normaliza un RUT para comparaciones
const normalizarRut = (rut: string) =>
  rut.replace(/[.\-]/g, "").toUpperCase();

// Forma del contexto expuesto a la app
type AuthContextType = {
  usuarios: Usuario[]; // Lista en memoria de usuarios registrados
  sesion: Sesion | null; // Sesión activa (o null si no hay)
  registrarUsuario: (input: RegistroForm) => { ok: boolean; mensaje?: string };
  iniciarSesion: (
    input: LoginForm
  ) => Promise<{ ok: boolean; mensaje?: string }>;
  cerrarSesion: () => void;
};

// Contexto real
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado: usuarios registrados (en memoria)
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  // Estado: sesión actual
  const [sesion, setSesion] = useState<Sesion | null>(null);

  // Cargar sesión desde localStorage al montar
  useEffect(() => {
    const raw = localStorage.getItem(SESION_KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw) as Sesion;
        setSesion(s);
      } catch {
        localStorage.removeItem(SESION_KEY);
      }
    }
  }, []);

  // Acción: registra un nuevo usuario en la lista en memoria (por ahora local)
  const registrarUsuario = useCallback(
    (input: RegistroForm) => {
      // Validaciones de duplicados
      if (
        usuarios.some(
          (u) => normalizarRut(u.rut) === normalizarRut(input.rut)
        )
      ) {
        return { ok: false, mensaje: "El RUT ya está registrado." };
      }
      if (
        usuarios.some(
          (u) => u.correo.toLowerCase() === input.correo.toLowerCase()
        )
      ) {
        return { ok: false, mensaje: "El correo ya está registrado." };
      }
      if (
        usuarios.some((u) => u.numeroTelefono === input.numeroTelefono)
      ) {
        return {
          ok: false,
          mensaje: "El número de teléfono ya está registrado.",
        };
      }
      if (!input.password || input.password.trim().length < 4) {
        return {
          ok: false,
          mensaje:
            "La contraseña es obligatoria y debe tener al menos 4 caracteres.",
        };
      }
      // Crea y agrega el usuario
      const nuevo: Usuario = {
        ...input,
        id: input.rut,
        createdAt: new Date().toISOString(),
      };
      setUsuarios((prev) => [...prev, nuevo]);
      return { ok: true };
    },
    [usuarios]
  );

  // Acción: inicia sesión contra el microservicio de usuarios
  const iniciarSesion = useCallback(
  async ({ correo, password }: LoginForm) => {
    try {
      const resp = await loginApi({
        correo,
        contrasenia: password,
      });

      // Si el servidor respondió con 4xx/5xx o success=false
      if (!resp.ok || !resp.data || !resp.data.success) {
        return {
          ok: false,
          mensaje: "Correo o contraseña incorrectos.",
        };
      }

      const data = resp.data;

      const nuevaSesion: Sesion = {
        correo: data.correo,
        rut: data.rut,
        nombre: data.nombre,
        rolNombre: data.rolNombre,
        isAdmin: data.rolNombre === "ADMIN",
      };

      setSesion(nuevaSesion);
      localStorage.setItem(SESION_KEY, JSON.stringify(nuevaSesion));

      return { ok: true };
    } catch (e) {
      console.error("Error REAL de conexión con auth-service:", e);
      return {
        ok: false,
        mensaje: "No se pudo conectar con el servidor de autenticación.",
      };
    }
  },
  []
);


  // Acción: cierra la sesión limpiando el estado y el localStorage
  const cerrarSesion = useCallback(() => {
    setSesion(null);
    localStorage.removeItem(SESION_KEY);
  }, []);

  // Valor memorizado del contexto
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

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// Hook de consumo del contexto de autenticación
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
