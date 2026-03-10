'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatNumberInput, parseNumberInput } from '@/lib/utils';
import { Persona } from '@/types';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Paso = 'escuchando' | 'confirmacion' | 'error';

interface ResultadoParseo {
  concepto: string;
  monto: string;
}

interface VozModalProps {
  persona: Persona;
  onConfirmar: (concepto: string, monto: string) => void;
  onCerrar: () => void;
}

const BAR_HEIGHTS = [30, 65, 90, 50, 100, 70, 40, 85, 55, 35, 75, 45];

function parsearTexto(texto: string): ResultadoParseo | null {
  // Buscar el primer número en el texto (con posibles puntos de miles)
  const match = texto.match(/\b(\d[\d.]*)\b/);
  if (!match) return null;

  const montoNum = parseInt(match[1].replace(/\./g, ''), 10);
  if (isNaN(montoNum) || montoNum <= 0) return null;

  const monto = formatNumberInput(montoNum);

  // El concepto es todo lo que queda sin el número
  const concepto = texto
    .replace(match[0], '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!concepto) return null;

  return {
    concepto: concepto.charAt(0).toUpperCase() + concepto.slice(1),
    monto,
  };
}

export function VozModal({ persona, onConfirmar, onCerrar }: VozModalProps) {
  const [paso, setPaso] = useState<Paso>('escuchando');
  const [textoInterim, setTextoInterim] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resultado, setResultado] = useState<ResultadoParseo | null>(null);
  const recognitionRef = useRef<any>(null);

  const iniciarReconocimiento = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Tu navegador no soporta reconocimiento de voz. Probá con Chrome o Safari.');
      setPaso('error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-AR';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) setTextoInterim(interim);
      if (final) {
        setTextoInterim('');
        const parsed = parsearTexto(final);
        if (parsed) {
          setResultado(parsed);
          setPaso('confirmacion');
        } else {
          setErrorMsg(final);
          setPaso('error');
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        setErrorMsg('');
        setPaso('error');
      }
    };

    recognition.start();
  };

  useEffect(() => {
    iniciarReconocimiento();
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const handleReintentar = () => {
    recognitionRef.current?.abort();
    setTextoInterim('');
    setErrorMsg('');
    setResultado(null);
    setPaso('escuchando');
    // Pequeño delay para asegurar que el mic anterior se liberó
    setTimeout(iniciarReconocimiento, 200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 flex flex-col items-center justify-center p-6">

      {/* PANTALLA: Escuchando */}
      {paso === 'escuchando' && (
        <div className="w-full max-w-sm flex flex-col items-center gap-6 animate-fade-in">

          {/* Ícono micrófono animado */}
          <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center animate-pulse shadow-lg shadow-red-500/40">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zM11 18.93V21h2v-1.07A8.001 8.001 0 0 0 20 12h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 6.93z" />
            </svg>
          </div>

          {/* Ejemplos */}
          <div className="w-full text-center">
            <p className="text-gray-400 text-sm mb-3">Decí algo como:</p>
            <div className="bg-gray-800 rounded-xl p-4 space-y-2 text-left">
              {['"Supermercado 2500"', '"Netflix 5400"', '"Farmacia 890"'].map(ej => (
                <p key={ej} className="text-white font-mono text-sm tracking-wide">{ej}</p>
              ))}
            </div>
          </div>

          {/* Texto en tiempo real */}
          <div className="min-h-8 text-center">
            {textoInterim ? (
              <p className="text-white text-lg italic">"{textoInterim}"</p>
            ) : (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Escuchando...
              </div>
            )}
          </div>

          {/* Barras de onda */}
          <div className="flex items-end gap-1 h-8">
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-red-400 rounded-full animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 0.1}s`, minHeight: '4px' }}
              />
            ))}
          </div>

          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-200 text-sm underline underline-offset-2 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* PANTALLA: Confirmación */}
      {paso === 'confirmacion' && resultado && (
        <div className="w-full max-w-sm flex flex-col gap-5 animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/40">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-300 text-sm">Esto es lo que entendí:</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Concepto</span>
              <span className="text-white font-medium">{resultado.concepto}</span>
            </div>
            <div className="h-px bg-gray-700" />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Monto</span>
              <span className="text-white font-bold text-xl">{formatCurrency(parseNumberInput(resultado.monto))}</span>
            </div>
            <div className="h-px bg-gray-700" />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Persona</span>
              <span className="text-white font-medium">{persona === 'Manuel' ? 'Manu' : persona}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => onConfirmar(resultado.concepto, resultado.monto)}>
              Confirmar y agregar
            </Button>
            <Button variant="secondary" className="w-full" onClick={handleReintentar}>
              Intentar de nuevo
            </Button>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-gray-200 text-sm underline underline-offset-2 transition-colors py-1"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* PANTALLA: Error */}
      {paso === 'error' && (
        <div className="w-full max-w-sm flex flex-col gap-5 animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/40">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="text-white text-lg font-medium">No pude entender el monto</p>
            {errorMsg && (
              <p className="text-gray-400 text-sm mt-1">Escuché: "{errorMsg}"</p>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-300 text-sm">Recordá incluir el monto al final:</p>
            <p className="text-white font-mono mt-2 tracking-wide">"Supermercado 2500"</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={handleReintentar}>
              Intentar de nuevo
            </Button>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-gray-200 text-sm underline underline-offset-2 transition-colors py-1"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
