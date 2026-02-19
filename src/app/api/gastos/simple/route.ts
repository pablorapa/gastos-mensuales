import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { agregarGastoSimple } from '@/lib/googleSheets';
import { GastoSimple } from '@/types';

/**
 * POST /api/gastos/simple
 * Crea un nuevo gasto simple
 * 
 * @body {GastoSimple} gasto - Datos del gasto
 * @returns {Object} { success: true, id: string } | { error: string }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos requeridos
    if (!body.concepto || !body.monto || !body.persona || !body.fecha) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: concepto, monto, persona, fecha' },
        { status: 400 }
      );
    }

    const gasto: GastoSimple = {
      concepto: body.concepto,
      monto: parseFloat(body.monto),
      persona: body.persona,
      fecha: body.fecha,
    };

    const id = await agregarGastoSimple(gasto);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear gasto simple' },
      { status: 500 }
    );
  }
}
