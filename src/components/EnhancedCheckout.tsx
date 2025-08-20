'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/currency';
import { 
  UserIcon,
  ShoppingCartIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ShieldIcon,
  CreditCardIcon,
  MapPinIcon,
  LockIcon,
  TruckIcon,
  HomeIcon,
  BanknotesIcon
} from '@/components/Icons';
import { useCartStore } from '@/lib/store';
import { useCheckoutContext } from '@/contexts/CheckoutContext';
import { useNotifications } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/types';

// Componente para el ícono de MercadoPago
const MercadoPagoIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <Image 
    src="/mercadopago-icon-vertical.svg" 
    alt="MercadoPago" 
    width={64} 
    height={64} 
    className={className}
  />
);

interface CheckoutForm {
  // Información personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Dirección de envío (solo si selecciona envío)
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Notas adicionales
  notes: string;
}

// Tipos para opciones de pago y envío
type PaymentMethod = 'mercadopago' | 'transfer';
type DeliveryMethod = 'pickup' | 'delivery';

// Funciones de validación y formateo
const formatPhone = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  return v.substring(0, 10);
};

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string) => {
  return /^[0-9]{10}$/.test(phone.replace(/\s/g, ''));
};

const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

export default function EnhancedCheckout() {
  const { items, total, clearCart } = useCartStore();
  const { data: session } = useSession();
  const { setProcessingPayment, setRedirectingTo, setOrderData, clearCheckoutState } = useCheckoutContext();
  const addNotification = useNotifications((state) => state.addNotification);
  const router = useRouter();
  
  // Estados principales
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('mercadopago');
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [step, setStep] = useState<'info' | 'review' | 'processing'>('info');
  const [isRetryOrder, setIsRetryOrder] = useState(false); // Nuevo estado para detectar reintento
  
  // Estados del formulario
  const [form, setForm] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });
  
  // Estados de validación
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [isValidForm, setIsValidForm] = useState(false);
  
  // Costos de envío
  const deliveryCost = selectedDeliveryMethod === 'delivery' ? 500 : 0; // $5.00 envío
  const finalTotal = total + deliveryCost;

  // Cargar datos del usuario si está logueado
  useEffect(() => {
    if (session?.user?.email) {
      setForm(prev => ({
        ...prev,
        email: session.user?.email || '',
        firstName: session.user?.name?.split(' ')[0] || '',
        lastName: session.user?.name?.split(' ').slice(1).join(' ') || ''
      }));
    }
  }, [session]);

  // Cargar datos de reintento de pago si existen
  useEffect(() => {
    const retryPaymentData = localStorage.getItem('retryPaymentOrder');
    if (retryPaymentData) {
      try {
        const orderData = JSON.parse(retryPaymentData);
        console.log('🔄 Cargando datos de reintento:', orderData);
        
        // Marcar como reintento
        setIsRetryOrder(true);
        
        // Cargar items al carrito
        if (orderData.items && orderData.items.length > 0) {
          // Limpiar carrito actual
          clearCart();
          
          // Agregar items del pedido
          orderData.items.forEach((item: { product: Product; quantity: number }) => {
            if (item.product) {
              useCartStore.getState().addItem(item.product, item.quantity);
            }
          });
        }
        
        // Cargar datos del formulario
        if (orderData.formData) {
          setForm(prev => ({
            ...prev,
            ...orderData.formData
          }));
        }
        
        // Establecer método de pago
        if (orderData.paymentMethod) {
          setSelectedPaymentMethod(orderData.paymentMethod);
        }
        
        console.log('✅ Datos de reintento cargados correctamente');
        
      } catch (error) {
        console.error('❌ Error al cargar datos de reintento:', error);
        localStorage.removeItem('retryPaymentOrder');
      }
    }
  }, [clearCart, setIsRetryOrder]);

  // Validación del formulario
  useEffect(() => {
    const newErrors: Partial<CheckoutForm> = {};
    
    if (!form.firstName.trim()) newErrors.firstName = 'Nombre requerido';
    if (!form.lastName.trim()) newErrors.lastName = 'Apellido requerido';
    if (!form.email.trim()) newErrors.email = 'Email requerido';
    else if (!validateEmail(form.email)) newErrors.email = 'Email inválido';
    if (!form.phone.trim()) newErrors.phone = 'Teléfono requerido';
    else if (!validatePhone(form.phone)) newErrors.phone = 'Teléfono inválido (10 dígitos)';
    
    // Validar dirección solo si selecciona envío
    if (selectedDeliveryMethod === 'delivery') {
      if (!form.address.trim()) newErrors.address = 'Dirección requerida';
      if (!form.city.trim()) newErrors.city = 'Ciudad requerida';
      if (!form.state.trim()) newErrors.state = 'Provincia requerida';
      if (!form.zipCode.trim()) newErrors.zipCode = 'Código postal requerido';
    }
    
    setErrors(newErrors);
    setIsValidForm(Object.keys(newErrors).length === 0);
  }, [form, selectedDeliveryMethod]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    if (field === 'phone') {
      value = formatPhone(value);
    }
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!isValidForm) {
      addNotification('Por favor, completa todos los campos requeridos', 'error');
      return;
    }

    if (items.length === 0) {
      addNotification('Tu carrito está vacío', 'error');
      return;
    }

    setStep('processing');
    setIsProcessing(true);

    try {
      if (selectedPaymentMethod === 'mercadopago') {
        await handleMercadoPagoPayment();
      } else if (selectedPaymentMethod === 'transfer') {
        await handleTransferPayment();
      }
    } catch (error) {
      console.error('Error en checkout:', error);
      addNotification('Error al procesar el pedido. Inténtalo de nuevo.', 'error');
      setStep('info');
      setIsProcessing(false);
    }
  };

  // Manejar pago con MercadoPago
  const handleMercadoPagoPayment = async () => {
    try {
      // Marcar actividad de pago
      localStorage.setItem('lastPaymentActivity', Date.now().toString());
      
      const orderId = generateOrderId();
      
      // Crear preference de MercadoPago
      const response = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.product.id,
            title: item.product.name,
            unit_price: item.product.price,
            quantity: item.quantity,
            currency_id: 'ARS'
          })),
          orderId,
          customerInfo: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone
          },
          deliveryInfo: {
            method: selectedDeliveryMethod,
            address: selectedDeliveryMethod === 'delivery' ? {
              street: form.address,
              city: form.city,
              state: form.state,
              zipCode: form.zipCode
            } : null,
            cost: deliveryCost
          },
          total: finalTotal,
          notes: form.notes
        })
      });

      if (!response.ok) throw new Error('Error al crear preferencia de pago');

      const data = await response.json();
      console.log('📦 Respuesta de MercadoPago:', data);
      
      // Guardar datos del pedido
      setOrderData({
        orderId,
        items,
        total: finalTotal,
        customerInfo: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone
        },
        deliveryInfo: {
          method: selectedDeliveryMethod,
          address: selectedDeliveryMethod === 'delivery' ? {
            street: form.address,
            city: form.city,
            state: form.state,
            zipCode: form.zipCode
          } : null,
          cost: deliveryCost
        },
        paymentMethod: selectedPaymentMethod,
        preferenceId: data.preferenceId || data.id
      });

      setProcessingPayment(true);
      setRedirectingTo('mercadopago');

      // Redirigir a MercadoPago
      const redirectUrl = data.initPoint || data.init_point;
      console.log('🔗 URL de redirección:', redirectUrl);
      if (!redirectUrl) {
        throw new Error('No se recibió URL de redirección');
      }
      console.log('🚀 Redirigiendo a:', redirectUrl);
      window.location.href = redirectUrl;
      
    } catch (error) {
      throw error;
    }
  };

  // Manejar pago por transferencia
  const handleTransferPayment = async () => {
    try {
      const orderId = generateOrderId();
      
      // Crear pedido pendiente de pago
      const response = await fetch('/api/orders/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          items,
          total: finalTotal,
          customerInfo: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone
          },
          deliveryInfo: {
            method: selectedDeliveryMethod,
            address: selectedDeliveryMethod === 'delivery' ? {
              street: form.address,
              city: form.city,
              state: form.state,
              zipCode: form.zipCode
            } : null,
            cost: deliveryCost
          },
          paymentMethod: 'transfer',
          status: 'pending_transfer',
          notes: form.notes
        })
      });

      if (!response.ok) throw new Error('Error al crear pedido');

      await response.json();
      
      // Limpiar carrito después de crear el pedido exitosamente
      clearCart();
      clearCheckoutState();
      
      // Redirigir a página de transferencia con información del pedido
      router.push(`/checkout/transfer?orderId=${orderId}&amount=${finalTotal}`);
      
    } catch (error) {
      throw error;
    }
  };

  // Renderizar paso de información
  const renderInfoStep = () => (
    <div className="space-y-8">
      {/* Información personal */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
          <UserIcon className="h-5 w-5 mr-2 text-[#68c3b7]" />
          Información Personal
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Tu nombre"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Tu apellido"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="tu@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1234567890"
              maxLength={10}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Método de entrega */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
          <TruckIcon className="h-5 w-5 mr-2 text-[#68c3b7]" />
          Método de Entrega
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setSelectedDeliveryMethod('pickup')}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedDeliveryMethod === 'pickup'
                ? 'border-[#68c3b7] bg-[#68c3b7]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <HomeIcon className="h-6 w-6 text-[#68c3b7] mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Retiro en domicilio</h4>
                  <p className="text-sm text-gray-600">Coordinamos el retiro contigo</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">GRATIS</p>
              </div>
            </div>
          </div>
          
          <div
            onClick={() => setSelectedDeliveryMethod('delivery')}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedDeliveryMethod === 'delivery'
                ? 'border-[#68c3b7] bg-[#68c3b7]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TruckIcon className="h-6 w-6 text-[#68c3b7] mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Envío a domicilio</h4>
                  <p className="text-sm text-gray-600">Entregamos en tu dirección</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{formatCurrency(deliveryCost)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dirección de envío (solo si selecciona envío) */}
      {selectedDeliveryMethod === 'delivery' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
            <MapPinIcon className="h-5 w-5 mr-2 text-[#68c3b7]" />
            Dirección de Envío
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección completa *
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Calle, número, piso, depto"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tu ciudad"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provincia *
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tu provincia"
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal *
                </label>
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                    errors.zipCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1234"
                />
                {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Método de pago */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
          <CreditCardIcon className="h-5 w-5 mr-2 text-[#68c3b7]" />
          Método de Pago
        </h3>
        
        <div className="space-y-4">
          <div
            onClick={() => setSelectedPaymentMethod('mercadopago')}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedPaymentMethod === 'mercadopago'
                ? 'border-[#68c3b7] bg-[#68c3b7]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MercadoPagoIcon className="w-12 h-12 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">MercadoPago</h4>
                  <p className="text-sm text-gray-600">Tarjetas, efectivo, transferencias</p>
                </div>
              </div>
              <div className="flex items-center text-[#68c3b7]">
                <ShieldIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div
            onClick={() => setSelectedPaymentMethod('transfer')}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedPaymentMethod === 'transfer'
                ? 'border-[#68c3b7] bg-[#68c3b7]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BanknotesIcon className="h-12 w-12 text-[#68c3b7] mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Transferencia Bancaria</h4>
                  <p className="text-sm text-gray-600">Pago previo por transferencia</p>
                </div>
              </div>
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notas adicionales */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notas Adicionales (Opcional)
        </h3>
        
        <textarea
          value={form.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
          rows={3}
          placeholder="Instrucciones especiales, horarios de entrega, etc."
        />
      </div>
    </div>
  );

  // Renderizar paso de procesamiento
  const renderProcessingStep = () => (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#68c3b7] mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Procesando tu pedido...
      </h3>
      <p className="text-gray-600">
        {selectedPaymentMethod === 'mercadopago' 
          ? 'Redirigiendo a MercadoPago...'
          : 'Creando tu pedido...'
        }
      </p>
    </div>
  );

  // Verificar si el carrito está vacío
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-6">
              Agrega algunos productos antes de proceder al checkout
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-6 py-3 bg-[#68c3b7] text-white rounded-lg hover:bg-[#5ab3a7] transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          {isRetryOrder ? (
            <button
              onClick={() => router.push('/mis-pedidos')}
              className="inline-flex items-center text-[#68c3b7] hover:text-[#5ab3a7] mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver a mis pedidos
            </button>
          ) : (
            <button
              onClick={() => router.push('/cart')}
              className="inline-flex items-center text-[#68c3b7] hover:text-[#5ab3a7] mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver al carrito
            </button>
          )}
          
          <h1 className="text-3xl font-bold text-gray-900">
            {isRetryOrder ? 'Completar Pago' : 'Checkout'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRetryOrder 
              ? 'Puedes cambiar el método de pago si lo deseas'
              : 'Completa tu información para finalizar la compra'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2">
            {step === 'info' && renderInfoStep()}
            {step === 'processing' && renderProcessingStep()}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen del Pedido
              </h3>
              
              {/* Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        {item.product.image && (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium text-sm">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                
                {selectedDeliveryMethod === 'delivery' && (
                  <div className="flex justify-between text-sm">
                    <span>Envío</span>
                    <span>{formatCurrency(deliveryCost)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>
              
              {/* Información del método seleccionado */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entrega:</span>
                    <span className="font-medium">
                      {selectedDeliveryMethod === 'pickup' ? 'Retiro en domicilio' : 'Envío a domicilio'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pago:</span>
                    <span className="font-medium">
                      {selectedPaymentMethod === 'mercadopago' ? 'MercadoPago' : 'Transferencia'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Botón de confirmar */}
              {step === 'info' && (
                <button
                  onClick={handleSubmit}
                  disabled={!isValidForm || isProcessing}
                  className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    isValidForm && !isProcessing
                      ? 'bg-[#68c3b7] text-white hover:bg-[#5ab3a7]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? 'Procesando...' : `Confirmar Pedido - ${formatCurrency(finalTotal)}`}
                </button>
              )}
              
              {/* Información de seguridad */}
              <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                <LockIcon className="h-4 w-4 mr-1" />
                Compra 100% segura y protegida
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
