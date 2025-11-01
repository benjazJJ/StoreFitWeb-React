export function formatearCLP(valor: number): string {
  try {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor)
  } catch {
    return `$${valor}`
  }
}
