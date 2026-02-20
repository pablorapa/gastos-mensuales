import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind CSS de forma optimizada
 * 
 * @param inputs - Clases a combinar
 * @returns String con clases combinadas
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': true })
 * // => 'px-4 py-2 bg-blue-500 text-white'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda
 * 
 * @param amount - Monto a formatear
 * @param currency - Código de moneda (default: 'ARS')
 * @returns String formateado
 * 
 * @example
 * formatCurrency(1234) // => '$1.234'
 */
export function formatCurrency(amount: number, currency: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea una fecha en formato legible
 * 
 * @param dateString - Fecha en formato ISO o YYYY-MM
 * @param format - Tipo de formato ('short', 'long', 'month')
 * @returns Fecha formateada
 * 
 * @example
 * formatDate('2024-03-15') // => '15/03/2024'
 * formatDate('2024-03', 'month') // => 'Marzo 2024'
 */
export function formatDate(dateString: string, format: 'short' | 'long' | 'month' = 'short'): string {
  if (format === 'month') {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
  }

  const date = new Date(dateString);
  
  if (format === 'long') {
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  return date.toLocaleDateString('es-ES');
}

/**
 * Obtiene el mes actual en formato YYYY-MM
 * 
 * @returns Mes actual
 * 
 * @example
 * getCurrentMonth() // => '2024-03'
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * 
 * @returns Fecha actual
 */
export function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Valida si un email está en la lista de usuarios autorizados
 * 
 * @param email - Email a validar
 * @returns true si está autorizado
 */
export function isAuthorizedUser(email: string): boolean {
  const authorizedUsers = process.env.AUTHORIZED_USERS?.split(',').map(e => e.trim()) || [];
  return authorizedUsers.includes(email);
}

/**
 * Genera un array de meses a partir de un mes inicial
 * 
 * @param startMonth - Mes inicial en formato YYYY-MM
 * @param count - Cantidad de meses
 * @returns Array de meses en formato YYYY-MM
 * 
 * @example
 * generateMonths('2024-03', 3) // => ['2024-03', '2024-04', '2024-05']
 */
export function generateMonths(startMonth: string, count: number): string[] {
  const [year, month] = startMonth.split('-').map(Number);
  const months: string[] = [];

  for (let i = 0; i < count; i++) {
    const date = new Date(year, month - 1 + i, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
  }

  return months;
}

/**
 * Calcula el monto que cada persona debe pagar para equilibrar
 * 
 * @param totalManuel - Total pagado por Manuel
 * @param totalPablo - Total pagado por Pablo
 * @returns Objeto con deudor y monto a compensar
 * 
 * @example
 * calculateDebt(150, 100)
 * // => { deudor: 'Pablo', montoACompensar: 25 }
 */
export function calculateDebt(totalManuel: number, totalPablo: number) {
  const diferencia = totalManuel - totalPablo;
  const deudor = diferencia > 0 ? 'Pablo' : diferencia < 0 ? 'Manuel' : null;
  //const montoACompensar = Math.abs(diferencia) / 2;
  const montoACompensar = Math.abs(diferencia);

  return { deudor, montoACompensar, diferencia };
}

/**
 * Formatea un valor numérico para mostrar en inputs con separadores de miles (puntos)
 * Solo números enteros, sin decimales
 * 
 * @param value - Número a formatear
 * @returns String formateado (ej: "1.234")
 * 
 * @example
 * formatNumberInput(1234) // => "1.234"
 * formatNumberInput(123456) // => "123.456"
 */
export function formatNumberInput(value: number | string): string {
  if (!value && value !== 0) return '';
  
  let num: number;
  
  if (typeof value === 'string') {
    num = parseInt(value, 10) || 0;
  } else {
    num = Math.round(value); // Redondear a entero
  }
  
  if (isNaN(num)) return '';
  
  // Agregar separadores de miles con puntos
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parsea un valor formateado del input (con puntos) a número entero
 * 
 * @param value - String formateado (ej: "1.234")
 * @returns Número entero parseado (1234)
 * 
 * @example
 * parseNumberInput("1.234") // => 1234
 */
export function parseNumberInput(value: string): number {
  if (!value) return 0;
  
  // Remover puntos (separadores de miles)
  const cleaned = value.replace(/\./g, '');
  return parseInt(cleaned, 10) || 0;
}
