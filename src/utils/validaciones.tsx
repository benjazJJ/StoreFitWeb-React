//Validaciones generales

export const EMAIL_PERMITIDO = [
  "duocuc.cl",
  "profesor.duoc.cl",
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com"
];

const limpiar = (s: string): string => s.trim().toLowerCase();

export const requerido = (v: string) => limpiar(v) !== "";
export const longitudMaxima = (v: string, n: number) => limpiar(v).length <= n;
export const longitudMinima = (v: string, n: number) => limpiar(v).length >= n;


//Validacion de que el correo esté dentro de los permitidos en EMAIL_PERMITIDO
export function dominioCorreoValido(correo: string) {
  const m = limpiar(correo).toLowerCase().match(/@([^@]+)$/);
  if (!m) return false;
  const dominio = m[1];
  return EMAIL_PERMITIDO.some(
    d => dominio === d || dominio.endsWith("." + d)
  );
}

//Validamos que el rut sea chileno y con digito verificador
export function rutValido(rut: string) {
  const clean = rut.replace(/[.\-]/g, "").toUpperCase().trim();
  if (clean.length < 2) return false;

  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);

  // Solo números en el cuerpo
  if (!/^\d+$/.test(cuerpo)) return false;
  // DV válido: número o K
  if (!/^[0-9K]$/.test(dv)) return false;

  let suma = 0;
  let mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }

  const resto = 11 - (suma % 11);
  const dvCalc = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);

  return dvCalc === dv;
}

// Verifica si el RUT tiene el formato correcto (XX.XXX.XXX-X)
export function rutFormatoValido(rut: string) {
  return /^\d{1,2}(?:\.\d{3})*-[0-9Kk]$/.test(rut.trim());
}

// Dar formato a un RUT (agrega puntos y guión)
export function formatearRut(rut: string): string {
  // Limpiar el RUT de cualquier formato previo
  const clean = rut.replace(/[^\dKk]/g, "");
  if (clean.length === 0) return "";
  
  // Separar cuerpo y dígito verificador
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  // Agregar puntos al cuerpo
  const formatted = body
    .split("")
    .reverse()
    .reduce((acc, digit, i) => {
      if (i > 0 && i % 3 === 0) return digit + "." + acc;
      return digit + acc;
    }, "");
  
  // Si tenemos DV, agregarlo con guión
  return dv ? `${formatted}-${dv}` : formatted;
}

// Valida el RUT y devuelve mensaje específico según el error
export function validarRut(rut: string): string | undefined {
  if (!rut || !rut.trim()) return "El RUT es obligatorio.";
  
  if (!rutFormatoValido(rut)) {
    // Identificar qué falta en el formato
    if (!rut.includes(".")) return "Falta agregar los puntos (Ej: 12.345.678-9)";
    if (!rut.includes("-")) return "Falta agregar el guión (Ej: 12.345.678-9)";
    return "Formato incorrecto. Debe ser como 12.345.678-9";
  }
  
  if (!rutValido(rut)) {
    return "El dígito verificador no es válido";
  }
  
  return undefined;
}


//Validar contraseña y devolver mensaje específico
export function validarPassword(pass: string): string | undefined {
  if (!pass || !pass.trim()) return "La contraseña es obligatoria";
  if (!longitudMinima(pass, 4)) return "Debe tener al menos 4 caracteres";
  if (!longitudMaxima(pass, 10)) return "Debe tener máximo 10 caracteres";
  return undefined;
}

// Validar correo y devolver mensaje específico
export function validarCorreo(correo: string): string | undefined {
  if (!correo || !correo.trim()) return "El correo es obligatorio";
  if (!correo.includes("@")) return "Debe incluir un @";
  if (!dominioCorreoValido(correo)) {
    return `Dominio no permitido. Use: ${EMAIL_PERMITIDO.join(", ")}`;
  }
  return undefined;
}

// Validar teléfono (formato chileno)
export function validarTelefono(tel: string): string | undefined {
  if (!tel || !tel.trim()) return "El teléfono es obligatorio";
  
  // Limpiar el número de espacios y caracteres especiales
  const clean = tel.replace(/[\s\-\(\)]/g, "");
  
  if (!/^\+?56\d{9}$/.test(clean)) {
    if (!tel.startsWith("+56")) return "Debe comenzar con +56";
    if (clean.length !== 11) return "Debe tener 9 dígitos después del +56";
    return "Formato inválido. Use: +56 9 XXXX XXXX";
  }
  
  return undefined;
}

// Validar nombre/apellido
export function validarNombre(nombre: string, campo = "nombre"): string | undefined {
  if (!nombre || !nombre.trim()) return `El ${campo} es obligatorio`;
  if (!longitudMaxima(nombre, 100)) return `El ${campo} es demasiado largo (máx. 100)`;
  if (!/^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/.test(nombre)) {
    return `El ${campo} solo debe contener letras`;
  }
  return undefined;
}

//Contraseña válida (para compatibilidad)
export const passwordValida = (v: string) =>
  longitudMinima(v, 4) && longitudMaxima(v, 10);
