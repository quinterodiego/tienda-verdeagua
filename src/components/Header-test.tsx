'use client';

import { useState } from 'react';
import { MenuIcon, XIcon, ShoppingCartIcon, UserIcon } from './Icons';
import { useCartStore } from '@/lib/store';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function HeaderTest() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount } = useCartStore();
  const { data: session, status } = useSession();

  return (
    <header className="bg-white shadow-md border-b border-gray-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-[#68c3b7]">Verde Agua</span>
          </Link>

          {/* Right Menu */}
          <div className="flex items-center space-x-4">
            {/* User account */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden md:block">Cerrar Sesión</span>
              </button>
            ) : (
              <button
                onClick={() => signIn()}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden md:block">Iniciar Sesión</span>
              </button>
            )}

            {/* Shopping Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
              <ShoppingCartIcon className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#68c3b7] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? (
                <XIcon className="w-5 h-5" />
              ) : (
                <MenuIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
