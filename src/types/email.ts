export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    email: string;
    name: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  orderDate: string;
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

export interface TestEmailData {
  recipientEmail: string;
  testType: 'welcome' | 'order_confirmation' | 'custom';
  customSubject?: string;
  customMessage?: string;
}

export interface OrderStatusUpdateEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  newStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  orderDate: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  cancellationReason?: string;
}

export type EmailType = 'welcome' | 'order_confirmation' | 'order_status_update' | 'test';
