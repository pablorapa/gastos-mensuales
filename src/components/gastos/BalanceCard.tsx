'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Balance as BalanceType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BalanceCardProps {
  balance: BalanceType;
}

/**
 * Tarjeta que muestra el balance mensual entre Manuel y Pablo
 * 
 * Muestra:
 * - Totales por persona (gastos simples + cuotas)
 * - Diferencia
 * - Quién debe compensar y cuánto
 * 
 * @param balance - Datos del balance
 * 
 * @example
 * <BalanceCard balance={balanceMensual} />
 */
export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <Card 
      title="Balance Mensual" 
      subtitle={formatDate(balance.mes, 'month')}
      className="animate-fade-in"
    >
      <div className="space-y-6">
        {/* Totales por persona */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-700 font-medium mb-1">Manuel</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-900">
              {formatCurrency(balance.totalManuel)}
            </p>
            <div className="mt-2 text-xs text-blue-600 space-y-0.5 sm:space-y-1">
              <p>Simples: {formatCurrency(balance.gastosSimples.Manuel)}</p>
              <p>Cuotas: {formatCurrency(balance.gastosCuotas.Manuel)}</p>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">Pablo</p>
            <p className="text-lg sm:text-2xl font-bold text-green-900">
              {formatCurrency(balance.totalPablo)}
            </p>
            <div className="mt-2 text-xs text-green-600 space-y-0.5 sm:space-y-1">
              <p>Simples: {formatCurrency(balance.gastosSimples.Pablo)}</p>
              <p>Cuotas: {formatCurrency(balance.gastosCuotas.Pablo)}</p>
            </div>
          </div>
        </div>

        {/* Total general */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total del mes</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(balance.totalManuel + balance.totalPablo)}
          </p>
        </div>

        {/* Compensación */}
        {balance.deudor ? (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold text-orange-900">Deuda pendiente</p>
            </div>
            <p className="text-lg text-orange-800">
              <span className="font-bold">{balance.deudor}</span> debe {' '}
              <span className="font-bold">{formatCurrency(balance.montoACompensar)}</span>
            </p>
          </div>
        ) : (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
            <svg
              className="w-8 h-8 text-green-600 mx-auto mb-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700 mt-1">
              Gastaron lo mismo este mes
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
