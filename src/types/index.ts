export type ProductStatus = 'active' | 'inactive' | 'pending' | 'draft';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // Imagen principal (para compatibilidad)
  images?: string[]; // Array de todas las imágenes
  category: string;
  stock: number;
  rating?: number;
  reviews?: number;
  status?: ProductStatus; // Estado del producto
  medidas?: string; // Medidas del producto personalizado
  color?: string; // Color individual (backwards compatibility)
  colores?: string[]; // Array de colores asignados al producto
  motivos?: string[]; // Array de motivos asignados al producto
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string; // ID del color seleccionado
  selectedMotivo?: string; // ID del motivo seleccionado
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Tipos de roles de usuario
export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
  id: string;
  email: string;
  password?: string; // opcional para usuarios OAuth
  name: string;
  image?: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export type OrderStatus = 'payment_pending' | 'pending_transfer' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  paymentId?: string;
  paymentStatus?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  paymentMethod?: 'mercadopago' | 'cash_on_pickup' | 'tarjeta_credito' | 'tarjeta_debito' | 'efectivo' | 'transferencia_bancaria' | 'dinero_cuenta_mp' | 'transfer';
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  trackingNumber?: string;
  shippingUrl?: string;
  estimatedDelivery?: Date;
  notes?: string;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
  shippingUrl?: string;
  estimatedDelivery?: Date;
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

// MercadoPago Types
export interface MercadoPagoPreference {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    identification?: {
      type?: string;
      number?: string;
    };
    address?: {
      street_name?: string;
      street_number?: number;
      zip_code?: string;
    };
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: string;
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  notification_url?: string;
  statement_descriptor?: string;
  external_reference?: string;
}

export interface MercadoPagoPayment {
  id: number;
  date_created: string;
  date_approved: string;
  date_last_updated: string;
  money_release_date: string;
  operation_type: string;
  issuer_id: string;
  payment_method_id: string;
  payment_type_id: string;
  status: string;
  status_detail: string;
  currency_id: string;
  description: string;
  live_mode: boolean;
  sponsor_id: number;
  authorization_code: string;
  money_release_schema: string;
  taxes_amount: number;
  counter_currency: string;
  brand_id: string;
  shipping_amount: number;
  pos_id: string;
  store_id: string;
  integrator_id: string;
  platform_id: string;
  corporation_id: string;
  payer: {
    id: string;
    email: string;
    identification: {
      type: string;
      number: string;
    };
    type: string;
  };
  metadata: Record<string, string | number | boolean>;
  order: Record<string, string | number | boolean>;
  external_reference: string;
  transaction_amount: number;
  transaction_amount_refunded: number;
  coupon_amount: number;
  differential_pricing_id: string;
  deduction_schema: string;
  installments: number;
  transaction_details: {
    net_received_amount: number;
    total_paid_amount: number;
    overpaid_amount: number;
    external_resource_url: string;
    installment_amount: number;
    financial_institution: string;
    payment_method_reference_id: string;
    payable_deferral_period: string;
    acquirer_reference: string;
  };
}

// Admin types
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating?: number;
  reviews?: number;
  isVisible: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
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
