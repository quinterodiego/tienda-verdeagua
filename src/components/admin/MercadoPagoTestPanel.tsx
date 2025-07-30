'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';

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

export default function MercadoPagoTestPanel() {
  const [testCards, setTestCards] = useState<TestCardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  useEffect(() => {
    loadTestCards();
  }, []);

  const loadTestCards = async () => {
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

  const copyToClipboard = (text: string, cardId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCard(cardId);
    setTimeout(() => setCopiedCard(null), 2000);
  };

  const formatCardNumber = (number: string) => {
    return number.replace(/\s/g, '');
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
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

  if (loading) {
    return <div className="flex justify-center p-8">Cargando tarjetas de prueba...</div>;
  }

  if (!testCards) {
    return <div className="text-red-600 p-4">Error al cargar tarjetas de prueba</div>;
  }

  const renderCardGroup = (cards: TestCard[], type: string, title: string) => (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        {getStatusIcon(type)}
        <h3 className="text-lg font-semibold ml-2">{title}</h3>
      </div>
      
      <div className="grid gap-4">
        {cards.map((card, index) => {
          const cardId = `${type}-${index}`;
          return (
            <div
              key={cardId}
              className={`border rounded-lg p-4 ${getStatusColor(type)}`}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-2">
                    <label className="text-sm font-medium text-gray-700">Número de Tarjeta:</label>
                    <div className="flex items-center">
                      <code className="bg-white px-2 py-1 rounded mr-2 font-mono text-sm">
                        {card.card_number}
                      </code>
                      <button
                        onClick={() => copyToClipboard(formatCardNumber(card.card_number), `${cardId}-number`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {copiedCard === `${cardId}-number` ? '✅' : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">CVV:</label>
                      <div className="flex items-center">
                        <code className="bg-white px-2 py-1 rounded mr-2 font-mono text-sm">
                          {card.security_code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(card.security_code, `${cardId}-cvv`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {copiedCard === `${cardId}-cvv` ? '✅' : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Vencimiento:</label>
                      <code className="bg-white px-2 py-1 rounded font-mono text-sm block">
                        {card.expiration_date}
                      </code>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="mb-2">
                    <label className="text-sm font-medium text-gray-700">Titular:</label>
                    <div className="flex items-center">
                      <code className="bg-white px-2 py-1 rounded mr-2 font-mono text-sm">
                        {card.cardholder.name}
                      </code>
                      <button
                        onClick={() => copyToClipboard(card.cardholder.name, `${cardId}-name`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {copiedCard === `${cardId}-name` ? '✅' : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">DNI:</label>
                    <code className="bg-white px-2 py-1 rounded font-mono text-sm block">
                      {card.cardholder.identification.number}
                    </code>
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">Resultado: </span>
                    <span className="text-sm">{card.result}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">🧪 Tarjetas de Prueba - MercadoPago</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>⚠️ Importante:</strong> Estas tarjetas solo funcionan en modo de prueba. 
            Nunca las uses en producción.
          </p>
        </div>
      </div>

      {renderCardGroup(testCards.argentina.approved, 'approved', '✅ Pagos Aprobados')}
      {renderCardGroup(testCards.argentina.rejected, 'rejected', '❌ Pagos Rechazados')}
      {renderCardGroup(testCards.argentina.pending, 'pending', '⏳ Pagos Pendientes')}
      
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Cómo usar:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Usa cualquier email válido</li>
          <li>• El <strong>nombre del titular</strong> determina el resultado</li>
          <li>• APRO = Aprobado, OTHE = Datos inválidos, FUND = Sin fondos, CONT = Pendiente</li>
          <li>• Haz clic en los íconos 📋 para copiar los datos</li>
        </ul>
      </div>
    </div>
  );
}
