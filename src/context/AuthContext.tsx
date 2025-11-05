import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Tipos para formularios/entidades de autenticación
export type RegistroForm = {
  rut: string
  nombre: string
  apellidos: string
  correo: string
  numeroTelefono: string
  fechaNacimiento: string
  regionId: string
  comunaId: string
  direccion: string
  password: string
}

export type Usuario = RegistroForm & {
  id: string          // Identificador del usuario (usamos RUT)
  createdAt: string   // Fecha de creación
}

export type LoginForm = { correo: string; password: string }

export type Sesion = { correo: string; rut: string; nombre: string; isAdmin?: boolean }

// Cuentas administrativas válidas y clave
const ADMIN_CUENTAS = ['admin@storefit.cl', 'admin@adminstorefit.cl']
const ADMIN_PASSWORD = 'Admin123'

// Utilidad: normaliza un RUT para comparaciones
const normalizarRut = (rut: string) => rut.replace(/[.\-]/g, '').toUpperCase()

// Forma del contexto expuesto a la app
type AuthContextType = {
  usuarios: Usuario[]                               // Lista en memoria de usuarios registrados
  sesion: Sesion | null                              // Sesión activa (o null si no hay)
  registrarUsuario: (input: RegistroForm) => { ok: boolean; mensaje?: string }
  iniciarSesion: (input: LoginForm) => { ok: boolean; mensaje?: string }
  cerrarSesion: () => void
}

// Contexto real
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Proveedor de autenticación con estado en memoria (useState) y sin LocalStorage
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado: usuarios registrados (en memoria)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  // Estado: sesión actual
  const [sesion, setSesion] = useState<Sesion | null>(null)

  // Acción: registra un nuevo usuario en la lista en memoria
  const registrarUsuario = useCallback((input: RegistroForm) => {
    // Validaciones de duplicados
    if (usuarios.some(u => normalizarRut(u.rut) === normalizarRut(input.rut))) {
      return { ok: false, mensaje: 'El RUT ya está registrado.' }
    }
    if (usuarios.some(u => u.correo.toLowerCase() === input.correo.toLowerCase())) {
      return { ok: false, mensaje: 'El correo ya está registrado.' }
    }
    if (usuarios.some(u => u.numeroTelefono === input.numeroTelefono)) {
      return { ok: false, mensaje: 'El número de teléfono ya está registrado.' }
    }
    if (!input.password || input.password.trim().length < 4) {
      return { ok: false, mensaje: 'La contraseña es obligatoria y debe tener al menos 4 caracteres.' }
    }
    // Crea y agrega el usuario
    const nuevo: Usuario = { ...input, id: input.rut, createdAt: new Date().toISOString() }
    setUsuarios(prev => [...prev, nuevo])
    return { ok: true }
  }, [usuarios])

  // Utilidad: determina si un correo es admin
  const esAdminEmail = (correo: string) => ADMIN_CUENTAS.includes((correo || '').toLowerCase().trim())

  // Acción: inicia sesión y establece el estado sesion
  const iniciarSesion = useCallback(({ correo, password }: LoginForm) => {
    // Busca el usuario por correo o crea admin temporal si credenciales válidas
    let u = usuarios.find(x => x.correo.toLowerCase() === correo.toLowerCase())
    if (!u) {
      if (esAdminEmail(correo) && password === ADMIN_PASSWORD) {
        const adminUser: Usuario = {
          id: 'ADMIN-0', rut: 'ADMIN-0', nombre: 'Admin', apellidos: 'StoreFit',
          correo, numeroTelefono: '', fechaNacimiento: '', regionId: '', comunaId: '', direccion: '',
          password: ADMIN_PASSWORD, createdAt: new Date().toISOString(),
        }
        // Agrega admin a memoria para subsiguientes operaciones
        setUsuarios(prev => [...prev, adminUser])
        u = adminUser
      } else {
        return { ok: false, mensaje: 'Usuario no encontrado.' }
      }
    }
    if (!u.password) return { ok: false, mensaje: 'El usuario no tiene una contraseña registrada.' }
    if (password !== u.password) return { ok: false, mensaje: 'Contraseña incorrecta.' }
    // Establece la sesión activa en memoria
    setSesion({ correo: u.correo, rut: u.rut, nombre: u.nombre, isAdmin: esAdminEmail(u.correo) })
    return { ok: true }
  }, [usuarios])

  // Acción: cierra la sesión limpiando el estado
  const cerrarSesion = useCallback(() => { setSesion(null) }, [])

  // Valor memorizado del contexto
  const value = useMemo<AuthContextType>(() => ({ usuarios, sesion, registrarUsuario, iniciarSesion, cerrarSesion }), [usuarios, sesion, registrarUsuario, iniciarSesion, cerrarSesion])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook de consumo del contexto de autenticación
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

