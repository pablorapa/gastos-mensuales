import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { obtenerGastosSimples } from '@/lib/googleSheets';

/**
 * GET /api/gastos/todos
 * Obtiene TODOS los gastos registrados (sin filtro de mes)
 * 
 * @returns {Object} { gastos: [] }
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const gastosSimples = await obtenerGastosSimples();

    return NextResponse.json({
      gastos: gastosSimples,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener gastos', details: String(error) },
      { status: 500 }
    );
  }
}
