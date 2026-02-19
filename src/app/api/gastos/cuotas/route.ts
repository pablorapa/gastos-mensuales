import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { agregarGastoCuotas } from '@/lib/googleSheets';
import { GastoCuotas } from '@/types';

/**
 * POST /api/gastos/cuotas
 * Crea un nuevo gasto en cuotas
 * 
 * @body {GastoCuotas} gasto - Datos del gasto en cuotas
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
    if (!body.concepto || !body.montoTotal || !body.cantidadCuotas || 
        !body.montoPorCuota || !body.mesInicio || !body.persona || !body.fecha) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    const gasto: GastoCuotas = {
      concepto: body.concepto,
      montoTotal: parseFloat(body.montoTotal),
      cantidadCuotas: parseInt(body.cantidadCuotas),
      montoPorCuota: parseFloat(body.montoPorCuota),
      mesInicio: body.mesInicio,
      reintegro: body.reintegro ? parseFloat(body.reintegro) : undefined,
      persona: body.persona,
      fecha: body.fecha,
    };

    const id = await agregarGastoCuotas(gasto);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error al crear gasto en cuotas:', error);
    return NextResponse.json(
      { error: 'Error al crear gasto en cuotas' },
      { status: 500 }
    );
  }
}
