import React from 'react';

/**
 * Componente Loading spinner
 * 
 * @example
 * <Loading />
 */
export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Cargando...</p>
      </div>
    </div>
  );
}
