'use client';

import Link from 'next/link';
import { Mail, Phone, Facebook, Instagram, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Category } from '@/types';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Cargar categorías dinámicamente desde Google Sheets
  useEffect(() => {
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
  }, []);

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
                href="#" 
                className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Carrito
                </Link>
              </li>
              {/* <li>
                <Link href="/favoritos" className="hover:text-white transition-colors">
                  Favoritos
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categorías</h3>
            <ul className="space-y-2 text-gray-400">
              {categoriesLoading ? (
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
                    <Link 
                      href={`/?category=${encodeURIComponent(category.name)}`} 
                      className="hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                // Fallback a categorías estáticas si no se pueden cargar las dinámicas
                <>
                  <li>
                    <Link href="/?category=Agendas" className="hover:text-white transition-colors">
                      Agendas
                    </Link>
                  </li>
                  <li>
                    <Link href="/?category=Tazas" className="hover:text-white transition-colors">
                      Tazas
                    </Link>
                  </li>
                  <li>
                    <Link href="/?category=Llaveros" className="hover:text-white transition-colors">
                      Llaveros
                    </Link>
                  </li>
                  <li>
                    <Link href="/?category=Stickers" className="hover:text-white transition-colors">
                      Stickers
                    </Link>
                  </li>
                  <li>
                    <Link href="/?category=Cuadernos" className="hover:text-white transition-colors">
                      Cuadernos
                    </Link>
                  </li>
                  <li>
                    <Link href="/?category=Mochilas" className="hover:text-white transition-colors">
                      Mochilas
                    </Link>
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
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">+54 11 1234-5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">info@verdeaguapersonalizados.com</span>
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
              <Link href="#" className="hover:text-white transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Política de Privacidad
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Política de Devoluciones
              </Link>
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
