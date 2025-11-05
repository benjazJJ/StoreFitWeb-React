// Módulo de autenticación (compatibilidad): sin LocalStorage.
// La aplicación usa AuthContext (useState). Mantiene un estado en memoria de referencia.

export type RegistroForm = {
  rut: string; nombre: string; apellidos: string; correo: string; numeroTelefono: string;
  fechaNacimiento: string; regionId: string; comunaId: string; direccion: string; password: string;
}
export type Usuario = RegistroForm & { id: string; createdAt: string }
export type LoginForm = { correo: string; password: string }
export type Sesion = { correo: string; rut: string; nombre: string; isAdmin?: boolean }
export const EVENTO_SESION = "storefit:session-change"

const ADMIN_CUENTAS = ['admin@storefit.cl','admin@adminstorefit.cl']
const ADMIN_PASSWORD = 'Admin123'
let usuariosMem: Usuario[] = []
let sesionMem: Sesion | null = null
const esAdminEmail = (c: string) => ADMIN_CUENTAS.includes((c||'').toLowerCase().trim())
const normalizarRut = (rut: string) => rut.replace(/[.\-]/g, '').toUpperCase()

export function registrarUsuario(input: RegistroForm): { ok: boolean; mensaje?: string } {
  if (usuariosMem.some(u => normalizarRut(u.rut) === normalizarRut(input.rut))) return { ok: false, mensaje: 'El RUT ya está registrado.' }
  if (usuariosMem.some(u => u.correo.toLowerCase() === input.correo.toLowerCase())) return { ok: false, mensaje: 'El correo ya está registrado.' }
  if (usuariosMem.some(u => u.numeroTelefono === input.numeroTelefono)) return { ok: false, mensaje: 'El número de teléfono ya está registrado.' }
  if (!input.password || input.password.trim().length < 4) return { ok: false, mensaje: 'La contraseña es obligatoria y debe tener al menos 4 caracteres.' }
  const nuevo: Usuario = { ...input, id: input.rut, createdAt: new Date().toISOString() }
  usuariosMem = [...usuariosMem, nuevo]
  return { ok: true }
}

export function iniciarSesion({ correo, password }: LoginForm): { ok: boolean; mensaje?: string } {
  let u = usuariosMem.find(x => x.correo.toLowerCase() === correo.toLowerCase())
  if (!u) {
    if (esAdminEmail(correo) && password === ADMIN_PASSWORD) {
      const admin: Usuario = { id: 'ADMIN-0', rut: 'ADMIN-0', nombre: 'Admin', apellidos: 'StoreFit', correo, numeroTelefono: '', fechaNacimiento: '', regionId: '', comunaId: '', direccion: '', password: ADMIN_PASSWORD, createdAt: new Date().toISOString() }
      usuariosMem = [...usuariosMem, admin]
      u = admin
    } else {
      return { ok: false, mensaje: 'Usuario no encontrado.' }
    }
  }
  if (!u.password) return { ok: false, mensaje: 'El usuario no tiene una contraseña registrada.' }
  if (password !== u.password) return { ok: false, mensaje: 'Contraseña incorrecta.' }
  sesionMem = { correo: u.correo, rut: u.rut, nombre: u.nombre, isAdmin: esAdminEmail(u.correo) }
  return { ok: true }
}

export function cerrarSesion() { sesionMem = null }
export function obtenerSesion(): Sesion | null { return sesionMem }
export function esAdminSesion(): boolean { return !!sesionMem?.isAdmin }