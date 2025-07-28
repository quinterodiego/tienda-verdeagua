'use client';

import { Users, Award, Heart, Truck } from 'lucide-react';
import Image from 'next/image';

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#68c3b7] to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sobre Verde Agua Personalizados
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Tu aliado en productos personalizados desde 2020
            </p>
          </div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Nuestra Historia
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">El Comienzo</h3>
                <p className="text-lg text-gray-700">
                  Con una pequeña inversión y un gran sueño, Julieta comenzó a diseñar anotadores, etiquetas candy bar, 
                  y tarjetas personales desde la comodidad de su hogar. Su primer cliente fue una amiga cercana que 
                  deseaba hacer de la fiesta de cumpleaños de su hija un evento inolvidable. La atención al detalle 
                  y la calidad de los productos hicieron que la voz se corriera rápidamente.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Crecimiento y Diversificación</h3>
                <p className="text-lg text-gray-700">
                  A medida que aumentaba la demanda, Verde Agua Personalizados expandió su catálogo para incluir 
                  vinilos decorativos, souvenirs personalizados, y una línea completa de productos escolares. 
                  Cada artículo es diseñado con amor y cuidado, asegurando que cada cliente reciba exactamente 
                  lo que imaginó, o incluso algo mejor.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Nuestro Compromiso</h3>
                <p className="text-lg text-gray-700">
                  En Verde Agua Personalizados, creemos que cada ocasión merece un toque especial. Nos dedicamos 
                  a escuchar a nuestros clientes y trabajar mano a mano con ellos para crear productos que no solo 
                  cumplan, sino que superen sus expectativas. Nuestra misión es brindar productos únicos que 
                  reflejen la personalidad y el estilo de cada individuo.
                </p>
              </div>
            </div>
            {/* <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#68c3b7]">5000+</div>
                <div className="text-sm text-gray-600">Productos vendidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#68c3b7]">1200+</div>
                <div className="text-sm text-gray-600">Clientes felices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#68c3b7]">4.8</div>
                <div className="text-sm text-gray-600">Rating promedio</div>
              </div>
            </div> */}
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
              alt="Equipo trabajando"
              className="rounded-lg shadow-lg w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestros Valores
            </h2>
            <p className="text-lg text-gray-600">
              Los principios que guían nuestro trabajo día a día
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#68c3b7] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pasión</h3>
              <p className="text-gray-600">
                Amamos lo que hacemos y eso se refleja en cada producto que creamos.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Calidad</h3>
              <p className="text-gray-600">
                Utilizamos materiales de primera calidad para garantizar durabilidad.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#68c3b7] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Comunidad</h3>
              <p className="text-gray-600">
                Construimos relaciones duraderas con nuestros clientes y proveedores.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Compromiso</h3>
              <p className="text-gray-600">
                Nos comprometemos con tiempos de entrega y calidad excepcional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestro Proceso */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Cómo Trabajamos
          </h2>
          <p className="text-lg text-gray-600">
            Nuestro proceso garantiza productos únicos y de calidad
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#68c3b7] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Diseño</h3>
            <p className="text-gray-600">
              Trabajamos contigo para crear el diseño perfecto que represente tu personalidad.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Producción</h3>
            <p className="text-gray-600">
              Utilizamos tecnología de impresión de alta calidad y materiales resistentes.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-[#68c3b7] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Entrega</h3>
            <p className="text-gray-600">
              Enviamos tu pedido cuidadosamente empaquetado y con seguimiento incluido.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-[#68c3b7] to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para crear algo único?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Explora nuestros productos y dale tu toque personal a tus estudios
          </p>
          <div className="space-x-4">
            <a
              href="/"
              className="bg-white text-[#68c3b7] px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-block"
            >
              Ver Productos
            </a>
            <a
              href="/contacto"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#68c3b7] transition-colors inline-block"
            >
              Contactanos
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
