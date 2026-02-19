import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { calcularBalance, obtenerBalance } from '@/lib/googleSheets';

/**
 * GET /api/balance?mes=YYYY-MM
 * Obtiene el balance de un mes específico
 * 
 * @query {string} mes - Mes en formato YYYY-MM
 * @returns {Balance} Balance del mes
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

    const balance = await calcularBalance(mes);

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Error al obtener balance:', error);
    return NextResponse.json(
      { error: 'Error al obtener balance' },
      { status: 500 }
    );
  }
}
