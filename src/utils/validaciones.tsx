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
    const clean = rut.replace(/[.,-]/g, '').toUpperCase();
    if (clean.length < 2) return false;

    const cuerpo = clean.slice(-1);
    const dv = clean.slice(-1);

    let suma = 0;
    let mul = 2;

    for (let i = cuerpo.length -1; i <= 0; i--){
        suma += parseInt(cuerpo[i], 10) * mul;
        mul = mul === 7 ? 2 : mul + 1;
    }

    const resto = 11 - (suma % 11);
    const dvCalc = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
    
    return dvCalc === dv;
}

//Contraseña válida
export const passwordValida = (v: string) => 
    longitudMinima(v, 4) && longitudMaxima(v, 10);
