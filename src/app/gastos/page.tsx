'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GastoSimple, Persona } from '@/types';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

/**
 * Página de listado de todos los gastos con filtro por persona
 */
export default function GastosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gastos, setGastos] = useState<GastoSimple[]>([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState<Persona>('Pablo');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      cargarGastos();
    }
  }, [status]);

  const cargarGastos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gastos/todos');
      if (response.ok) {
        const data = await response.json();
        // Ordenar por createdAt descendente (más recientes primero)
        const gastosOrdenados = (data.gastos || []).sort(
          (a: GastoSimple, b: GastoSimple) =>
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        setGastos(gastosOrdenados);
      }
    } catch (error) {
      console.error('Error al cargar gastos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return <Loading />;
  }

  // Filtrar gastos por persona seleccionada
  const gastosFiltrados = gastos.filter(g => g.persona === personaSeleccionada);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Listado de Gastos</h1>
            <Link href="/dashboard">
              <Button variant="secondary" className="text-sm">
                Volver al Inicio
              </Button>
            </Link>
          </div>

          {/* Selector de Persona */}
          <div className="flex gap-3">
            {(['Pablo', 'Manuel'] as const).map(persona => (
              <button
                key={persona}
                onClick={() => setPersonaSeleccionada(persona)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  personaSeleccionada === persona
                    ? persona === 'Pablo'
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                    : persona === 'Pablo'
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                {persona === 'Manuel' ? 'Manu' : persona}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <Loading />
        ) : gastosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-600 font-medium">
              No hay gastos registrados para {personaSeleccionada}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Total: <span className="font-semibold">{gastosFiltrados.length}</span> gasto(s)
            </p>
            {gastosFiltrados.map(gasto => (
              <div
                key={gasto.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow gap-3 sm:gap-4"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{gasto.concepto}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(gasto.fecha)}
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900 flex-shrink-0">
                  {formatCurrency(gasto.monto)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
