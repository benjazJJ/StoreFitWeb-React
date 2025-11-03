// Servicio de "autenticación" basado en localStorage.
// Guarda usuarios, permite registrar/iniciar/cerrar sesión.

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
    password?: string;     
};

export type Usuario = RegistroForm & {
    id: string;               // usamos el RUT como id
    createdAt: string;        
};

export type LoginForm = {
    correo: string;
    password: string;
};

export type Sesion = {
    correo: string;
    rut: string;
    nombre: string;
};

const LS_USUARIOS = "storefit_usuarios";
const LS_SESION = "storefit_sesion";

const leerUsuarios = (): Usuario[] =>
    JSON.parse(localStorage.getItem(LS_USUARIOS) || "[]");

const escribirUsuarios = (arr: Usuario[]) =>
    localStorage.setItem(LS_USUARIOS, JSON.stringify(arr));

const normalizarRut = (rut: string) => rut.replace(/[.\-]/g, "").toUpperCase();

export function registrarUsuario(input: RegistroForm): { ok: boolean; mensaje?: string } {
    const usuarios = leerUsuarios();

    if (usuarios.some(u => normalizarRut(u.rut) === normalizarRut(input.rut))) {
        return { ok: false, mensaje: "El RUT ya está registrado." };
    }
    if (usuarios.some(u => u.correo.toLowerCase() === input.correo.toLowerCase())) {
        return { ok: false, mensaje: "El correo ya está registrado." };
    }
    if (usuarios.some(u => u.numeroTelefono === input.numeroTelefono)) {
        return { ok: false, mensaje: "El número de teléfono ya está registrado." };
    }

    // Asegurarnos de que el usuario registre una contraseña válida.
    // Antes el código permitía no enviar password y el login usaba "1234" por defecto.
    if (!input.password || input.password.trim().length < 4) {
        return { ok: false, mensaje: "La contraseña es obligatoria y debe tener al menos 4 caracteres." };
    }

    const nuevo: Usuario = {
        ...input,
        id: input.rut,
        createdAt: new Date().toISOString(),
    };

    usuarios.push(nuevo);
    escribirUsuarios(usuarios);
    return { ok: true };
}

export function iniciarSesion({ correo, password }: LoginForm): { ok: boolean; mensaje?: string } {
    const usuarios = leerUsuarios();
    const u = usuarios.find(x => x.correo.toLowerCase() === correo.toLowerCase());

    if (!u) return { ok: false, mensaje: "Usuario no encontrado." };

    // Verificamos la contraseña: debe coincidir con la registrada.
    if (!u.password) {
        return { ok: false, mensaje: "El usuario no tiene una contraseña registrada." };
    }

    if (password !== u.password) {
        return { ok: false, mensaje: "Contraseña incorrecta." };
    }

    const sesion: Sesion = { correo: u.correo, rut: u.rut, nombre: u.nombre };
    localStorage.setItem(LS_SESION, JSON.stringify(sesion));
    return { ok: true };
}

export function cerrarSesion() {
    localStorage.removeItem(LS_SESION);
}

export function obtenerSesion(): Sesion | null {
    const raw = localStorage.getItem(LS_SESION);
    return raw ? (JSON.parse(raw) as Sesion) : null;
}
