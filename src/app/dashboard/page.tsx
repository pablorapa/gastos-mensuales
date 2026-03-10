'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Loading } from '@/components/ui/Loading';
import { Toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BalanceCard } from '@/components/gastos/BalanceCard';
import { ListaGastos } from '@/components/gastos/ListaGastos';
import { FormularioGastoSimple } from '@/components/gastos/FormularioGastoSimple';
import { FormularioGastoCuotas } from '@/components/gastos/FormularioGastoCuotas';
import { VozModal } from '@/components/gastos/VozModal';
import { GastoSimple, CuotaMensual, BalancesByType } from '@/types';
import { getCurrentMonth, formatDate, getCurrentDate } from '@/lib/utils';

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
  const [balances, setBalances] = useState<BalancesByType | null>(null);
  const [gastosSimples, setGastosSimples] = useState<GastoSimple[]>([]);
  const [cuotasMensuales, setCuotasMensuales] = useState<CuotaMensual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'gasto-simple' | 'gasto-cuotas'>('dashboard');
  const [tabActual, setTabActual] = useState<'simples' | 'cuotas'>('simples');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [mostrarVoz, setMostrarVoz] = useState(false);
  const monthInputRef = useRef<HTMLInputElement>(null);

  const personaActual = session?.user?.email?.toLowerCase().includes('pablo') ? 'Pablo' as const : 'Manuel' as const;

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
        setBalances(balanceData);
      }

      if (gastosRes.ok) {
        const gastosData = await gastosRes.json();
        setGastosSimples(gastosData.gastosSimples || []);
        setCuotasMensuales(gastosData.cuotasMensuales || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
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
        {/* Toast Notification */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        {mostrarVoz && (
          <VozModal
            persona={personaActual}
            onConfirmar={async (concepto, monto) => {
              setMostrarVoz(false);
              try {
                const response = await fetch('/api/gastos/simple', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    concepto,
                    monto: parseInt(monto.replace(/\./g, ''), 10),
                    persona: personaActual,
                    fecha: getCurrentDate(),
                  }),
                });
                if (!response.ok) throw new Error();
                setToast({ message: 'Gasto agregado con éxito', type: 'success' });
                setTabActual('simples');
                cargarDatos();
              } catch {
                setToast({ message: 'Error al guardar el gasto', type: 'error' });
              }
            }}
            onCerrar={() => setMostrarVoz(false)}
          />
        )}
        {vistaActual === 'dashboard' ? (
          <div className="space-y-6">
            {/* Selector de mes - Compacto */}
            <div className="flex items-center justify-center gap-3 bg-white rounded-lg shadow-md p-3">
              <button
                onClick={() => cambiarMes('anterior')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Mes anterior"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <p className="text-lg font-semibold text-gray-900 min-w-fit">
                {formatDate(mesActual, 'month')}
              </p>
              
              <button
                onClick={() => monthInputRef.current?.showPicker()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Seleccionar mes"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              <button
                onClick={() => cambiarMes('siguiente')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Mes siguiente"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <input
                ref={monthInputRef}
                type="month"
                value={mesActual}
                onChange={e => setMesActual(e.target.value)}
                className="hidden"
              />
            </div>

            {/* Tab switcher */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setTabActual('simples')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tabActual === 'simples'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Gastos comunes
              </button>
              <button
                onClick={() => setTabActual('cuotas')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tabActual === 'cuotas'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Gastos en cuotas
              </button>
            </div>

            {isLoading ? (
              <Loading />
            ) : tabActual === 'simples' ? (
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => setVistaActual('gasto-simple')}
                    className="flex-1 h-14"
                  >
                    + Agregar gasto común
                  </Button>
                  <button
                    onClick={() => setMostrarVoz(true)}
                    title="Cargar por voz"
                    className="h-14 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="9" y="2" width="6" height="11" rx="3" />
                      <path d="M5 10a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.92V19h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2.08A7 7 0 0 1 5 10z" />
                    </svg>
                  </button>
                </div>
                {balances && (
                  <BalanceCard
                    balance={balances.simples}
                    title="Balance gastos comunes"
                    subtitle="Acumulado histórico"
                  />
                )}
                <Card title="Gastos comunes del mes">
                  <ListaGastos
                    gastosSimples={gastosSimples}
                    cuotasMensuales={[]}
                  />
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                <Button
                  variant="outline"
                  onClick={() => setVistaActual('gasto-cuotas')}
                  className="w-full h-14"
                >
                  + Agregar gasto en cuotas
                </Button>
                {balances && (
                  <BalanceCard
                    balance={balances.cuotas}
                    title="Balance cuotas"
                    subtitle={formatDate(balances.mes, 'month')}
                  />
                )}
                <Card title="Cuotas del mes">
                  <ListaGastos
                    gastosSimples={[]}
                    cuotasMensuales={cuotasMensuales}
                  />
                </Card>
              </div>
            )}
          </div>
        ) : vistaActual === 'gasto-simple' ? (
          <div className="max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setVistaActual('dashboard')}
              className="mb-4"
            >
              ← Volver al Inicio
            </Button>
            <Card title="Nuevo gasto común">
              <FormularioGastoSimple
                onSuccess={() => {
                  setToast({ message: 'Gasto agregado con éxito', type: 'success' });
                  setTabActual('simples');
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
              ← Volver al Inicio
            </Button>
            <Card title="Nuevo gasto en cuotas">
              <FormularioGastoCuotas
                onSuccess={() => {
                  setToast({ message: 'Gasto en cuotas agregado con éxito', type: 'success' });
                  setTabActual('cuotas');
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
