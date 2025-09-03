'use client';

import { useState, useEffect } from 'react';
import { CreditCardIcon as CreditCard, ClipboardDocumentIcon as Copy, CheckCircleIcon as CheckCircle, XCircleIcon as XCircle, ClockIcon as Clock, ChevronDownIcon as ChevronDown, ChevronUpIcon as ChevronUp } from '@/components/HeroIcons';

interface TestCard {
  card_number: string;
  security_code: string;
  expiration_date: string;
  cardholder: {
    name: string;
    identification: {
      type: string;
      number: string;
    };
  };
  result: string;
}

interface TestCardsData {
  argentina: {
    approved: TestCard[];
    rejected: TestCard[];
    pending: TestCard[];
  };
}

export default function TestCardsHelper() {
  const [testCards, setTestCards] = useState<TestCardsData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const loadTestCards = async () => {
    if (testCards) return; // Ya cargado
    
    setLoading(true);
    try {
      const response = await fetch('/api/mercadopago/test-cards');
      if (response.ok) {
        const data = await response.json();
        setTestCards(data.testCards);
      }
    } catch (error) {
      console.error('Error al cargar tarjetas de prueba:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = () => {
    if (!isExpanded && !testCards) {
      loadTestCards();
    }
    setIsExpanded(!isExpanded);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined' || !navigator?.clipboard) return;
    
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Solo mostrar en desarrollo
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <button
        onClick={toggleExpanded}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-blue-800 font-semibold">💳 Tarjetas de Prueba</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-blue-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-blue-600" />
        )}
      </button>
      
      <p className="text-blue-700 text-sm mt-1">
        Haz clic para ver las tarjetas de prueba disponibles
      </p>

      {isExpanded && (
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-blue-700 text-sm mt-2">Cargando tarjetas...</p>
            </div>
          ) : testCards ? (
            <div className="space-y-4">
              {/* Tarjetas Aprobadas */}
              <div>
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <h4 className="font-medium text-green-800">Pagos Aprobados</h4>
                </div>
                <div className="grid gap-2">
                  {testCards.argentina.approved.slice(0, 2).map((card, index) => (
                    <div key={`approved-${index}`} className="bg-white border border-green-200 rounded p-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-600">Número:</span>
                          <div className="flex items-center">
                            <code className="text-green-700 font-mono mr-1">{card.card_number}</code>
                            <button
                              onClick={() => copyToClipboard(card.card_number, `approved-${index}-number`)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {copiedField === `approved-${index}-number` ? '✅' : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">CVV:</span>
                          <div className="flex items-center">
                            <code className="text-green-700 font-mono mr-1">{card.security_code}</code>
                            <button
                              onClick={() => copyToClipboard(card.security_code, `approved-${index}-cvv`)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {copiedField === `approved-${index}-cvv` ? '✅' : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Vence:</span>
                          <code className="text-green-700 font-mono ml-1">{card.expiration_date}</code>
                        </div>
                        <div>
                          <span className="text-gray-600">Titular:</span>
                          <code className="text-green-700 font-mono ml-1">{card.cardholder.name}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tarjetas Rechazadas */}
              <div>
                <div className="flex items-center mb-2">
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                  <h4 className="font-medium text-red-800">Pagos Rechazados</h4>
                </div>
                <div className="grid gap-2">
                  {testCards.argentina.rejected.slice(0, 1).map((card, index) => (
                    <div key={`rejected-${index}`} className="bg-white border border-red-200 rounded p-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-600">Número:</span>
                          <div className="flex items-center">
                            <code className="text-red-700 font-mono mr-1">{card.card_number}</code>
                            <button
                              onClick={() => copyToClipboard(card.card_number, `rejected-${index}-number`)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {copiedField === `rejected-${index}-number` ? '✅' : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">CVV:</span>
                          <code className="text-red-700 font-mono ml-1">{card.security_code}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-blue-200 rounded p-3 text-xs text-blue-800">
                <p className="font-medium mb-1">💡 Instrucciones:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Usa cualquier email válido</li>
                  <li>• El <strong>nombre del titular</strong> determina el resultado</li>
                  <li>• Haz clic en 📋 para copiar automáticamente</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-red-600 text-sm">Error al cargar tarjetas de prueba</div>
          )}
        </div>
      )}
    </div>
  );
}
