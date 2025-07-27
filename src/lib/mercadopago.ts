import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Configuración de entorno
export const MP_CONFIG = {
  publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002',
};

// Función para inicializar MercadoPago
const initMercadoPago = () => {
  if (!MP_CONFIG.accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN is required');
  }

  return new MercadoPagoConfig({
    accessToken: MP_CONFIG.accessToken,
    options: {
      timeout: 5000,
      idempotencyKey: 'abc'
    }
  });
};

// Instancias de los servicios - se crean de forma lazy
let _mercadopago: MercadoPagoConfig | null = null;
let _preferenceService: Preference | null = null;
let _paymentService: Payment | null = null;

export const getMercadoPago = () => {
  if (!_mercadopago) {
    _mercadopago = initMercadoPago();
  }
  return _mercadopago;
};

export const getPreferenceService = () => {
  if (!_preferenceService) {
    _preferenceService = new Preference(getMercadoPago());
  }
  return _preferenceService;
};

export const getPaymentService = () => {
  if (!_paymentService) {
    _paymentService = new Payment(getMercadoPago());
  }
  return _paymentService;
};

// URLs de retorno
export const getReturnUrls = (orderId: string) => ({
  success: `${MP_CONFIG.baseUrl}/checkout/success?order_id=${orderId}`,
  failure: `${MP_CONFIG.baseUrl}/checkout/failure?order_id=${orderId}`,
  pending: `${MP_CONFIG.baseUrl}/checkout/pending?order_id=${orderId}`,
});

// Configuración de métodos de pago
export const PAYMENT_METHODS_CONFIG = {
  // Excluir métodos de pago específicos si es necesario
  excluded_payment_methods: [
    // { id: "visa" }, // Ejemplo para excluir Visa
  ],
  
  // Excluir tipos de pago
  excluded_payment_types: [
    // { id: "atm" }, // Ejemplo para excluir ATM
  ],
  
  // Número máximo de cuotas
  installments: 12,
};
