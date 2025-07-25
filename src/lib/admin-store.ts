'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  registeredAt: string;
  lastLogin?: string;
  isActive: boolean;
  ordersCount: number;
  totalSpent: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  stock: number;
  isActive: boolean;
  sku: string;
  brand?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  description: string;
  currency: string;
  shippingCost: number;
  freeShippingThreshold: number;
  taxRate: number;
  notifications: {
    newOrders: boolean;
    lowStock: boolean;
    newUsers: boolean;
  };
  paymentMethods: {
    paypal: boolean;
    stripe: boolean;
    bankTransfer: boolean;
  };
}

interface AdminState {
  // Products
  products: AdminProduct[];
  addProduct: (product: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  
  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  
  // Users
  users: AdminUser[];
  addUser: (user: Omit<AdminUser, 'id' | 'registeredAt'>) => void;
  updateUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;
  
  // Settings
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => void;
  
  // Stats
  getStats: () => {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
    lowStockProducts: number;
    todayOrders: number;
    monthlyRevenue: number;
    topProducts: Array<{ name: string; sales: number; revenue: number }>;
  };
}

// Datos iniciales
const initialProducts: AdminProduct[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: 'El último iPhone con chip A17 Pro',
    price: 999,
    originalPrice: 1099,
    category: 'smartphones',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'],
    stock: 45,
    isActive: true,
    sku: 'IPH15P-001',
    brand: 'Apple',
    tags: ['nuevo', 'premium'],
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-24T10:00:00Z'
  },
  {
    id: '2',
    name: 'MacBook Air M3',
    description: 'Laptop ultradelgada con chip M3',
    price: 1199,
    category: 'laptops',
    images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'],
    stock: 23,
    isActive: true,
    sku: 'MBA-M3-001',
    brand: 'Apple',
    tags: ['productividad', 'premium'],
    createdAt: '2025-01-18T10:00:00Z',
    updatedAt: '2025-01-24T10:00:00Z'
  },
  {
    id: '3',
    name: 'iPad Pro',
    description: 'Tablet profesional con pantalla Liquid Retina',
    price: 799,
    category: 'tablets',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'],
    stock: 12,
    isActive: true,
    sku: 'IPD-PRO-001',
    brand: 'Apple',
    tags: ['creatividad', 'profesional'],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-24T10:00:00Z'
  },
  {
    id: '4',
    name: 'AirPods Pro',
    description: 'Audífonos inalámbricos con cancelación de ruido',
    price: 199,
    originalPrice: 249,
    category: 'audio',
    images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400'],
    stock: 67,
    isActive: true,
    sku: 'APP-001',
    brand: 'Apple',
    tags: ['audio', 'inalámbrico'],
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-24T10:00:00Z'
  }
];

const initialOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Juan Pérez',
    customerEmail: 'juan@example.com',
    items: [
      { id: '1', name: 'iPhone 15 Pro', price: 999, quantity: 1, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100' }
    ],
    total: 999,
    status: 'pending',
    createdAt: '2025-01-24T10:00:00Z',
    shippingAddress: {
      street: 'Calle Principal 123',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28001',
      country: 'España'
    }
  },
  {
    id: 'ORD-002',
    customerName: 'María García',
    customerEmail: 'maria@example.com',
    items: [
      { id: '2', name: 'MacBook Air M3', price: 1199, quantity: 1, image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100' }
    ],
    total: 1199,
    status: 'shipped',
    createdAt: '2025-01-24T09:00:00Z'
  },
  {
    id: 'ORD-003',
    customerName: 'Carlos López',
    customerEmail: 'carlos@example.com',
    items: [
      { id: '3', name: 'iPad Pro', price: 799, quantity: 1, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100' },
      { id: '4', name: 'AirPods Pro', price: 199, quantity: 2, image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=100' }
    ],
    total: 1197,
    status: 'delivered',
    createdAt: '2025-01-23T15:00:00Z'
  }
];

const initialUsers: AdminUser[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    role: 'user',
    registeredAt: '2025-01-20T10:00:00Z',
    lastLogin: '2025-01-24T08:00:00Z',
    isActive: true,
    ordersCount: 3,
    totalSpent: 2500
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@example.com',
    role: 'user',
    registeredAt: '2025-01-18T10:00:00Z',
    lastLogin: '2025-01-24T09:00:00Z',
    isActive: true,
    ordersCount: 7,
    totalSpent: 4200
  },
  {
    id: '3',
    name: 'Carlos López',
    email: 'carlos@example.com',
    role: 'user',
    registeredAt: '2025-01-15T10:00:00Z',
    lastLogin: '2025-01-23T20:00:00Z',
    isActive: true,
    ordersCount: 2,
    totalSpent: 1500
  }
];

const initialSettings: StoreSettings = {
  storeName: 'TechStore',
  contactEmail: 'contact@techstore.com',
  description: 'La mejor tienda de tecnología online',
  currency: 'EUR',
  shippingCost: 15,
  freeShippingThreshold: 100,
  taxRate: 21,
  notifications: {
    newOrders: true,
    lowStock: true,
    newUsers: false
  },
  paymentMethods: {
    paypal: true,
    stripe: false,
    bankTransfer: true
  }
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Initial state
      products: initialProducts,
      orders: initialOrders,
      users: initialUsers,
      settings: initialSettings,

      // Product actions
      addProduct: (product) => {
        const newProduct: AdminProduct = {
          ...product,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({
          products: [...state.products, newProduct]
        }));
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? { ...product, ...updates, updatedAt: new Date().toISOString() }
              : product
          )
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id)
        }));
      },

      // Order actions
      addOrder: (order) => {
        const newOrder: Order = {
          ...order,
          id: `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          orders: [...state.orders, newOrder]
        }));
      },

      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status } : order
          )
        }));
      },

      // User actions
      addUser: (user) => {
        const newUser: AdminUser = {
          ...user,
          id: Math.random().toString(36).substr(2, 9),
          registeredAt: new Date().toISOString()
        };
        set((state) => ({
          users: [...state.users, newUser]
        }));
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          )
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id)
        }));
      },

      // Settings actions
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates }
        }));
      },

      // Stats
      getStats: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = new Date().toISOString().slice(0, 7);

        const todayOrders = state.orders.filter(order => 
          order.createdAt.startsWith(today)
        ).length;

        const monthlyRevenue = state.orders
          .filter(order => order.createdAt.startsWith(thisMonth))
          .reduce((sum, order) => sum + order.total, 0);

        const lowStockProducts = state.products.filter(product => 
          product.stock < 20
        ).length;

        // Calcular productos más vendidos
        const productSales: { [key: string]: { name: string; sales: number; revenue: number } } = {};
        
        state.orders.forEach(order => {
          order.items.forEach(item => {
            if (!productSales[item.id]) {
              productSales[item.id] = { name: item.name, sales: 0, revenue: 0 };
            }
            productSales[item.id].sales += item.quantity;
            productSales[item.id].revenue += item.price * item.quantity;
          });
        });

        const topProducts = Object.values(productSales)
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 4);

        return {
          totalProducts: state.products.length,
          totalOrders: state.orders.length,
          totalUsers: state.users.length,
          totalRevenue: state.orders.reduce((sum, order) => sum + order.total, 0),
          lowStockProducts,
          todayOrders,
          monthlyRevenue,
          topProducts
        };
      }
    }),
    {
      name: 'admin-store',
      // Solo persistir algunos datos importantes
      partialize: (state) => ({
        products: state.products,
        orders: state.orders,
        users: state.users,
        settings: state.settings
      })
    }
  )
);
