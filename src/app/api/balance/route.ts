import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calcularBalanceByType } from '@/lib/googleSheets';

/**
 * GET /api/balance?mes=YYYY-MM
 * Obtiene el balance separado por tipo de gasto (simples vs cuotas) para un mes específico
 * 
 * @query {string} mes - Mes en formato YYYY-MM
 * @returns {BalancesByType} Balances separados para gastos simples y cuotas
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

    const balances = await calcularBalanceByType(mes);

    return NextResponse.json(balances);
  } catch (error) {
    console.error('Error al obtener balance:', error);
    return NextResponse.json(
      { error: 'Error al obtener balance' },
      { status: 500 }
    );
  }
}
