'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getCurrentDate, getCurrentMonth, formatNumberInput, parseNumberInput } from '@/lib/utils';
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
  const { data: session } = useSession();
  const [concepto, setConcepto] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [cantidadCuotas, setCantidadCuotas] = useState('');
  const [reintegro, setReintegro] = useState('');
  const [persona, setPersona] = useState<Persona>('Manuel');
  const [mesInicio, setMesInicio] = useState(getCurrentMonth());
  const [fecha, setFecha] = useState(getCurrentDate());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Detectar si el email del usuario contiene 'pablo' y establecer default
  useEffect(() => {
    if (session?.user?.email?.toLowerCase().includes('pablo')) {
      setPersona('Pablo');
    }
  }, [session]);

  const handleMontoTotalChange = (value: string) => {
    // Extraer solo dígitos del input
    const onlyNumbers = value.replace(/\D/g, '');
    
    if (onlyNumbers === '') {
      setMontoTotal('');
      return;
    }
    
    // Formatear como número entero con separadores de miles
    const numValue = parseInt(onlyNumbers, 10);
    const formatted = formatNumberInput(numValue);
    setMontoTotal(formatted);
  };

  const handleReintegroChange = (value: string) => {
    // Extraer solo dígitos del input
    const onlyNumbers = value.replace(/\D/g, '');
    
    if (onlyNumbers === '') {
      setReintegro('');
      return;
    }
    
    // Formatear como número entero con separadores de miles
    const numValue = parseInt(onlyNumbers, 10);
    const formatted = formatNumberInput(numValue);
    setReintegro(formatted);
  };

  // Calcular monto por cuota (redondeando al próximo entero)
  const montoPorCuota = montoTotal && cantidadCuotas 
    ? Math.ceil(parseNumberInput(montoTotal) / parseInt(cantidadCuotas))
    : 0;

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
          montoTotal: parseNumberInput(montoTotal),
          cantidadCuotas: parseInt(cantidadCuotas),
          montoPorCuota: montoPorCuota,
          mesInicio,
          reintegro: reintegro ? parseNumberInput(reintegro) : undefined,
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
        placeholder="Ej: Sillón"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Monto Total"
          type="text"
          value={montoTotal}
          onChange={e => handleMontoTotalChange(e.target.value)}
          placeholder="0"
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

      {montoPorCuota !== 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Monto por cuota:</span> {formatNumberInput(montoPorCuota)}
          </p>
        </div>
      )}

      <Input
        label="Reintegro (opcional)"
        type="text"
        value={reintegro}
        onChange={e => handleReintegroChange(e.target.value)}
        placeholder="0"
      />

      <Select
        label="Persona que pagó"
        value={persona}
        onChange={e => setPersona(e.target.value as Persona)}
        options={[
          { value: 'Manuel', label: 'Manu' },
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
