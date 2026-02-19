'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BalanceCard } from '@/components/gastos/BalanceCard';
import { ListaGastos } from '@/components/gastos/ListaGastos';
import { FormularioGastoSimple } from '@/components/gastos/FormularioGastoSimple';
import { FormularioGastoCuotas } from '@/components/gastos/FormularioGastoCuotas';
import { Balance, GastoSimple, CuotaMensual } from '@/types';
import { getCurrentMonth, formatDate } from '@/lib/utils';

/**
 * Dashboard principal de la aplicación
 * 
 * Permite:
 * - Ver balance del mes actual
 * - Registrar gastos simples y en cuotas
 * - Ver listado de todos los gastos
 * - Cambiar de mes
 */
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mesActual, setMesActual] = useState(getCurrentMonth());
  const [balance, setBalance] = useState<Balance | null>(null);
  const [gastosSimples, setGastosSimples] = useState<GastoSimple[]>([]);
  const [cuotasMensuales, setCuotasMensuales] = useState<CuotaMensual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'gasto-simple' | 'gasto-cuotas'>('dashboard');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      cargarDatos();
    }
  }, [status, mesActual]);

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [balanceRes, gastosRes] = await Promise.all([
        fetch(`/api/balance?mes=${mesActual}`),
        fetch(`/api/gastos?mes=${mesActual}`),
      ]);

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }

      if (gastosRes.ok) {
        const gastosData = await gastosRes.json();
        setGastosSimples(gastosData.gastosSimples || []);
        setCuotasMensuales(gastosData.cuotasMensuales || []);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return <Loading />;
  }

  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
    const [year, month] = mesActual.split('-').map(Number);
    const fecha = new Date(year, month - 1, 1);
    
    if (direccion === 'anterior') {
      fecha.setMonth(fecha.getMonth() - 1);
    } else {
      fecha.setMonth(fecha.getMonth() + 1);
    }
    
    const nuevoMes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    setMesActual(nuevoMes);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gastos Compartidos</h1>
                <p className="text-sm text-gray-600">{session?.user?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {vistaActual === 'dashboard' ? (
          <div className="space-y-8">
            {/* Selector de mes */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cambiarMes('anterior')}
                    className="w-full md:w-auto"
                  >
                    ← Anterior
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {formatDate(mesActual, 'month')}
                  </p>
                  <input
                    type="month"
                    value={mesActual}
                    onChange={e => setMesActual(e.target.value)}
                    className="mt-2 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cambiarMes('siguiente')}
                    className="w-full md:w-auto"
                  >
                    Siguiente →
                  </Button>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="primary"
                onClick={() => setVistaActual('gasto-simple')}
                className="h-16"
              >
                + Agregar Gasto Simple
              </Button>
              <Button
                variant="outline"
                onClick={() => setVistaActual('gasto-cuotas')}
                className="h-16"
              >
                + Agregar Gasto en Cuotas
              </Button>
            </div>

            {isLoading ? (
              <Loading />
            ) : (
              <>
                {/* Balance */}
                {balance && <BalanceCard balance={balance} />}

                {/* Lista de gastos */}
                <Card title="Gastos del Mes">
                  <ListaGastos
                    gastosSimples={gastosSimples}
                    cuotasMensuales={cuotasMensuales}
                  />
                </Card>
              </>
            )}
          </div>
        ) : vistaActual === 'gasto-simple' ? (
          <div className="max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setVistaActual('dashboard')}
              className="mb-4"
            >
              ← Volver al Dashboard
            </Button>
            <Card title="Nuevo Gasto Simple">
              <FormularioGastoSimple
                onSuccess={() => {
                  setVistaActual('dashboard');
                  cargarDatos();
                }}
              />
            </Card>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setVistaActual('dashboard')}
              className="mb-4"
            >
              ← Volver al Dashboard
            </Button>
            <Card title="Nuevo Gasto en Cuotas">
              <FormularioGastoCuotas
                onSuccess={() => {
                  setVistaActual('dashboard');
                  cargarDatos();
                }}
              />
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
