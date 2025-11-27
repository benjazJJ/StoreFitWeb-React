// src/api/usersApi.ts
import { USERS_URL } from "../config/api";

export type UsuarioPerfilResponse = {
  rut: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  fotoUri?: string | null;
};

export type UpdatePerfilRequest = {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  fotoUri?: string;
};

export async function obtenerPerfilUsuario(
  rut: string,
  headers: { rut: string; rol: string }
): Promise<UsuarioPerfilResponse> {
  const res = await fetch(`${USERS_URL}/usuarios/${rut}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-User-Rut": headers.rut,
      "X-User-Rol": headers.rol,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error al obtener perfil: HTTP ${res.status} ${text}`);
  }

  return (await res.json()) as UsuarioPerfilResponse;
}

export async function actualizarPerfilUsuario(
  rut: string,
  payload: UpdatePerfilRequest,
  headers: { rut: string; rol: string }
): Promise<UsuarioPerfilResponse> {
  const res = await fetch(`${USERS_URL}/usuarios/${rut}/perfil`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-User-Rut": headers.rut,
      "X-User-Rol": headers.rol,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error al actualizar perfil: HTTP ${res.status} ${text}`);
  }

  return (await res.json()) as UsuarioPerfilResponse;
}
