import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem, Cart } from '@/types';

interface CartStore extends Cart {
  addItem: (product: Product, quantity?: number, selectedColor?: string, selectedMotivo?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (product: Product, quantity = 1, selectedColor?: string, selectedMotivo?: string) => {
        const { items } = get();
        // Buscar item existente con las mismas selecciones
        const existingItem = items.find(item => 
          item.product.id === product.id && 
          item.selectedColor === selectedColor && 
          item.selectedMotivo === selectedMotivo
        );

        if (existingItem) {
          set(state => ({
            items: state.items.map(item =>
              item.product.id === product.id && 
              item.selectedColor === selectedColor && 
              item.selectedMotivo === selectedMotivo
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
            ...calculateTotals(state.items.map(item =>
              item.product.id === product.id && 
              item.selectedColor === selectedColor && 
              item.selectedMotivo === selectedMotivo
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ))
          }));
        } else {
          const newItem: CartItem = { 
            product, 
            quantity, 
            selectedColor: selectedColor || undefined,
            selectedMotivo: selectedMotivo || undefined
          };
          set(state => ({
            items: [...state.items, newItem],
            ...calculateTotals([...state.items, newItem])
          }));
        }
      },

      removeItem: (productId: string, selectedColor?: string, selectedMotivo?: string) => {
        set(state => {
          const newItems = state.items.filter(item => {
            // Si no se proporcionan color/motivo, remover la primera coincidencia por productId
            if (!selectedColor && !selectedMotivo) {
              return item.product.id !== productId;
            }
            // Si se proporcionan, buscar coincidencia exacta
            return !(
              item.product.id === productId && 
              item.selectedColor === selectedColor && 
              item.selectedMotivo === selectedMotivo
            );
          });
          return {
            items: newItems,
            ...calculateTotals(newItems)
          };
        });
      },

      updateQuantity: (productId: string, quantity: number, selectedColor?: string, selectedMotivo?: string) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedColor, selectedMotivo);
          return;
        }

        set(state => {
          const newItems = state.items.map(item => {
            // Si no se proporcionan color/motivo, actualizar la primera coincidencia
            if (!selectedColor && !selectedMotivo && item.product.id === productId) {
              return { ...item, quantity };
            }
            // Si se proporcionan, buscar coincidencia exacta
            if (
              item.product.id === productId && 
              item.selectedColor === selectedColor && 
              item.selectedMotivo === selectedMotivo
            ) {
              return { ...item, quantity };
            }
            return item;
          });
          return {
            items: newItems,
            ...calculateTotals(newItems)
          };
        });
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 });
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => {
        // Solo usar localStorage en el cliente
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Fallback para SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);

function calculateTotals(items: CartItem[]) {
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
}

// Store de favoritos
interface FavoritesStore {
  favorites: string[]; // IDs de productos favoritos
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (productId: string) => {
        const { favorites } = get();
        const isCurrentlyFavorite = favorites.includes(productId);
        
        if (isCurrentlyFavorite) {
          set({
            favorites: favorites.filter(id => id !== productId)
          });
        } else {
          set({
            favorites: [...favorites, productId]
          });
        }
      },

      isFavorite: (productId: string) => {
        const { favorites } = get();
        return favorites.includes(productId);
      },

      clearFavorites: () => {
        set({ favorites: [] });
      }
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);

// Store de notificaciones
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface NotificationsStore {
  notifications: Notification[];
  addNotification: (message: string, type: Notification['type'], duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotifications = create<NotificationsStore>((set) => ({
  notifications: [],

  addNotification: (message: string, type: Notification['type'], duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = { id, message, type, duration };
    
    set(state => ({
      notifications: [...state.notifications, notification]
    }));

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      }, duration);
    }
  },

  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  }
}));
