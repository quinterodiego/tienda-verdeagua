import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: 'El iPhone más avanzado con chip A17 Pro y cámara de 48MP',
    price: 1299,
    image: 'https://picsum.photos/400/400?random=1',
    category: 'Smartphones',
    stock: 15,
    rating: 4.8,
    reviews: 127
  },
  {
    id: '2',
    name: 'MacBook Air M3',
    description: 'Laptop ultraportátil con chip M3 y pantalla Liquid Retina',
    price: 1499,
    image: 'https://picsum.photos/400/400?random=2',
    category: 'Laptops',
    stock: 8,
    rating: 4.9,
    reviews: 89
  },
  {
    id: '3',
    name: 'iPad Pro 12.9"',
    description: 'Tablet profesional con pantalla Liquid Retina XDR',
    price: 1099,
    image: 'https://picsum.photos/400/400?random=3',
    category: 'Tablets',
    stock: 12,
    rating: 4.7,
    reviews: 64
  },
  {
    id: '4',
    name: 'AirPods Pro 2',
    description: 'Auriculares inalámbricos con cancelación activa de ruido',
    price: 249,
    image: 'https://picsum.photos/400/400?random=4',
    category: 'Audio',
    stock: 25,
    rating: 4.6,
    reviews: 203
  },
  {
    id: '5',
    name: 'Apple Watch Series 9',
    description: 'Reloj inteligente con GPS y pantalla Always-On',
    price: 399,
    image: 'https://picsum.photos/400/400?random=5',
    category: 'Wearables',
    stock: 18,
    rating: 4.5,
    reviews: 156
  },
  {
    id: '6',
    name: 'Samsung Galaxy S24',
    description: 'Smartphone Android con IA y cámara de 200MP',
    price: 899,
    image: 'https://picsum.photos/400/400?random=6',
    category: 'Smartphones',
    stock: 20,
    rating: 4.4,
    reviews: 178
  }
];

export const categories = [
  'Todos',
  'Smartphones',
  'Laptops',
  'Tablets',
  'Audio',
  'Wearables'
];
