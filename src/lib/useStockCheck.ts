import { useState, useEffect } from 'react';
import { CartItem } from '@/types';

interface StockCheck {
  productId: string;
  productName: string;
  requestedQuantity: number;
  availableStock: number;
  sufficient: boolean;
  error: string | null;
}

interface UseStockCheckResult {
  stockChecks: StockCheck[];
  allSufficient: boolean;
  loading: boolean;
  error: string | null;
  refreshStock: () => void;
}

export function useStockCheck(items: CartItem[]): UseStockCheckResult {
  const [stockChecks, setStockChecks] = useState<StockCheck[]>([]);
  const [allSufficient, setAllSufficient] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStock = async () => {
    if (items.length === 0) {
      setStockChecks([]);
      setAllSufficient(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stockItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const response = await fetch('/api/products/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: stockItems }),
      });

      if (!response.ok) {
        throw new Error('Error al verificar stock');
      }

      const data = await response.json();
      
      setStockChecks(data.checks || []);
      setAllSufficient(data.allSufficient || false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar stock');
      setStockChecks([]);
      setAllSufficient(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStock();
  }, [items]);

  return {
    stockChecks,
    allSufficient,
    loading,
    error,
    refreshStock: checkStock
  };
}
