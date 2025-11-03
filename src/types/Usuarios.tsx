export interface RegistroForm{

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
}

export interface Usuario extends RegistroForm {
    id: string;
    createAt: string; // fecha de creacion
}

export interface LoginForm {
    correo: string;
    password: string;
}