'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/currency';
import { 
  UserIcon,
  ShoppingCartIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ShieldIcon,
  AlertTriangleIcon,
  PackageIcon,
  CreditCardIcon,
  PackageCheckIcon,
  MapPinIcon,
  LockIcon
} from '@/components/Icons';
import { useCartStore } from '@/lib/store';
import { useNotifications } from '@/lib/store';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSettings } from '@/lib/use-settings';

// Componente para el ícono de MercadoPago - Actualizado
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
  const { data: session, status } = useSession();
  const addNotification = useNotifications((state) => state.addNotification);
  const router = useRouter();
  const { settings, loading: settingsLoading } = useSettings();
  
  // Payment methods - simplified to always be available
  const mercadoPagoEnabled = true;
  const cashOnPickupEnabled = true;

  // Estados
  const [isCreatingPreference, setIsCreatingPreference] = useState(false);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mercadopago' | 'cash_on_pickup'>('mercadopago');
  
  // Estados del formulario
  const [form, setForm] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});

  // Configuración desde settings - Sin cargos por envío
  const shippingCost = 0; // Sin costo de envío
  const freeShippingThreshold = 0; // Sin umbral de envío gratis

  // Prellenar formulario con datos de la sesión
  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        firstName: session.user?.name?.split(' ')[0] || '',
        lastName: session.user?.name?.split(' ').slice(1).join(' ') || '',
        email: session.user?.email || ''
      }));
    }
  }, [session]);

  // Establecer método de pago por defecto
  useEffect(() => {
    if (mercadoPagoEnabled) {
      setSelectedPaymentMethod('mercadopago');
    } else if (cashOnPickupEnabled) {
      setSelectedPaymentMethod('cash_on_pickup');
    }
  }, [mercadoPagoEnabled, cashOnPickupEnabled]);

  const validateForm = () => {
    const newErrors: Partial<CheckoutForm> = {};

    if (!form.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!form.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
    if (!form.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!validatePhone(form.phone)) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }

    // Solo validar dirección si no es "pago al retirar"
    if (selectedPaymentMethod !== 'cash_on_pickup') {
      if (!form.address.trim()) newErrors.address = 'La dirección es requerida';
      if (!form.city.trim()) newErrors.city = 'La ciudad es requerida';
      if (!form.state.trim()) newErrors.state = 'La provincia es requerida';
      if (!form.zipCode.trim()) newErrors.zipCode = 'El código postal es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    if (field === 'phone') {
      value = formatPhone(value);
    }
    
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCashOnPickupOrder = async () => {
    if (!validateForm()) {
      addNotification('Por favor, corrige los errores en el formulario', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // Crear pedido directamente con el formato correcto para la API
      const orderData = {
        customerInfo: form,
        items: items, // Enviar el formato completo de CartItem[]
        total: subtotal,
        paymentMethod: 'Pago al retirar',
        paymentStatus: 'pending'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Error al crear el pedido' };
        }
        
        throw new Error(errorData.error || 'Error al crear el pedido');
      }

      const result = await response.json();

      addNotification('✅ Pedido creado exitosamente.', 'success');
      clearCart();
      router.push('/mis-pedidos');

    } catch (error) {
      addNotification(
        `Error al procesar pedido: ${error instanceof Error ? error.message : 'Error desconocido'}`,
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

    // Verificar que el usuario esté autenticado
    if (!session || !session.user) {
      addNotification('Por favor, inicia sesión para proceder con el pago', 'error');
      router.push('/auth/signin');
      return;
    }

    setIsCreatingPreference(true);

    try {
      // Verificar stock antes de crear preferencia
      const stockItems = items.map(item => ({
        id: item.product.id,
        quantity: item.quantity
      }));

      const stockResponse = await fetch('/api/check-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: stockItems }),
      });

      if (!stockResponse.ok) {
        throw new Error('Error al verificar stock');
      }

      const stockData = await stockResponse.json();
      
      if (!stockData.available) {
        const errorMessages = stockData.errors.map((error: any) => 
          `${error.productName}: solicitado ${error.requested}, disponible ${error.available}`
        ).join('\n');
        
        addNotification(`❌ Stock insuficiente:\n${errorMessages}`, 'error');
        return;
      }

      // Crear preferencia de MercadoPago
      const mpItems = items.map(item => ({
        id: item.product.id,
        title: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        currency_id: 'ARS'
      }));

      // Generar un orderId único
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const preferenceData = {
        items: mpItems,
        orderId: orderId,
        customerInfo: form
      };

      console.log('=== CREANDO PREFERENCIA MERCADOPAGO ===');
      console.log('Datos de preferencia:', preferenceData);

      const response = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferenceData),
      });

      console.log('Respuesta del servidor - Status:', response.status);
      console.log('Respuesta del servidor - Headers:', Object.fromEntries(response.headers));
      
      // Obtener el texto crudo de la respuesta una sola vez
      const responseText = await response.text();
      console.log('Respuesta del servidor - Texto crudo:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Respuesta del servidor - JSON parseado:', responseData);
      } catch (parseError) {
        console.error('Error al parsear JSON:', parseError);
        console.error('Respuesta no es JSON válido:', responseText);
        throw new Error(`El servidor devolvió una respuesta inválida: ${responseText.substring(0, 200)}...`);
      }

      // Verificar si el usuario no está autenticado
      if (response.status === 401 && responseData.error === 'Usuario no autenticado') {
        addNotification('Por favor, inicia sesión para proceder con el pago', 'error');
        router.push('/auth/signin');
        return;
      }

      if (!response.ok) {
        // Manejar errores del servidor
        console.error('Error del servidor - Status:', response.status);
        console.error('Error del servidor - Response completa:', responseData);
        
        if (responseData && typeof responseData === 'object') {
          if (responseData.error) {
            const errorMessage = typeof responseData.error === 'string' 
              ? responseData.error 
              : JSON.stringify(responseData.error);
            const details = responseData.details ? `: ${responseData.details}` : '';
            addNotification(`Error al crear el pago: ${errorMessage}${details}`, 'error');
            return;
          }
          
          // Si no hay campo 'error', usar el mensaje completo de la respuesta
          const errorMessage = responseData.message || 
                              responseData.details || 
                              `Error HTTP ${response.status} - ${response.statusText}`;
          addNotification(`Error al crear el pago: ${errorMessage}`, 'error');
          return;
        } else {
          // Si responseData no es un objeto válido
          addNotification(`Error al crear el pago: HTTP ${response.status} - ${response.statusText}`, 'error');
          return;
        }
      }

      // Verificar que tenemos una respuesta exitosa
      if (!responseData.success || !responseData.preferenceId) {
        console.error('Respuesta del servidor incompleta:', responseData);
        addNotification('El servidor no devolvió los datos necesarios para el pago', 'error');
        return;
      }

      console.log('Preferencia creada exitosamente:', responseData.preferenceId);
      
      setPreferenceId(responseData.preferenceId);
      setIsRedirectingToPayment(true);
      
      addNotification('Redirigiendo a MercadoPago...', 'success');
      
      // Limpiar carrito antes del redirect
      setTimeout(() => {
        clearCart();
      }, 100);

      // Crear orden temporal para rastreo
      const orderData = {
        preferenceId: responseData.preferenceId,
        items: items,
        formData: form,
        paymentMethod: 'mercadopago',
        total: total
      };

      await fetch('/api/orders/pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      // Redirect a MercadoPago usando el init_point correcto
      const redirectUrl = responseData.initPoint || responseData.sandboxInitPoint;
      if (!redirectUrl) {
        throw new Error('No se recibió URL de redirección de MercadoPago');
      }
      
      console.log('Redirigiendo a:', redirectUrl);
      window.location.href = redirectUrl;
      return;

    } catch (error) {
      console.error('Error completo al crear preferencia:', error);
      console.error('Tipo de error:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Error desconocido');
      
      addNotification(
        `Error al procesar pago: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'error'
      );
    } finally {
      setIsCreatingPreference(false);
      setIsRedirectingToPayment(false);
    }
  };

  // Cálculos de totales - Sin cargos por envío
  const subtotal = total;
  const totalWithShipping = subtotal; // Igual al subtotal sin envío

  if (status === 'loading' || settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#68c3b7]"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
          <Link href="/" className="text-[#68c3b7] hover:underline">
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Inicia sesión para continuar</h2>
          <Link href="/auth/signin" className="text-[#68c3b7] hover:underline">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-[#68c3b7] hover:text-[#64b7ac] mb-4">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Volver al carrito
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
          <p className="text-gray-600 mt-2">Completa tus datos para procesar el pedido</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="space-y-6">
            {/* Métodos de Pago */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Método de Pago
              </h3>
              
              <div className="space-y-3">
                {mercadoPagoEnabled && (
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mercadopago"
                      checked={selectedPaymentMethod === 'mercadopago'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as 'mercadopago')}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <MercadoPagoIcon className="w-16 h-16 mr-4" />
                      <div>
                        <div className="font-medium">MercadoPago</div>
                        <div className="text-sm text-gray-600">Tarjetas de crédito/débito, transferencia bancaria</div>
                      </div>
                    </div>
                  </label>
                )}

                {cashOnPickupEnabled && (
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_pickup"
                      checked={selectedPaymentMethod === 'cash_on_pickup'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as 'cash_on_pickup')}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <PackageCheckIcon className="w-9 h-9 ml-4 mr-8 text-green-600" />
                      <div>
                        <div className="font-medium">Pago al Retirar</div>
                        <div className="text-sm text-gray-600">Efectivo al momento del retiro</div>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Información Personal */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
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
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
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
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
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
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
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
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dirección de Envío - Solo mostrar si no es pago al retirar */}
            {selectedPaymentMethod !== 'cash_on_pickup' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Dirección de Envío
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Calle y número"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
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
                        placeholder="Ciudad"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provincia *
                      </label>
                      <select
                        value={form.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccionar provincia</option>
                        <option value="Buenos Aires">Buenos Aires</option>
                        <option value="Catamarca">Catamarca</option>
                        <option value="Chaco">Chaco</option>
                        <option value="Chubut">Chubut</option>
                        <option value="Ciudad Autónoma de Buenos Aires">Ciudad Autónoma de Buenos Aires</option>
                        <option value="Córdoba">Córdoba</option>
                        <option value="Corrientes">Corrientes</option>
                        <option value="Entre Ríos">Entre Ríos</option>
                        <option value="Formosa">Formosa</option>
                        <option value="Jujuy">Jujuy</option>
                        <option value="La Pampa">La Pampa</option>
                        <option value="La Rioja">La Rioja</option>
                        <option value="Mendoza">Mendoza</option>
                        <option value="Misiones">Misiones</option>
                        <option value="Neuquén">Neuquén</option>
                        <option value="Río Negro">Río Negro</option>
                        <option value="Salta">Salta</option>
                        <option value="San Juan">San Juan</option>
                        <option value="San Luis">San Luis</option>
                        <option value="Santa Cruz">Santa Cruz</option>
                        <option value="Santa Fe">Santa Fe</option>
                        <option value="Santiago del Estero">Santiago del Estero</option>
                        <option value="Tierra del Fuego">Tierra del Fuego</option>
                        <option value="Tucumán">Tucumán</option>
                      </select>
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                      )}
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
                        placeholder="CP"
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resumen del Pedido */}
          <div className="space-y-6">
            {/* Productos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen del Pedido
              </h3>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {item.product.image && (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                {/* Sin cargos por envío - se elimina esta sección */}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sin mensaje de envío gratis - se elimina esta sección */}

              {/* Botón de Pago */}
              <div className="mt-6">
                {selectedPaymentMethod === 'mercadopago' ? (
                  <button
                    onClick={handleMercadoPagoPayment}
                    disabled={isCreatingPreference || isRedirectingToPayment}
                    className="w-full bg-green-600 text-white py-4 px-6 rounded-lg text-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                  >
                    {isCreatingPreference || isRedirectingToPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                        <span className="font-semibold">
                          {isRedirectingToPayment ? 'Redirigiendo a MercadoPago...' : 'Procesando pago...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <MercadoPagoIcon className="w-12 h-12 mr-3" />
                        <span className="font-semibold">Pagar con MercadoPago</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleCashOnPickupOrder}
                    disabled={isProcessing}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando pedido...
                      </>
                    ) : (
                      <>
                        <PackageCheckIcon className="w-8 h-8 mr-2" />
                        Confirmar Pedido (Pago al Retirar)
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Información de seguridad */}
              <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                <LockIcon className="w-4 h-4 mr-1" />
                <span>Transacción segura y encriptada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay de carga para MercadoPago */}
      {(isCreatingPreference || isRedirectingToPayment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isRedirectingToPayment ? 'Redirigiendo a MercadoPago...' : 'Procesando pago...'}
            </h3>
            <p className="text-gray-600 text-sm">
              {isRedirectingToPayment 
                ? 'Te llevaremos a la plataforma de pago segura de MercadoPago' 
                : 'Preparando tu orden para el pago'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
