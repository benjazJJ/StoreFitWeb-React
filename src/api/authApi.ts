import { USERS_URL } from "../config/api";

export type LoginRequest = {
  correo: string;
  contrasenia: string;
};

// Petición de registro 
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
//Peticion de login
export type LoginResponse = {
  success: boolean;
  usuario: string;
  rut: string;
  nombre: string;
  correo: string;
  rolId: number;
  rolNombre: "ADMIN" | "CLIENTE" | "SOPORTE";
};

// Llama SIEMPRE al microservicio. Si falla, lanza error.
export async function loginApi(req: { correo: string; contrasenia: string }) {
  const res = await fetch(`${USERS_URL}/registros/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${text}`);
  }

  return (await res.json()) as LoginResponse;
}

// Respuesta del backend al registrar (ajusta según tu microservicio)
export type RegistroResponse = {
  success: boolean;
  mensaje?: string;
};

export async function registrarUsuarioApi(
  payload: RegistroRequest
): Promise<RegistroResponse> {
  const res = await fetch(`${USERS_URL}/usuarios`, {
    //AJUSTA esta ruta a la que realmente uses en tu users-service
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[registrarUsuarioApi] HTTP error", res.status, text);
    throw new Error(`HTTP ${res.status} ${text}`);
  }

  // Si tu backend no devuelve este formato, ajusta el parseo.
  const data = (await res.json()) as RegistroResponse;
  return data;
}