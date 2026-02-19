import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { initializeSpreadsheet } from '@/lib/googleSheets';

/**
 * POST /api/init
 * Inicializa el spreadsheet de Google Sheets con las hojas necesarias
 * 
 * @returns {Object} { success: true } | { error: string }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await initializeSpreadsheet();

    return NextResponse.json({ 
      success: true,
      message: 'Spreadsheet inicializado correctamente'
    });
  } catch (error) {
    console.error('Error al inicializar spreadsheet:', error);
    return NextResponse.json(
      { error: 'Error al inicializar spreadsheet' },
      { status: 500 }
    );
  }
}
