import { google } from 'googleapis';
import { GastoSimple, GastoCuotas, CuotaMensual, BalancesByType, BalanceDetalle } from '@/types';

/**
 * Obtiene las credenciales del service account de Google.
 * Soporta tres estrategias (en orden de prioridad):
 *  1. GOOGLE_SERVICE_ACCOUNT_JSON  → JSON completo en base64 (recomendado para Vercel)
 *  2. GOOGLE_SERVICE_ACCOUNT_JSON  → JSON plano (string)
 *  3. GOOGLE_SHEETS_CLIENT_EMAIL + GOOGLE_SHEETS_PRIVATE_KEY por separado
 */
function getCredentials(): { client_email: string; private_key: string } {
  const jsonEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (jsonEnv) {
    try {
      // Intentar base64 primero
      const decoded = Buffer.from(jsonEnv, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed.client_email && parsed.private_key) {
        console.log('[DEBUG] Credenciales cargadas desde GOOGLE_SERVICE_ACCOUNT_JSON (base64)');
        return { client_email: parsed.client_email, private_key: parsed.private_key };
      }
    } catch {
      // No era base64 válido, intentar como JSON plano
    }

    try {
      const parsed = JSON.parse(jsonEnv);
      if (parsed.client_email && parsed.private_key) {
        console.log('[DEBUG] Credenciales cargadas desde GOOGLE_SERVICE_ACCOUNT_JSON (JSON plano)');
        return { client_email: parsed.client_email, private_key: parsed.private_key };
      }
    } catch {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON no es un JSON válido ni base64 válido');
    }
  }

  // Fallback: variables separadas
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

  if (!privateKey || !clientEmail) {
    throw new Error(
      'Faltan credenciales. Define GOOGLE_SERVICE_ACCOUNT_JSON (recomendado) ' +
      'o GOOGLE_SHEETS_CLIENT_EMAIL + GOOGLE_SHEETS_PRIVATE_KEY'
    );
  }

  // Normalizar saltos de línea (soporta \n literal, \\n escapado y _SALTO_LINEA_)
  privateKey = privateKey
    .replace(/_SALTO_LINEA_/g, '\n')
    .replace(/\\n/g, '\n')
    .trim();

  if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
    throw new Error('GOOGLE_SHEETS_PRIVATE_KEY no tiene el formato PEM correcto');
  }

  console.log('[DEBUG] Credenciales cargadas desde variables separadas. Email:', clientEmail);
  return { client_email: clientEmail, private_key: privateKey };
}

/**
 * Crea un cliente de Google Sheets autenticado.
 * No se cachea a nivel de módulo para evitar tokens expirados en entornos serverless.
 */
function getGoogleSheetsClient() {
  const credentials = getCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * ID del spreadsheet configurado
 */
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

/**
 * Nombres de las hojas en Google Sheets
 */
export const SHEET_NAMES = {
  GASTOS_SIMPLES: 'gastos_simples',
  GASTOS_CUOTAS: 'gastos_cuotas',
  CUOTAS_MENSUALES: 'cuotas_mensuales',
  BALANCES: 'balances',
} as const;

/**
 * Inicializa el spreadsheet creando las hojas necesarias si no existen
 * 
 * @example
 * await initializeSpreadsheet();
 */
export async function initializeSpreadsheet() {
  const sheets = getGoogleSheetsClient();

  try {
    // Obtener hojas existentes
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const existingSheets = response.data.sheets?.map((s: any) => s.properties.title) || [];
    const sheetsToCreate = Object.values(SHEET_NAMES).filter(name => !existingSheets.includes(name));

    if (sheetsToCreate.length === 0) {
      console.log('Todas las hojas ya existen');
      return;
    }

    // Crear hojas faltantes
    const requests = sheetsToCreate.map(title => ({
      addSheet: {
        properties: { title }
      }
    }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests }
    });

    // Inicializar headers
    await initializeHeaders();

    console.log(`Hojas creadas: ${sheetsToCreate.join(', ')}`);
  } catch (error) {
    console.error('Error al inicializar spreadsheet:', error);
    throw error;
  }
}

/**
 * Inicializa los encabezados de cada hoja
 */
async function initializeHeaders() {
  const sheets = getGoogleSheetsClient();

  const headers = {
    [SHEET_NAMES.GASTOS_SIMPLES]: ['ID', 'Fecha', 'Concepto', 'Monto', 'Persona', 'CreatedAt'],
    [SHEET_NAMES.GASTOS_CUOTAS]: ['ID', 'Fecha', 'Concepto', 'MontoTotal', 'CantidadCuotas', 'MontoPorCuota', 'MesInicio', 'Reintegro', 'Persona', 'CreatedAt'],
    [SHEET_NAMES.CUOTAS_MENSUALES]: ['ID', 'GastoID', 'Concepto', 'Mes', 'NumeroCuota', 'MontoCuota', 'MontoOriginal', 'ReintegroAplicado', 'Persona', 'CreatedAt'],
    [SHEET_NAMES.BALANCES]: ['Mes', 'TotalManuel', 'TotalPablo', 'Diferencia', 'Deudor', 'MontoACompensar', 'GastosSimplesManuel', 'GastosSimplesPablo', 'GastosCuotasManuel', 'GastosCuotasPablo', 'UpdatedAt'],
  };

  const updates = Object.entries(headers).map(([sheetName, header]) => ({
    range: `${sheetName}!A1:${String.fromCharCode(64 + header.length)}1`,
    values: [header],
  }));

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates,
    },
  });
}

/**
 * Agrega un gasto simple a Google Sheets
 * 
 * @param gasto - Datos del gasto simple
 * @returns ID del gasto creado
 * 
 * @example
 * const id = await agregarGastoSimple({
 *   concepto: 'Supermercado',
 *   monto: 100,
 *   persona: 'Manuel',
 *   fecha: '2024-03-15'
 * });
 */
export async function agregarGastoSimple(gasto: GastoSimple): Promise<string> {
  const sheets = getGoogleSheetsClient();
  const id = `GS-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const row = [
    id,
    gasto.fecha,
    gasto.concepto,
    gasto.monto,
    gasto.persona,
    createdAt,
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.GASTOS_SIMPLES}!A:F`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });
    return id;
  } catch (error) {
    throw error;
  }
}

/**
 * Agrega un gasto en cuotas y genera las cuotas mensuales correspondientes
 * 
 * @param gasto - Datos del gasto en cuotas
 * @returns ID del gasto creado
 * 
 * @example
 * const id = await agregarGastoCuotas({
 *   concepto: 'Notebook',
 *   montoTotal: 600,
 *   cantidadCuotas: 6,
 *   montoPorCuota: 100,
 *   mesInicio: '2024-03',
 *   reintegro: 180,
 *   persona: 'Pablo',
 *   fecha: '2024-03-15'
 * });
 */
export async function agregarGastoCuotas(gasto: GastoCuotas): Promise<string> {
  const sheets = getGoogleSheetsClient();
  const id = `GC-${Date.now()}`;
  const createdAt = new Date().toISOString();

  // Agregar gasto principal
  const row = [
    id,
    gasto.fecha,
    gasto.concepto,
    gasto.montoTotal,
    gasto.cantidadCuotas,
    gasto.montoPorCuota,
    gasto.mesInicio,
    gasto.reintegro || 0,
    gasto.persona,
    createdAt,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAMES.GASTOS_CUOTAS}!A:J`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [row],
    },
  });

  // Generar cuotas mensuales
  await generarCuotasMensuales(id, gasto);

  return id;
}

/**
 * Genera las cuotas mensuales para un gasto en cuotas, aplicando reintegros progresivamente
 * 
 * @param gastoId - ID del gasto en cuotas
 * @param gasto - Datos del gasto en cuotas
 * 
 * @example
 * // Gasto de 6 cuotas de $100 con reintegro de $180
 * // Cuota 1: $0, Cuota 2: $20, Cuotas 3-6: $100
 */
async function generarCuotasMensuales(gastoId: string, gasto: GastoCuotas) {
  const sheets = getGoogleSheetsClient();
  const cuotas: any[] = [];
  
  let reintegroRestante = gasto.reintegro || 0;
  const [year, month] = gasto.mesInicio.split('-').map(Number);

  for (let i = 0; i < gasto.cantidadCuotas; i++) {
    const cuotaDate = new Date(year, month - 1 + i, 1);
    const mes = `${cuotaDate.getFullYear()}-${String(cuotaDate.getMonth() + 1).padStart(2, '0')}`;
    
    const montoOriginal = gasto.montoPorCuota;
    let reintegroAplicado = 0;
    let montoCuota = montoOriginal;

    if (reintegroRestante > 0) {
      if (reintegroRestante >= montoOriginal) {
        // El reintegro cubre toda la cuota
        reintegroAplicado = montoOriginal;
        montoCuota = 0;
        reintegroRestante -= montoOriginal;
      } else {
        // El reintegro cubre parte de la cuota
        reintegroAplicado = reintegroRestante;
        montoCuota = montoOriginal - reintegroRestante;
        reintegroRestante = 0;
      }
    }

    const cuotaId = `CM-${gastoId}-${i + 1}`;
    cuotas.push([
      cuotaId,
      gastoId,
      gasto.concepto,
      mes,
      i + 1,
      montoCuota,
      montoOriginal,
      reintegroAplicado,
      gasto.persona,
      new Date().toISOString(),
    ]);
  }

  if (cuotas.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.CUOTAS_MENSUALES}!A:J`,
      valueInputOption: 'RAW',
      requestBody: {
        values: cuotas,
      },
    });
  }
}

/**
 * Obtiene todos los gastos simples del mes especificado
 * 
 * @param mes - Mes en formato YYYY-MM
 * @returns Array de gastos simples
 * 
 * @example
 * const gastos = await obtenerGastosSimples('2024-03');
 */
export async function obtenerGastosSimples(mes?: string): Promise<GastoSimple[]> {
  const sheets = getGoogleSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.GASTOS_SIMPLES}!A2:F`,
    });

    const rows = response.data.values || [];

    const gastos = rows
      .filter((row: any[]) => row && row.length >= 5 && row[0] && row[3]) // Filtrar filas incompletas
      .map((row: any[]) => ({
        id: row[0],
        fecha: row[1],
        concepto: row[2],
        monto: parseFloat(row[3]) || 0,
        persona: row[4] as 'Manuel' | 'Pablo',
        createdAt: row[5] || '',
      }));

    if (mes) {
      const filtered = gastos.filter((g: GastoSimple) => g.fecha.startsWith(mes));
      return filtered;
    }

    return gastos;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene todas las cuotas mensuales del mes especificado
 * 
 * @param mes - Mes en formato YYYY-MM
 * @returns Array de cuotas mensuales
 * 
 * @example
 * const cuotas = await obtenerCuotasMensuales('2024-03');
 */
export async function obtenerCuotasMensuales(mes: string): Promise<CuotaMensual[]> {
  const sheets = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAMES.CUOTAS_MENSUALES}!A2:J`,
  });

  const rows = response.data.values || [];
  const cuotas = rows
    .filter((row: any[]) => row[0] && row[1] && row[3] === mes) // Filtrar filas incompletas y por mes
    .map((row: any[]) => ({
      id: row[0],
      gastoId: row[1],
      concepto: row[2],
      mes: row[3],
      numeroCuota: parseInt(row[4]) || 0,
      montoCuota: parseFloat(row[5]) || 0,
      montoOriginal: parseFloat(row[6]) || 0,
      reintegroAplicado: parseFloat(row[7]) || 0,
      persona: row[8] as 'Manuel' | 'Pablo',
      createdAt: row[9] || '',
    }));

  return cuotas;
}

/**
 * Calcula el balance separado por tipo de gasto (simples vs cuotas)
 * 
 * IMPORTANTE:
 * - Gastos Simples: Se mantienen históricos (acumulativos de todos los meses)
 * - Gastos en Cuotas: Solo las cuotas del mes seleccionado
 * 
 * Esto permite ver un balance histórico de los gastos mensuales vs
 * el balance mensual de las cuotas
 * 
 * @param mes - Mes en formato YYYY-MM (solo afecta a las cuotas)
 * @returns BalancesByType con balance acumulado de simples y cuotas del mes
 * 
 * @example
 * const balances = await calcularBalanceByType('2024-03');
 * // balances.simples = TODOS los gastos mensuales históricos
 * // balances.cuotas = solo cuotas de marzo 2024
 */
export async function calcularBalanceByType(mes: string): Promise<BalancesByType> {
  // Obtener TODOS los gastos simples (sin filtrar por mes)
  const gastosSimples = await obtenerGastosSimples();
  // Obtener solo las cuotas del mes seleccionado
  const cuotasMensuales = await obtenerCuotasMensuales(mes);

  // Cálculo para GASTOS SIMPLES (históricos)
  const gastosManuelSimples = gastosSimples
    .filter(g => g.persona === 'Manuel')
    .reduce((sum, g) => sum + g.monto, 0);

  const gastosPabloSimples = gastosSimples
    .filter(g => g.persona === 'Pablo')
    .reduce((sum, g) => sum + g.monto, 0);

  const totalSimplesManuel = gastosManuelSimples;
  const totalSimplesPablo = gastosPabloSimples;
  const totalGeneralSimples = totalSimplesManuel + totalSimplesPablo;
  const diferenciaSimpeles = totalSimplesManuel - totalSimplesPablo;

  // Cálculo para CUOTAS MENSUALES (solo del mes seleccionado)
  const gastosManuelCuotas = cuotasMensuales
    .filter(c => c.persona === 'Manuel')
    .reduce((sum, c) => sum + c.montoCuota, 0);

  const gastosPabloCuotas = cuotasMensuales
    .filter(c => c.persona === 'Pablo')
    .reduce((sum, c) => sum + c.montoCuota, 0);

  const totalCuotasManuel = gastosManuelCuotas;
  const totalCuotasPablo = gastosPabloCuotas;
  const totalGeneralCuotas = totalCuotasManuel + totalCuotasPablo;
  const diferenciaCuotas = totalCuotasManuel - totalCuotasPablo;

  // Función auxiliar para calcular deudor y monto a compensar
  const calcularDeuda = (diferencia: number, totalGeneral: number): { deudor: ('Manuel' | 'Pablo' | null), montoACompensar: number } => {
    const deudor = diferencia > 0 ? 'Pablo' as const : diferencia < 0 ? 'Manuel' as const : null;
    //const montoACompensar = Math.abs(diferencia) / 2;
    const montoACompensar = Math.abs(diferencia);
    return { deudor, montoACompensar };
  };

  const { deudor: deudorSimples, montoACompensar: montoSimplesCompensar } = 
    calcularDeuda(diferenciaSimpeles, totalGeneralSimples);

  const { deudor: deudorCuotas, montoACompensar: montoCuotasCompensar } = 
    calcularDeuda(diferenciaCuotas, totalGeneralCuotas);

  const balancesByType: BalancesByType = {
    mes,
    simples: {
      totalManuel: totalSimplesManuel,
      totalPablo: totalSimplesPablo,
      diferencia: diferenciaSimpeles,
      deudor: deudorSimples,
      montoACompensar: montoSimplesCompensar,
    },
    cuotas: {
      totalManuel: totalCuotasManuel,
      totalPablo: totalCuotasPablo,
      diferencia: diferenciaCuotas,
      deudor: deudorCuotas,
      montoACompensar: montoCuotasCompensar,
    },
  };

  return balancesByType;
}


