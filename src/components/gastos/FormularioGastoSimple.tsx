'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getCurrentDate } from '@/lib/utils';
import { Persona } from '@/types';

interface FormularioGastoSimpleProps {
  onSuccess?: () => void;
}

/**
 * Formulario para registrar un gasto simple
 * 
 * @param onSuccess - Callback ejecutado al guardar exitosamente
 * 
 * @example
 * <FormularioGastoSimple onSuccess={() => refetch()} />
 */
export function FormularioGastoSimple({ onSuccess }: FormularioGastoSimpleProps) {
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [persona, setPersona] = useState<Persona>('Manuel');
  const [fecha, setFecha] = useState(getCurrentDate());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gastos/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto,
          monto: parseFloat(monto),
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
      setMonto('');
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
        placeholder="Ej: Supermercado"
        required
      />

      <Input
        label="Monto"
        type="number"
        step="0.01"
        min="0"
        value={monto}
        onChange={e => setMonto(e.target.value)}
        placeholder="100.00"
        required
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

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Guardar Gasto
      </Button>
    </form>
  );
}
