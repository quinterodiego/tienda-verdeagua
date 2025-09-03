'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCartIcon, 
  SearchIcon, 
  MenuIcon, 
  UserIcon, 
  XIcon, 
  HeartIcon, 
  HomeIcon, 
  LogOutIcon, 
  UsersIcon, 
  MailIcon, 
  SettingsIcon, 
  HelpCircleIcon 
} from './Icons';
import { useCartStore, useFavoritesStore } from '@/lib/store';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ClientOnly from './ClientOnly';
import Image from 'next/image';

export default function Header() {
  const { itemCount } = useCartStore();
  const { favorites } = useFavoritesStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Obtener información de rol del usuario desde la API
  useEffect(() => {
    const fetchUserRole = async () => {
      if (session?.user?.email && !roleLoading) {
        setRoleLoading(true);
        try {
          console.log('🔍 Verificando rol de admin para:', session.user.email);
          const response = await fetch('/api/auth/user-role');
          if (response.ok) {
            const data = await response.json();
            console.log('📡 Respuesta de API user-role:', data);
            setIsAdmin(data.isAdmin);
          } else {
            console.error('❌ Error en API user-role:', response.status);
          }
        } catch (error) {
          console.error('💥 Error al verificar rol de admin:', error);
        } finally {
          setRoleLoading(false);
        }
      } else if (!session?.user?.email) {
        setIsAdmin(false);
      }
    };

    fetchUserRole();
  }, [session?.user?.email]);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Image
              src="/logo-horizontal.png" 
              alt="Verde Agua Personalizados" 
              width={150}
              height={40}
              className="object-contain transition-all duration-300 group-hover:scale-105"
              priority
              unoptimized
            />
          </Link>

          {/* Navigation Menu - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-[#68c3b7] font-medium transition-all duration-500 relative group"
            >
              Productos
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#68c3b7] transition-all duration-500 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/nosotros" 
              className="text-gray-700 hover:text-[#68c3b7] font-medium transition-all duration-500 relative group"
            >
              Nosotros
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#68c3b7] transition-all duration-500 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/contacto" 
              className="text-gray-700 hover:text-[#68c3b7] font-medium transition-all duration-500 relative group"
            >
              Contacto
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#68c3b7] transition-all duration-500 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/ayuda" 
              className="text-gray-700 hover:text-[#68c3b7] font-medium transition-all duration-500 relative group"
            >
              Ayuda
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#68c3b7] transition-all duration-500 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Right Menu */}
          <div className="flex items-center space-x-4">
            {/* User account */}
            <div className="relative" ref={userMenuRef}>
              {status === 'loading' ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-500 transform hover:scale-102"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'Usuario'}
                        width={32}
                        height={32}
                        className="rounded-full transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#68c3b7] rounded-full flex items-center justify-center transition-all duration-500 hover:scale-105">
                        <UserIcon className="w-4 h-4 text-white transition-transform duration-500 hover:rotate-6" />
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium max-w-20 truncate">
                      {session.user?.name}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {session.user?.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium bg-[#68c3b7] text-white rounded-full">
                            Administrador
                          </span>
                        )}
                      </div>
                      <div className="py-1">
                        <Link
                          href="/perfil"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Mi Perfil
                        </Link>
                        <Link
                          href="/mis-pedidos"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Mis Pedidos
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-[#68c3b7] hover:bg-gray-100 font-medium flex items-center"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <SettingsIcon className="w-4 h-4 mr-2" />
                            Panel de Admin
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            signOut();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        >
                          <LogOutIcon className="w-4 h-4 mr-2" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-500 transform hover:scale-102"
                >
                  <UserIcon className="w-4 h-4 transition-transform duration-500 hover:rotate-6" />
                  <span className="hidden md:block">Iniciar Sesión</span>
                </button>
              )}
            </div>

            {/* Shopping Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 group transition-all duration-500 transform hover:scale-105">
              <ShoppingCartIcon className="w-5 h-5 transition-transform duration-500 group-hover:rotate-6" />
              <ClientOnly>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#68c3b7] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce-in transition-transform duration-500 group-hover:scale-105">
                    {itemCount}
                  </span>
                )}
              </ClientOnly>
            </Link>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-all duration-500 transform hover:scale-105"
            >
              {isMobileMenuOpen ? (
                <XIcon className="w-5 h-5 transition-transform duration-500 rotate-45" />
              ) : (
                <MenuIcon className="w-5 h-5 transition-transform duration-500 hover:rotate-90" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="py-4 space-y-1">
              <Link 
                href="/" 
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HomeIcon className="w-5 h-5 mr-3" />
                Productos
              </Link>

              <Link 
                href="/nosotros" 
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UsersIcon className="w-5 h-5 mr-3" />
                Nosotros
              </Link>

              <Link 
                href="/ayuda" 
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HelpCircleIcon className="w-5 h-5 mr-3" />
                Ayuda
              </Link>

              <Link 
                href="/contacto" 
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MailIcon className="w-5 h-5 mr-3" />
                Contacto
              </Link>
              
              <Link 
                href="/cart" 
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCartIcon className="w-5 h-5 mr-3" />
                <span>Carrito</span>
                <ClientOnly>
                  {itemCount > 0 && (
                    <span className="ml-2 bg-[#68c3b7] text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </ClientOnly>
              </Link>

              <Link 
                href="/favoritos" 
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HeartIcon className="w-5 h-5 mr-3" />
                <span>Favoritos</span>
                <ClientOnly>
                  {favorites.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </ClientOnly>
              </Link>

              {/* User Authentication Mobile */}
              {session ? (
                <>
                  <Link 
                    href="/perfil" 
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'Usuario'}
                        width={20}
                        height={20}
                        className="rounded-full mr-3"
                      />
                    ) : (
                      <UserIcon className="w-5 h-5 mr-3" />
                    )}
                    <span>Mi Perfil</span>
                  </Link>
                  
                  <Link 
                    href="/mis-pedidos" 
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5 mr-3" />
                    <span>Mis Pedidos</span>
                  </Link>
                  
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="flex items-center px-4 py-2 text-[#68c3b7] hover:bg-gray-100 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <SettingsIcon className="w-5 h-5 mr-3" />
                      <span>Panel de Admin</span>
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100 text-left"
                  >
                    <LogOutIcon className="w-5 h-5 mr-3" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signIn();
                  }}
                  className="flex items-center w-full px-4 py-2 text-[#68c3b7] hover:bg-gray-100 text-left"
                >
                  <UserIcon className="w-5 h-5 mr-3" />
                  Iniciar Sesión
                </button>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Search Bar Section - Below Main Header */}
      {/* <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar agendas, tazas, llaveros, stickers y más..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-gray-600 w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent text-lg shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#68c3b7] text-white px-4 py-2 rounded-lg hover:bg-[#5ab3a7] transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </div> */}
    </header>
  );
}
