import { USERS_URL } from "../config/api";
import { fetchConErrores, obtenerMensajeError } from "../utils/apiErrors";

export type LoginRequest = {
  correo: string;
  contrasenia: string;
};

//Peticion de login
export type LoginResponse = {
  success: boolean;
  token: string;
  usuario: string;
  rut: string;
  nombre: string;
  correo: string;
  rolId: number;
  rolNombre: "ADMIN" | "CLIENTE" | "SOPORTE";
};

export async function loginApi(req: { correo: string; contrasenia: string }) {
  try {
    const res = await fetchConErrores(`${USERS_URL}/registros/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${text}`);
    }

    return (await res.json()) as LoginResponse;
  } catch (error) {
    throw new Error(obtenerMensajeError(error));
  }
}

export type RegistroRequest = {
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

export type RegistroResponse = {
  success: boolean;
  mensaje?: string;
};

export async function registrarUsuarioApi(
  payload: RegistroRequest
): Promise<RegistroResponse> {

  const backendBody = {
    rut: payload.rut,
    nombre: payload.nombre,
    apellidos: payload.apellidos,
    correo: payload.correo,
    fechaNacimiento: payload.fechaNacimiento,
    contrasenia: payload.password,
    confirmarContrasenia: payload.password, 
    direccion: payload.direccion,
    telefono: payload.numeroTelefono,
  };

  try {
    const res = await fetchConErrores(`${USERS_URL}/registros/registro-completo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendBody),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[registrarUsuarioApi] HTTP error", res.status, text);
      throw new Error(`HTTP ${res.status} ${text}`);
    }

    const data = (await res.json()) as { success: boolean; usuario: string };
    return { success: data.success };
  } catch (error) {
    throw new Error(obtenerMensajeError(error));
  }
}