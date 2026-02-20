import { google } from 'googleapis';
import { GastoSimple, GastoCuotas, CuotaMensual, Balance, BalancesByType, BalanceDetalle } from '@/types';

/**
 * Cliente de Google Sheets configurado con credenciales
 */
let sheetsClient: any = null;

/**
 * Inicializa el cliente de Google Sheets con las credenciales de service account
 * 
 * @returns Cliente de Google Sheets autenticado
 * @throws Error si faltan las credenciales necesarias
 */
function getGoogleSheetsClient() {
  if (sheetsClient) return sheetsClient;

  let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error('Faltan credenciales de Google Sheets. Verifica GOOGLE_SHEETS_PRIVATE_KEY y GOOGLE_SHEETS_CLIENT_EMAIL');
  }

  // Decodificar desde Base64
  try {
    privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
  } catch (e) {
    // Si no está en Base64, intentar parsear como está
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
  }
  
  // Asegurar que empieza y termina correctamente
  privateKey = privateKey.trim();

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
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
 * Obtiene todos los gastos en cuotas
 * 
 * @returns Array de gastos en cuotas
 */
export async function obtenerGastosCuotas(): Promise<GastoCuotas[]> {
  const sheets = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAMES.GASTOS_CUOTAS}!A2:J`,
  });

  const rows = response.data.values || [];
  return rows
    .filter((row: any[]) => row[0] && row[1] && row[2] && row[3]) // Filtrar filas incompletas
    .map((row: any[]) => ({
      id: row[0],
      fecha: row[1],
      concepto: row[2],
      montoTotal: parseFloat(row[3]) || 0,
      cantidadCuotas: parseInt(row[4]) || 0,
      montoPorCuota: parseFloat(row[5]) || 0,
      mesInicio: row[6],
      reintegro: parseFloat(row[7]) || 0,
      persona: row[8] as 'Manuel' | 'Pablo',
      createdAt: row[9] || '',
    }));
}

/**
 * Calcula y guarda el balance del mes especificado
 * 
 * @param mes - Mes en formato YYYY-MM
 * @returns Balance calculado
 * 
 * @example
 * const balance = await calcularBalance('2024-03');
 */
export async function calcularBalance(mes: string): Promise<Balance> {
  const gastosSimples = await obtenerGastosSimples(mes);
  const cuotasMensuales = await obtenerCuotasMensuales(mes);

  const gastosManuelSimples = gastosSimples
    .filter(g => g.persona === 'Manuel')
    .reduce((sum, g) => sum + g.monto, 0);

  const gastosPabloSimples = gastosSimples
    .filter(g => g.persona === 'Pablo')
    .reduce((sum, g) => sum + g.monto, 0);

  const gastosManuelCuotas = cuotasMensuales
    .filter(c => c.persona === 'Manuel')
    .reduce((sum, c) => sum + c.montoCuota, 0);

  const gastosPabloCuotas = cuotasMensuales
    .filter(c => c.persona === 'Pablo')
    .reduce((sum, c) => sum + c.montoCuota, 0);

  const totalManuel = gastosManuelSimples + gastosManuelCuotas;
  const totalPablo = gastosPabloSimples + gastosPabloCuotas;
  
  // Cada persona debe pagar la mitad del total
  const totalGeneral = totalManuel + totalPablo;
  const mitad = totalGeneral / 2;
  
  const diferencia = totalManuel - totalPablo;
  const deudor = diferencia > 0 ? 'Pablo' : diferencia < 0 ? 'Manuel' : null;
  //const montoACompensar = Math.abs(diferencia) / 2;
  const montoACompensar = Math.abs(diferencia);

  const balance: Balance = {
    mes,
    totalManuel,
    totalPablo,
    diferencia,
    deudor,
    montoACompensar,
    gastosSimples: {
      Manuel: gastosManuelSimples,
      Pablo: gastosPabloSimples,
    },
    gastosCuotas: {
      Manuel: gastosManuelCuotas,
      Pablo: gastosPabloCuotas,
    },
  };

  // Guardar balance en Google Sheets
  await guardarBalance(balance);

  return balance;
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

/**
 * Guarda un balance en Google Sheets
 * 
 * @param balance - Balance a guardar
 */
async function guardarBalance(balance: Balance) {
  const sheets = getGoogleSheetsClient();

  // Buscar si ya existe un balance para este mes
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAMES.BALANCES}!A2:K`,
  });

  const rows = response.data.values || [];
  const existingRowIndex = rows.findIndex((row: any[]) => row[0] === balance.mes);

  const row = [
    balance.mes,
    balance.totalManuel,
    balance.totalPablo,
    balance.diferencia,
    balance.deudor || '',
    balance.montoACompensar,
    balance.gastosSimples.Manuel,
    balance.gastosSimples.Pablo,
    balance.gastosCuotas.Manuel,
    balance.gastosCuotas.Pablo,
    new Date().toISOString(),
  ];

  if (existingRowIndex >= 0) {
    // Actualizar fila existente
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.BALANCES}!A${existingRowIndex + 2}:K${existingRowIndex + 2}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });
  } else {
    // Agregar nueva fila
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.BALANCES}!A:K`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });
  }
}

/**
 * Obtiene el balance de un mes específico
 * 
 * @param mes - Mes en formato YYYY-MM
 * @returns Balance del mes o null si no existe
 */
export async function obtenerBalance(mes: string): Promise<Balance | null> {
  const sheets = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAMES.BALANCES}!A2:K`,
  });

  const rows = response.data.values || [];
  const row = rows.find((r: any[]) => r[0] === mes);

  if (!row) return null;

  return {
    mes: row[0],
    totalManuel: parseFloat(row[1]),
    totalPablo: parseFloat(row[2]),
    diferencia: parseFloat(row[3]),
    deudor: row[4] as 'Manuel' | 'Pablo' | null,
    montoACompensar: parseFloat(row[5]),
    gastosSimples: {
      Manuel: parseFloat(row[6]),
      Pablo: parseFloat(row[7]),
    },
    gastosCuotas: {
      Manuel: parseFloat(row[8]),
      Pablo: parseFloat(row[9]),
    },
  };
}
