'use client';

import { useRouter } from 'next/navigation';
import { MailIcon, PhoneIcon, FacebookIcon, InstagramIcon, MessageCircleIcon } from './Icons';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Category } from '@/types';

interface SiteSettings {
  contactEmail?: string;
  whatsapp?: {
    enabled: boolean;
    phone: string;
  };
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Detectar cuando estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cargar configuración del sitio
  useEffect(() => {
    if (!isClient) return;
    
    const loadSiteSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings) {
            setSiteSettings(data.settings);
          }
        }
      } catch (error) {
        console.error('Error al cargar configuración del sitio:', error);
      }
    };

    loadSiteSettings();
  }, [isClient]);

  // Cargar categorías dinámicamente desde Google Sheets
  useEffect(() => {
    if (!isClient) return;
    
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          // Filtrar solo las categorías activas y limitar a 6 para el footer
          const activeCategories = data.categories
            ?.filter((cat: Category) => cat.isActive)
            ?.slice(0, 6) || [];
          setCategories(activeCategories);
        } else {
          console.error('Error al cargar categorías:', response.statusText);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [isClient]);

  // Función para formatear el número de teléfono
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    // Si empieza con 549, formatear como +54 9 11 xxxx-xxxx
    if (phone.startsWith('549')) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 9)}-${phone.slice(9)}`;
    }
    // Formato genérico
    return `+${phone.slice(0, 2)} ${phone.slice(2, 4)} ${phone.slice(4, 8)}-${phone.slice(8)}`;
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-14 h-12 bg-white rounded-full flex items-center justify-center">
                <Image
                  src="/logo-solo-img.png" 
                  alt="Verde Agua Personalizados" 
                  width={30}
                  height={30}
                  priority
                  unoptimized
                />
              </div>
              <span className="font-bold text-xl">Verde Agua Personalizados</span>
            </div>
            <p className="text-gray-400 mb-4">
              Productos personalizados para hacer únicas tus ideas. 
              Calidad, creatividad y compromiso desde 2020.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/verde_agua.personalizados?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target='_blank'
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-gray-300 transition-colors"
              >
                <Image
                  src="/instagram.png"
                  alt="Instagram"
                  width={30}
                  height={30}
                  className="object-contain relative z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 drop-shadow-md"
                />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => router.push('/')}
                  className="hover:text-white transition-colors text-left"
                >
                  Productos
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/nosotros')}
                  className="hover:text-white transition-colors text-left"
                >
                  Nosotros
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/contacto')}
                  className="hover:text-white transition-colors text-left"
                >
                  Contacto
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/cart')}
                  className="hover:text-white transition-colors text-left"
                >
                  Carrito
                </button>
              </li>
              {/* <li>
                <button
                  onClick={() => router.push('/favoritos')}
                  className="hover:text-white transition-colors text-left"
                >
                  Favoritos
                </button>
              </li> */}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categorías</h3>
            <ul className="space-y-2 text-gray-400">
              {!isClient || categoriesLoading ? (
                // Skeleton loader para categorías
                <>
                  {[...Array(6)].map((_, index) => (
                    <li key={index}>
                      <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                    </li>
                  ))}
                </>
              ) : categories.length > 0 ? (
                // Mostrar categorías dinámicas desde Google Sheets
                categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => router.push(`/?category=${encodeURIComponent(category.name)}`)}
                      className="hover:text-white transition-colors text-left"
                    >
                      {category.name}
                    </button>
                  </li>
                ))
              ) : (
                // Fallback a categorías estáticas si no se pueden cargar las dinámicas
                <>
                  <li>
                    <button
                      onClick={() => router.push('/?category=Agendas')}
                      className="hover:text-white transition-colors text-left"
                    >
                      Agendas
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/?category=Tazas')}
                      className="hover:text-white transition-colors text-left"
                    >
                      Tazas
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/?category=Llaveros')}
                      className="hover:text-white transition-colors text-left"
                    >
                      Llaveros
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/?category=Stickers')}
                      className="hover:text-white transition-colors text-left"
                    >
                      Stickers
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/?category=Cuadernos')}
                      className="hover:text-white transition-colors text-left"
                    >
                      Cuadernos
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/?category=Mochilas')}
                      className="hover:text-white transition-colors text-left"
                    >
                      Mochilas
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                  {isClient && siteSettings?.whatsapp?.phone 
                    ? formatPhoneNumber(siteSettings.whatsapp.phone)
                    : '+54 11 5176-2371'
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MailIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                  {isClient && siteSettings?.contactEmail 
                    ? siteSettings.contactEmail 
                    : 'verdeaguapersonalizados@gmail.com'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Verde Agua Personalizados. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <button
                onClick={() => {/* TODO: Implementar términos y condiciones */}}
                className="hover:text-white transition-colors"
              >
                Términos y Condiciones
              </button>
              <button
                onClick={() => {/* TODO: Implementar política de privacidad */}}
                className="hover:text-white transition-colors"
              >
                Política de Privacidad
              </button>
              <button
                onClick={() => {/* TODO: Implementar política de devoluciones */}}
                className="hover:text-white transition-colors"
              >
                Política de Devoluciones
              </button>
            </div>
          </div>
           <div className="flex justify-center items-center mt-4">
            <div className="text-gray-400 text-sm mt-4 md:mt-0">
              Desarrollado por <a href="https://coderflix.com.ar" target='_blank' className="hover:text-white transition-colors font-bold">CoderFlix</a>  
            </div>
           </div>
        </div>
      </div>
    </footer>
  );
}
