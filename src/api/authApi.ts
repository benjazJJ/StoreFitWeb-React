import { USERS_URL } from "../config/api";

export type LoginRequest = {
  correo: string;
  contrasenia: string;
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

// Respuesta del backend al registrar (ajusta según tu microservicio)
export type RegistroResponse = {
  success: boolean;
  mensaje?: string;
};

export async function registrarUsuarioApi(
  payload: RegistroRequest
): Promise<RegistroResponse> {
  // adaptamos los nombres al DTO del backend
  const backendBody = {
    rut: payload.rut,
    nombre: payload.nombre,
    apellidos: payload.apellidos,
    correo: payload.correo,
    fechaNacimiento: payload.fechaNacimiento,
    contrasenia: payload.password,
    confirmarContrasenia: payload.password, // usamos la misma contraseña
    direccion: payload.direccion,
    telefono: payload.numeroTelefono,
  };

  const res = await fetch(`${USERS_URL}/registros/registro-completo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(backendBody),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[registrarUsuarioApi] HTTP error", res.status, text);
    throw new Error(`HTTP ${res.status} ${text}`);
  }

  // tu backend devuelve: new RegistroCompletoResponse(true, usuario)
  const data = (await res.json()) as { success: boolean; usuario: string };
  return { success: data.success }; // adaptamos a tu RegistroResponse
}