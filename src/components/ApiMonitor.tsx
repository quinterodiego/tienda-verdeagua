'use client';

import { useEffect, useState } from 'react';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useSession } from 'next-auth/react';

export default function ApiMonitor() {
  const { data: session } = useSession();
  const { isAdmin, loading } = useIsAdmin();
  const [callCount, setCallCount] = useState(0);
  const [lastCall, setLastCall] = useState<string>('');

  useEffect(() => {
    // Interceptar las llamadas fetch para contar las llamadas a user-role
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      const url = args[0] as string;
      if (url.includes('/api/auth/user-role')) {
        setCallCount(prev => prev + 1);
        setLastCall(new Date().toLocaleTimeString());
        console.log(`📊 Llamada API #${callCount + 1} a user-role en:`, new Date().toLocaleTimeString());
      }
      return originalFetch.apply(this, args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [callCount]);

  if (!session) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-semibold text-sm mb-2">🔍 Monitor API</h3>
      <div className="text-xs space-y-1">
        <p><strong>Usuario:</strong> {session.user?.email}</p>
        <p><strong>Admin:</strong> {loading ? '⏳' : isAdmin ? '✅' : '❌'}</p>
        <p><strong>Llamadas API:</strong> {callCount}</p>
        {lastCall && <p><strong>Última:</strong> {lastCall}</p>}
      </div>
    </div>
  );
}
