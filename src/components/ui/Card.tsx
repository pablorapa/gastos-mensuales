import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Componente Card para agrupar contenido
 * 
 * @example
 * <Card title="Balance Mensual" subtitle="Marzo 2024">
 *   <p>Contenido...</p>
 * </Card>
 */
export function Card({ children, className, title, subtitle }: CardProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden',
      className
    )}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
