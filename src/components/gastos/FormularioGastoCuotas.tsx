'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getCurrentDate, getCurrentMonth } from '@/lib/utils';
import { Persona } from '@/types';

interface FormularioGastoCuotasProps {
  onSuccess?: () => void;
}

/**
 * Formulario para registrar un gasto en cuotas
 * 
 * Permite especificar:
 * - Concepto, monto total y cantidad de cuotas
 * - Reintegro (opcional) que se descuenta progresivamente
 * - Mes de inicio de las cuotas
 * 
 * @param onSuccess - Callback ejecutado al guardar exitosamente
 * 
 * @example
 * <FormularioGastoCuotas onSuccess={() => refetch()} />
 */
export function FormularioGastoCuotas({ onSuccess }: FormularioGastoCuotasProps) {
  const [concepto, setConcepto] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [cantidadCuotas, setCantidadCuotas] = useState('');
  const [reintegro, setReintegro] = useState('');
  const [persona, setPersona] = useState<Persona>('Manuel');
  const [mesInicio, setMesInicio] = useState(getCurrentMonth());
  const [fecha, setFecha] = useState(getCurrentDate());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Calcular monto por cuota
  const montoPorCuota = montoTotal && cantidadCuotas 
    ? (parseFloat(montoTotal) / parseInt(cantidadCuotas)).toFixed(2)
    : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gastos/cuotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto,
          montoTotal: parseFloat(montoTotal),
          cantidadCuotas: parseInt(cantidadCuotas),
          montoPorCuota: parseFloat(montoPorCuota),
          mesInicio,
          reintegro: reintegro ? parseFloat(reintegro) : undefined,
          persona,
          fecha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar gasto');
      }

      // Limpiar formulario
      setConcepto('');
      setMontoTotal('');
      setCantidadCuotas('');
      setReintegro('');
      setMesInicio(getCurrentMonth());
      setFecha(getCurrentDate());
      
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Concepto"
        value={concepto}
        onChange={e => setConcepto(e.target.value)}
        placeholder="Ej: Notebook"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Monto Total"
          type="number"
          step="0.01"
          min="0"
          value={montoTotal}
          onChange={e => setMontoTotal(e.target.value)}
          placeholder="600.00"
          required
        />

        <Input
          label="Cantidad de Cuotas"
          type="number"
          min="1"
          value={cantidadCuotas}
          onChange={e => setCantidadCuotas(e.target.value)}
          placeholder="6"
          required
        />
      </div>

      {montoPorCuota !== '0.00' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Monto por cuota:</span> ${montoPorCuota}
          </p>
        </div>
      )}

      <Input
        label="Reintegro (opcional)"
        type="number"
        step="0.01"
        min="0"
        value={reintegro}
        onChange={e => setReintegro(e.target.value)}
        placeholder="180.00"
      />

      <Select
        label="Persona que pagó"
        value={persona}
        onChange={e => setPersona(e.target.value as Persona)}
        options={[
          { value: 'Manuel', label: 'Manuel' },
          { value: 'Pablo', label: 'Pablo' },
        ]}
      />

      <Input
        label="Mes de Inicio"
        type="month"
        value={mesInicio}
        onChange={e => setMesInicio(e.target.value)}
        required
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Guardar Gasto en Cuotas
      </Button>
    </form>
  );
}
