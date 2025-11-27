import { USERS_URL } from "../config/api";

export type LoginRequest = {
  correo: string;
  contrasenia: string;
};

export type LoginResponse = {
  success: boolean;
  usuario: string;
  rut: string;
  nombre: string;
  correo: string;
  rolId: number;
  rolNombre: "ADMIN" | "CLIENTE" | "SOPORTE";
};

export async function loginApi(
  req: LoginRequest
): Promise<{ ok: boolean; data?: LoginResponse }> {
  try {
    const res = await fetch(`${USERS_URL}/registros/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });

    // Si el servidor respondió, pero con error (400, 401, 500...), lo tratamos como credenciales malas
    if (!res.ok) {
      return { ok: false };
    }

    const data = (await res.json()) as LoginResponse;
    return { ok: true, data };
  } catch (e) {
    // Aquí recién es un problema real de conexión/red
    console.error("Error de red al llamar loginApi:", e);
    throw e;
  }
}
