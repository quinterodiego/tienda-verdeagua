import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Agenda Escolar Personalizada',
    description: 'Agenda anual con tu nombre y diseño favorito. Incluye calendario académico y stickers.',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    category: 'Agendas',
    stock: 50,
    rating: 4.8,
    reviews: 127
  },
  {
    id: '2',
    name: 'Taza Personalizada con Foto',
    description: 'Taza de cerámica de alta calidad con tu foto o diseño personalizado.',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
    category: 'Tazas',
    stock: 30,
    rating: 4.9,
    reviews: 89
  },
  {
    id: '3',
    name: 'Llavero Acrílico con Nombre',
    description: 'Llavero de acrílico resistente con tu nombre y diseño en colores vibrantes.',
    price: 800,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'Llaveros',
    stock: 100,
    rating: 4.7,
    reviews: 64
  },
  {
    id: '4',
    name: 'Pack de Stickers Personalizados',
    description: 'Set de 20 stickers resistentes al agua con tus diseños favoritos.',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
    category: 'Stickers',
    stock: 75,
    rating: 4.6,
    reviews: 203
  },
  {
    id: '5',
    name: 'Cuaderno Universitario Personalizado',
    description: 'Cuaderno A4 con tapas duras personalizadas, 200 hojas rayadas de alta calidad.',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
    category: 'Cuadernos',
    stock: 40,
    rating: 4.5,
    reviews: 156
  },
  {
    id: '6',
    name: 'Mochila Escolar con Bordado',
    description: 'Mochila resistente con tu nombre bordado. Múltiples compartimentos y diseño ergonómico.',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    category: 'Mochilas',
    stock: 25,
    rating: 4.8,
    reviews: 178
  },
  {
    id: '7',
    name: 'Set de Lapiceras Personalizadas',
    description: 'Pack de 3 lapiceras con tu nombre grabado. Tinta azul, negra y roja.',
    price: 1000,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
    category: 'Útiles',
    stock: 60,
    rating: 4.4,
    reviews: 95
  },
  {
    id: '8',
    name: 'Cartuchera con Diseño Personalizado',
    description: 'Cartuchera de lona con cremallera y tu diseño favorito impreso en alta calidad.',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    category: 'Cartucheras',
    stock: 35,
    rating: 4.6,
    reviews: 112
  },
  {
    id: '9',
    name: 'Marcalibros Magnético Personalizado',
    description: 'Marcalibros magnético con tu foto o frase favorita. Ideal para estudiantes.',
    price: 600,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    category: 'Marcalibros',
    stock: 80,
    rating: 4.3,
    reviews: 67
  },
  {
    id: '10',
    name: 'Termo Personalizado para Estudiantes',
    description: 'Termo de acero inoxidable de 500ml con tu diseño. Mantiene la temperatura por 12 horas.',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    category: 'Termos',
    stock: 20,
    rating: 4.7,
    reviews: 143
  }
];

export const categories = [
  'Todos',
  'Agendas',
  'Tazas',
  'Llaveros',
  'Stickers',
  'Cuadernos',
  'Mochilas',
  'Útiles',
  'Cartucheras',
  'Marcalibros',
  'Termos'
];
