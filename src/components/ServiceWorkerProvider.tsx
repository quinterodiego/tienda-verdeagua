'use client';

import { useServiceWorker, useWebVitals } from '@/hooks/useServiceWorker';

export default function ServiceWorkerProvider() {
  useServiceWorker();
  useWebVitals();
  
  return null;
}
