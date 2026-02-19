/**
 * Tipos de datos para la aplicación de gastos compartidos
 */

/**
 * Personas que pueden registrar gastos
 */
export type Persona = 'Manuel' | 'Pablo';

/**
 * Representa un gasto simple (pago único)
 */
export interface GastoSimple {
  id?: string;
  concepto: string;
  monto: number;
  persona: Persona;
  fecha: string; // ISO 8601 format
  createdAt?: string;
}

/**
 * Representa un gasto en cuotas
 */
export interface GastoCuotas {
  id?: string;
  concepto: string;
  montoTotal: number;
  cantidadCuotas: number;
  montoPorCuota: number;
  mesInicio: string; // YYYY-MM format
  reintegro?: number; // Monto de reintegro (opcional)
  reintegroPorcentaje?: number; // Porcentaje de reintegro (opcional)
  persona: Persona;
  fecha: string;
  createdAt?: string;
}

/**
 * Representa una cuota mensual individual
 */
export interface CuotaMensual {
  id?: string;
  gastoId: string;
  concepto: string;
  mes: string; // YYYY-MM format
  numeroCuota: number;
  montoCuota: number;
  montoOriginal: number;
  reintegroAplicado: number;
  persona: Persona;
  createdAt?: string;
}

/**
 * Balance mensual entre las dos personas
 */
export interface Balance {
  mes: string; // YYYY-MM format
  totalManuel: number;
  totalPablo: number;
  diferencia: number;
  deudor: Persona | null;
  montoACompensar: number;
  gastosSimples: {
    Manuel: number;
    Pablo: number;
  };
  gastosCuotas: {
    Manuel: number;
    Pablo: number;
  };
}

/**
 * Resumen general de gastos
 */
export interface ResumenGeneral {
  totalManuel: number;
  totalPablo: number;
  diferencia: number;
  deudor: Persona | null;
  montoACompensar: number;
  ultimaActualizacion: string;
}

/**
 * Datos de sesión del usuario
 */
export interface Usuario {
  id: string;
  name: string;
  email: string;
  image?: string;
}
