'use client';

import React from 'react';
import { GastoSimple, CuotaMensual } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ListaGastosProps {
  gastosSimples: GastoSimple[];
  cuotasMensuales: CuotaMensual[];
}

/**
 * Lista todos los gastos del mes (simples y cuotas)
 * 
 * @param gastosSimples - Array de gastos simples
 * @param cuotasMensuales - Array de cuotas del mes
 * 
 * @example
 * <ListaGastos 
 *   gastosSimples={gastos} 
 *   cuotasMensuales={cuotas} 
 * />
 */
export function ListaGastos({ gastosSimples, cuotasMensuales }: ListaGastosProps) {
  const hayGastos = gastosSimples.length > 0 || cuotasMensuales.length > 0;

  if (!hayGastos) {
    return (
      <div className="text-center py-12 text-gray-500">
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
        <p className="font-medium">No hay gastos registrados este mes</p>
        <p className="text-sm mt-1">Agregá un gasto para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gastos Simples */}
      {gastosSimples.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Gastos Simples ({gastosSimples.length})
          </h3>
          <div className="space-y-2">
            {gastosSimples.map(gasto => (
              <div
                key={gasto.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow gap-2 sm:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{gasto.concepto}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                      gasto.persona === 'Manuel' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {gasto.persona}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDate(gasto.fecha)}
                    </span>
                  </div>
                </div>
                <p className="text-base sm:text-lg font-bold text-gray-900 flex-shrink-0">
                  {formatCurrency(gasto.monto)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cuotas Mensuales */}
      {cuotasMensuales.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Cuotas del Mes ({cuotasMensuales.length})
          </h3>
          <div className="space-y-2">
            {cuotasMensuales.map(cuota => (
              <div
                key={cuota.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow gap-3 sm:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{cuota.concepto}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                      cuota.persona === 'Manuel' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {cuota.persona}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      Cuota {cuota.numeroCuota}
                    </span>
                    {cuota.reintegroAplicado > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 flex-shrink-0">
                        Reintegro: {formatCurrency(cuota.reintegroAplicado)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    {formatCurrency(cuota.montoCuota)}
                  </p>
                  {cuota.montoCuota !== cuota.montoOriginal && (
                    <p className="text-xs text-gray-500 line-through">
                      {formatCurrency(cuota.montoOriginal)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
