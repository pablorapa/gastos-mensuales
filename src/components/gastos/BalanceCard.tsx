'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { BalanceDetalle } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface BalanceCardProps {
  balance: BalanceDetalle;
  title?: string;
  subtitle?: string;
}

/**
 * Tarjeta que muestra el balance entre Manuel y Pablo para un tipo de gasto
 * 
 * Muestra:
 * - Totales acumulados por persona
 * - Diferencia
 * - Quién debe compensar y cuánto
 * 
 * NOTA: Para "Gastos Mensuales", estos son históricos (acumula todos los meses)
 *       Para "Gastos en Cuotas", muestra solo las cuotas del mes seleccionado
 * 
 * @param balance - Datos del balance (BalanceDetalle)
 * @param title - Título de la tarjeta (ej: "Gastos Mensuales", "Gastos en Cuotas")
 * @param subtitle - Subtítulo opcional
 * 
 * @example
 * <BalanceCard 
 *   balance={balanceSimples} 
 *   title="Gastos Mensuales (Histórico)"
 *   subtitle="Acumulado desde el inicio"
 * />
 */
export function BalanceCard({ balance, title = 'Balance', subtitle }: BalanceCardProps) {
  return (
    <Card 
      title={title}
      subtitle={subtitle}
      className="animate-fade-in"
    >
      <div className="space-y-6">

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
              <span className="font-bold">{balance.deudor === 'Manuel' ? 'Manu' : balance.deudor}</span> debe {' '}
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
              Gastaron lo mismo este período
            </p>
          </div>
        )}
{/* 
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-700 font-medium mb-1">Manu</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-900">
              {formatCurrency(balance.totalManuel)}
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">Pablo</p>
            <p className="text-lg sm:text-2xl font-bold text-green-900">
              {formatCurrency(balance.totalPablo)}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(balance.totalManuel + balance.totalPablo)}
          </p>
        </div>
 */}
      </div>
    </Card>
  );
}
