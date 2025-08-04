'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/currency';
import { CreditCard, MapPin, User, ArrowLeft, CheckCircle, Shield, Lock, Truck, AlertTriangle } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useNotifications } from '@/lib/store';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TestCardsHelper from '@/components/TestCardsHelper';
import { useSettings } from '@/lib/use-settings';
import { usePaymentMethods } from '@/lib/usePaymentMethods';

interface CheckoutForm {
  // Información personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Dirección de envío
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

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

export default function MercadoPagoCheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const { addNotification } = useNotifications();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingPreference, setIsCreatingPreference] = useState(false);
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'cash_on_pickup' | null>(null);

  // Cargar configuración del sitio y métodos de pago
  const { settings, loading: settingsLoading } = useSettings();
  const { 
    availablePaymentMethods, 
    hasAvailablePaymentMethods, 
    shippingCost, 
    freeShippingThreshold, 
    taxRate,
    loading: paymentMethodsLoading
  } = usePaymentMethods();

  console.log('🎯 MercadoPagoCheckout - Settings loading:', settingsLoading);
  console.log('🎯 MercadoPagoCheckout - Payment methods loading:', paymentMethodsLoading);
  console.log('🎯 MercadoPagoCheckout - Available methods:', availablePaymentMethods.map(m => m.id));
  console.log('🎯 MercadoPagoCheckout - Current payment method:', paymentMethod);

  // Determinar métodos de pago disponibles
  const paymentMethodsConfig = {
    mercadopago: availablePaymentMethods.some(method => method.id === 'mercadopago'),
    cashOnPickup: availablePaymentMethods.some(method => method.id === 'cashOnPickup'),
  };

  // Establecer método de pago por defecto basado en configuración
  useEffect(() => {
    // Solo proceder si los métodos de pago ya se cargaron y hay métodos disponibles
    if (!paymentMethodsLoading && availablePaymentMethods.length > 0) {
      const hasMercadoPago = paymentMethodsConfig.mercadopago;
      const hasCashOnPickup = paymentMethodsConfig.cashOnPickup;
      
      console.log('🔍 Métodos disponibles (configuración cargada):', {
        mercadopago: hasMercadoPago,
        cashOnPickup: hasCashOnPickup,
        currentSelection: paymentMethod,
        paymentMethodsLoading
      });
      
      // Solo establecer método por defecto si no hay ninguno seleccionado
      if (paymentMethod === null) {
        // Si solo uno está habilitado, usarlo como defecto
        if (hasMercadoPago && !hasCashOnPickup) {
          console.log('✅ Solo MercadoPago disponible, estableciendo como defecto');
          setPaymentMethod('mercadopago');
        } else if (!hasMercadoPago && hasCashOnPickup) {
          console.log('✅ Solo Pago al Retirar disponible, estableciendo como defecto');
          setPaymentMethod('cash_on_pickup');
        } else if (hasMercadoPago && hasCashOnPickup) {
          // Si ambos están disponibles, preferir Pago al Retirar como defecto
          console.log('✅ Ambos métodos disponibles, prefiriendo Pago al Retirar como defecto');
          setPaymentMethod('cash_on_pickup');
        }
      }
      
      // Validar que el método actual sigue siendo válido
      if (paymentMethod !== null) {
        const isCurrentMethodValid = 
          (paymentMethod === 'mercadopago' && hasMercadoPago) ||
          (paymentMethod === 'cash_on_pickup' && hasCashOnPickup);
        
        if (!isCurrentMethodValid) {
          console.log('⚠️ Método actual no válido, reseteando');
          setPaymentMethod(null);
        }
      }
    }
  }, [paymentMethodsLoading, availablePaymentMethods, paymentMethodsConfig.mercadopago, paymentMethodsConfig.cashOnPickup, paymentMethod]);

  // Verificar autenticación
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin?callbackUrl=/checkout');
    }
  }, [session, status, router]);

  // Verificar que hay items en el carrito
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);
  
  const [form, setForm] = useState<CheckoutForm>({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Actualizar form cuando session esté disponible
  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        firstName: session.user?.name?.split(' ')[0] || prev.firstName,
        lastName: session.user?.name?.split(' ').slice(1).join(' ') || prev.lastName,
        email: session.user?.email || prev.email
      }));
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Aplicar formateo automático
    if (name === 'phone') {
      formattedValue = formatPhone(value);
    }
    
    setForm(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Limpiar errores cuando el usuario empieza a escribir
    if (errors[name as keyof CheckoutForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {};
    
    // Validaciones básicas
    if (!form.firstName.trim()) newErrors.firstName = 'Nombre requerido';
    if (!form.lastName.trim()) newErrors.lastName = 'Apellido requerido';
    if (!form.email.trim()) newErrors.email = 'Email requerido';
    else if (!validateEmail(form.email)) newErrors.email = 'Email inválido';
    if (!form.phone.trim()) newErrors.phone = 'Teléfono requerido';
    else if (!validatePhone(form.phone)) newErrors.phone = 'Teléfono debe tener 10 dígitos';
    if (!form.address.trim()) newErrors.address = 'Dirección requerida';
    if (!form.city.trim()) newErrors.city = 'Ciudad requerida';
    if (!form.state.trim()) newErrors.state = 'Provincia requerida';
    if (!form.zipCode.trim()) newErrors.zipCode = 'Código postal requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCashOnPickupOrder = async () => {
    if (!validateForm()) {
      addNotification('Por favor, corrige los errores en el formulario', 'error');
      return;
    }

    setIsProcessing(true);
    
    try {
      // ✨ NUEVO: Verificar stock antes de procesar el pedido
      const stockItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const stockResponse = await fetch('/api/products/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: stockItems }),
      });

      const stockData = await stockResponse.json();

      if (!stockData.allSufficient) {
        const errorMessages = stockData.errors?.map((error: any) => 
          `${error.productName}: ${error.error}`
        ).join('\n') || 'Stock insuficiente';
        
        addNotification(`❌ Stock insuficiente:\n${errorMessages}`, 'error');
        return;
      }

      // Generar ID único para el pedido
      const orderId = generateOrderId();
      
      // Crear el pedido directamente sin MercadoPago
      const orderData = {
        customer: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
        },
        items: items.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
          },
          quantity: item.quantity,
        })),
        total: finalTotal,
        shippingAddress: {
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          phone: form.phone,
        },
        paymentMethod: 'cash_on_pickup',
        paymentStatus: 'pending' as const,
        status: 'confirmed' as const, // Los pedidos para retirar se confirman automáticamente
      };

      // Guardar el pedido en Google Sheets
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const orderError = await orderResponse.json();
        console.error('Error al crear pedido:', orderError);
        throw new Error('Error al guardar el pedido');
      }

      const orderResult = await orderResponse.json();
      console.log('Pedido para retirar creado exitosamente:', orderResult.orderId);
      
      // Limpiar el carrito
      clearCart();
      
      addNotification('¡Pedido confirmado! Te contactaremos para coordinar el retiro.', 'success');
      
      // Redirigir a página de éxito
      router.push(`/checkout/success?order_id=${orderResult.orderId}&payment_method=cash_on_pickup`);
      
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      addNotification(
        error instanceof Error ? error.message : 'Error al procesar el pedido',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMercadoPagoPayment = async () => {
    if (!validateForm()) {
      addNotification('Por favor, corrige los errores en el formulario', 'error');
      return;
    }

    setIsCreatingPreference(true);
    
    try {
      // ✨ NUEVO: Verificar stock antes de procesar el pedido
      const stockItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const stockResponse = await fetch('/api/products/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: stockItems }),
      });

      const stockData = await stockResponse.json();

      if (!stockData.allSufficient) {
        const errorMessages = stockData.errors?.map((error: any) => 
          `${error.productName}: ${error.error}`
        ).join('\n') || 'Stock insuficiente';
        
        addNotification(`❌ Stock insuficiente:\n${errorMessages}`, 'error');
        return;
      }

      // Generar ID único para el pedido
      const orderId = generateOrderId();
      
      // Preparar items para MercadoPago
      const mpItems = items.map(item => ({
        id: item.product.id,
        title: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      // Crear preferencia de pago con detección automática de modo
      console.log('🔄 Enviando datos a MercadoPago...');
      
      const response = await fetch('/api/mercadopago/preference-production', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: mpItems,
          orderId: orderId,
          customerInfo: form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error response from API:', data);
        throw new Error(data.error || 'Error al crear la preferencia de pago');
      }
      
      // Mostrar notificación según el modo
      if (data.demo) {
        const modeMessages = {
          'test': '🧪 Modo de prueba activado - Los pagos son simulados',
          'fallback': '⚠️ Error en producción - Usando modo demo como respaldo',
          'demo': '🧪 Modo demo - Configura credenciales reales para producción'
        };
        addNotification(modeMessages[data.mode as keyof typeof modeMessages] || data.message, 'warning');
      } else {
        addNotification('✅ Procesando pago real con MercadoPago', 'success');
      }
      
      // Crear el pedido en Google Sheets antes de redirigir
      const orderData = {
        customer: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
        },
        items: items.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
          },
          quantity: item.quantity,
        })),
        total: finalTotal,
        shippingAddress: {
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          phone: form.phone,
        },
        paymentId: data.preferenceId,
        paymentStatus: 'pending' as const,
        paymentMethod: 'mercadopago' as const,
        status: 'pending' as const,
      };

      // Guardar el pedido en Google Sheets
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const orderError = await orderResponse.json();
        console.error('Error al crear pedido:', orderError);
        throw new Error('Error al guardar el pedido');
      }

      const orderResult = await orderResponse.json();
      console.log('Pedido creado exitosamente:', orderResult.orderId);
      
      // Limpiar el carrito
      clearCart();
      
      addNotification('Redirigiendo a MercadoPago...', 'success');
      
      // Redirigir a MercadoPago
      // En desarrollo usa sandbox_init_point, en producción init_point
      const redirectUrl = data.sandboxInitPoint || data.initPoint;
      window.location.href = redirectUrl;
      
    } catch (error) {
      console.error('Error completo al procesar el pago:', error);
      
      // Guardar datos del carrito y formulario en localStorage para recuperación
      const failureRecoveryData = {
        items: items,
        formData: form,
        timestamp: new Date().toISOString(),
        total: total
      };
      
      try {
        localStorage.setItem('checkout_failure_recovery', JSON.stringify(failureRecoveryData));
        console.log('📦 Datos del carrito guardados para recuperación');
      } catch (storageError) {
        console.error('No se pudieron guardar los datos para recuperación:', storageError);
      }
      
      let errorMessage = 'Error desconocido al procesar el pago';
      let shouldRedirectToFailure = false;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Identificar tipos específicos de errores
        if (errorMessage.includes('preferencia de pago')) {
          errorMessage = 'No se pudo crear la preferencia de pago. Verifica tu conexión e inténtalo de nuevo.';
        } else if (errorMessage.includes('guardar el pedido')) {
          errorMessage = 'No se pudo guardar el pedido. Inténtalo de nuevo.';
        } else if (errorMessage.includes('autenticado')) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          // Redirigir al login
          window.location.href = '/auth/signin?callbackUrl=/checkout';
          return;
        } else if (errorMessage.includes('Items requeridos')) {
          errorMessage = 'El carrito está vacío. Agrega productos antes de continuar.';
          window.location.href = '/';
          return;
        }
      }
      
      // Para errores críticos, redirigir a la página de error
      if (errorMessage.includes('servidor') || errorMessage.includes('conexión')) {
        shouldRedirectToFailure = true;
      }
      
      addNotification(`❌ ${errorMessage}`, 'error');
      
      // Si es un error crítico, redirigir a failure page
      if (shouldRedirectToFailure) {
        setTimeout(() => {
          window.location.href = `/checkout/failure?error=payment_creation_failed&details=${encodeURIComponent(errorMessage)}&has_recovery=true`;
        }, 3000);
      }
    } finally {
      setIsCreatingPreference(false);
    }
  };

  // Calcular totales usando configuración del sitio
  const subtotal = total;
  const shipping = total >= freeShippingThreshold ? 0 : shippingCost;
  const tax = subtotal * taxRate; // IVA solo sobre productos, no sobre envío
  const finalTotal = subtotal + shipping + tax;

  if (status === 'loading' || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {status === 'loading' ? 'Verificando sesión...' : 'Cargando configuración...'}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Indicador de Modo de Prueba */}
        {process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_MERCADOPAGO_MODE === 'test' ? (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <h3 className="text-orange-800 font-semibold">🧪 Modo de Prueba Activado</h3>
                <p className="text-orange-700 text-sm mt-1">
                  Los pagos no son reales. Para producción, configura MERCADOPAGO_MODE=production y credenciales reales.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Helper de Tarjetas de Prueba */}
        <TestCardsHelper />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-1">Completa tu compra de forma segura</p>
          </div>
          <Link 
            href="/cart" 
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al carrito
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de información */}
          <div className="space-y-6">
            {/* Información personal */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Información personal</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInputChange}
                    className={`text-gray-600 w-full px-4 py-3 rounded-lg border ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Tu nombre"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInputChange}
                    className={`text-gray-600 w-full px-4 py-3 rounded-lg border ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Tu apellido"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className={`text-gray-600 w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className={`text-gray-600 w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="1234567890"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Dirección de envío</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    className={`text-gray-600 w-full px-4 py-3 rounded-lg border ${
                      errors.address ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Calle y número"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleInputChange}
                      className={`text-gray-600 w-full px-4 py-3 rounded-lg border ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Tu ciudad"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provincia *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleInputChange}
                      className={`text-gray-600 w-full px-4 py-3 rounded-lg border ${
                        errors.state ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Provincia"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={form.zipCode}
                      onChange={handleInputChange}
                      className={`text-gray-600 w-full px-4 py-3 rounded-lg border ${
                        errors.zipCode ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="1234"
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="space-y-6">
            {/* Items del carrito */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen del pedido</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={(item.product as any).images?.[0] || item.product.image || '/placeholder-image.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="space-y-3 py-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>{shipping === 0 ? 'Gratis' : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {/* Beneficios del envío */}
              {total >= freeShippingThreshold && (
                <div className="bg-green-50 rounded-lg p-4 mt-4">
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">¡Envío gratuito!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Método de pago */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Método de pago</h2>
              </div>

              {/* Selector de método de pago */}
              {!hasAvailablePaymentMethods ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <div>
                      <h3 className="text-red-800 font-semibold">Sin métodos de pago disponibles</h3>
                      <p className="text-red-700 text-sm mt-1">
                        No hay métodos de pago configurados. Contacta al administrador.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`grid gap-4 mb-6 ${
                  (paymentMethodsConfig.mercadopago && paymentMethodsConfig.cashOnPickup) 
                    ? 'grid-cols-1 md:grid-cols-2' 
                    : 'grid-cols-1'
                }`}>
                  {/* MercadoPago */}
                  {paymentMethodsConfig.mercadopago && (
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        paymentMethod === 'mercadopago' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('mercadopago')}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          checked={paymentMethod === 'mercadopago'}
                          onChange={() => setPaymentMethod('mercadopago')}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="font-medium text-gray-900">Pago Online</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Tarjetas de crédito, débito, transferencias
                          </p>
                          <div className="flex items-center text-sm text-blue-600">
                            <Shield className="h-4 w-4 mr-1" />
                            Pago seguro con MercadoPago
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pago al retirar */}
                  {paymentMethodsConfig.cashOnPickup && (
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        paymentMethod === 'cash_on_pickup' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('cash_on_pickup')}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          checked={paymentMethod === 'cash_on_pickup'}
                          onChange={() => setPaymentMethod('cash_on_pickup')}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <MapPin className="h-5 w-5 text-green-600 mr-2" />
                            <h3 className="font-medium text-gray-900">Pago al Retirar</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Efectivo o transferencia al retirar
                          </p>
                          <div className="flex items-center text-sm text-green-600">
                            <Truck className="h-4 w-4 mr-1" />
                            Sin costo de envío
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Información específica según método seleccionado */}
              {paymentMethod === 'mercadopago' ? (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">Pago seguro con MercadoPago</h3>
                      <p className="text-blue-800 text-sm">
                        Acepta tarjetas de crédito, débito, transferencias bancarias y más. 
                        Tus datos están protegidos con la más alta seguridad.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-green-900 mb-1">Instrucciones para el retiro</h3>
                      <p className="text-green-800 text-sm mb-2">
                        Tu pedido se reservará por 48 horas. Te contactaremos para coordinar el retiro.
                      </p>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Puedes pagar en efectivo o transferencia</li>
                        <li>• Horarios: Lunes a Viernes 9:00 - 18:00</li>
                        <li>• Dirección: Te enviaremos por WhatsApp</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de pago dinámico */}
              {!hasAvailablePaymentMethods ? (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg cursor-not-allowed"
                >
                  Sin métodos de pago disponibles
                </button>
              ) : paymentMethod === 'mercadopago' && paymentMethodsConfig.mercadopago ? (
                <button
                  onClick={handleMercadoPagoPayment}
                  disabled={isCreatingPreference || items.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isCreatingPreference ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 mr-3" />
                      Pagar con MercadoPago
                    </>
                  )}
                </button>
              ) : paymentMethod === 'cash_on_pickup' && paymentMethodsConfig.cashOnPickup ? (
                <button
                  onClick={handleCashOnPickupOrder}
                  disabled={isProcessing || items.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Procesando pedido...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5 mr-3" />
                      Confirmar Pedido para Retirar
                    </>
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg cursor-not-allowed"
                >
                  Método de pago no disponible
                </button>
              )}

              {/* Garantías */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    SSL Seguro
                  </div>
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-1" />
                    Datos protegidos
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Compra garantizada
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
