'use client';

import { useState } from 'react';
import { Plus, CheckCircle, AlertTriangle, Database } from 'lucide-react';

interface AddPaymentTypeColumnProps {
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export default function AddPaymentTypeColumn({ onNotify }: AddPaymentTypeColumnProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAddColumn = async () => {
    if (isProcessing) return;
    
    const confirmed = window.confirm(
      '¿Agregar columna "Tipo de Pago" a la hoja de Pedidos?\n\n' +
      'Esta acción:\n' +
      '• Agregará una nueva columna "Tipo de Pago"\n' +
      '• Asignará "Mercado Pago" como valor por defecto a pedidos existentes\n' +
      '• Permitirá rastrear métodos de pago en futuros pedidos\n\n' +
      '¿Continuar?'
    );

    if (!confirmed) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/add-payment-type-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setResult(result);
        onNotify(
          `✅ ${result.message}`,
          'success'
        );
      } else {
        onNotify(
          `❌ Error: ${result.error}`,
          'error'
        );
      }
    } catch (error) {
      console.error('Error agregando columna:', error);
      onNotify(
        '❌ Error de conexión al intentar agregar la columna',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6" />
          <h3 className="text-xl font-semibold">Agregar Tipo de Pago</h3>
        </div>
        <p className="text-blue-100 mt-2">
          Agregar columna para rastrear métodos de pago en pedidos
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">¿Qué hace esta herramienta?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Agrega la columna "Tipo de Pago" a la hoja de Pedidos</li>
                <li>• Asigna "Mercado Pago" como valor por defecto a pedidos existentes</li>
                <li>• Permite rastrear métodos de pago en futuros pedidos</li>
                <li>• Mejora el análisis y reportes de ventas</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="text-center">
          <button
            onClick={handleAddColumn}
            disabled={isProcessing || result?.existed}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {isProcessing ? (
              <>
                <Database className="w-5 h-5 animate-pulse" />
                Procesando...
              </>
            ) : result?.existed ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Columna ya existe
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Agregar Columna "Tipo de Pago"
              </>
            )}
          </button>
        </div>

        {/* Resultado */}
        {result && (
          <div className={`${result.existed ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <CheckCircle className={`w-5 h-5 ${result.existed ? 'text-yellow-600' : 'text-green-600'} mt-0.5 flex-shrink-0`} />
              <div className="flex-1">
                <h4 className={`font-medium ${result.existed ? 'text-yellow-900' : 'text-green-900'} mb-2`}>
                  {result.existed ? 'Columna ya existe' : 'Columna agregada exitosamente'}
                </h4>
                <p className={`text-sm ${result.existed ? 'text-yellow-700' : 'text-green-700'} mb-3`}>
                  {result.message}
                </p>
                
                {!result.existed && result.updatedRows > 0 && (
                  <div className="text-xs text-green-700 bg-green-100 rounded p-2">
                    ✅ Se actualizaron {result.updatedRows} pedidos existentes con "Mercado Pago" como valor por defecto
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Beneficios */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Beneficios de agregar esta columna:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>📊 <strong>Analytics mejorados:</strong> Ver qué métodos de pago prefieren los clientes</li>
            <li>📈 <strong>Reportes detallados:</strong> Separar ventas por tipo de pago</li>
            <li>🎯 <strong>Segmentación:</strong> Filtrar pedidos por método de pago</li>
            <li>💳 <strong>Futuro:</strong> Preparado para múltiples métodos de pago</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
