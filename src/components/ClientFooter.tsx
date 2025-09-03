'use client';

import { useEffect, useState } from 'react';
import Footer from './Footer';

export default function ClientFooter() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Renderizar un footer estático durante SSR
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-400">Cargando...</p>
          </div>
        </div>
      </footer>
    );
  }

  return <Footer />;
}
