import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { obtenerGastosSimples, obtenerCuotasMensuales } from '@/lib/googleSheets';

/**
 * GET /api/gastos?mes=YYYY-MM
 * Obtiene todos los gastos de un mes específico
 * 
 * @query {string} mes - Mes en formato YYYY-MM (opcional)
 * @returns {Object} { gastosSimples: [], cuotasMensuales: [] }
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mes = searchParams.get('mes');

    if (!mes) {
      return NextResponse.json(
        { error: 'Parámetro mes requerido' },
        { status: 400 }
      );
    }

    const [gastosSimples, cuotasMensuales] = await Promise.all([
      obtenerGastosSimples(mes),
      obtenerCuotasMensuales(mes),
    ]);

    return NextResponse.json({
      gastosSimples,
      cuotasMensuales,
    });
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    return NextResponse.json(
      { error: 'Error al obtener gastos' },
      { status: 500 }
    );
  }
}
