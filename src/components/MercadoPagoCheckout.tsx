'use client';

import { useState, useEffect } from 'react';
import { CreditCard, MapPin, User, ArrowLeft, CheckCircle, Shield, Lock, Truck } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useNotifications } from '@/lib/store';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

  const handleMercadoPagoPayment = async () => {
    if (!validateForm()) {
      addNotification('Por favor, corrige los errores en el formulario', 'error');
      return;
    }

    setIsCreatingPreference(true);
    
    try {
      // Generar ID único para el pedido
      const orderId = generateOrderId();
      
      // Preparar items para MercadoPago
      const mpItems = items.map(item => ({
        id: item.product.id,
        title: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      // Crear preferencia de pago
      const response = await fetch('/api/mercadopago/preference', {
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
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar el pago';
      addNotification(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsCreatingPreference(false);
    }
  };

  // Calcular totales
  const subtotal = total;
  const shipping = total >= 50 ? 0 : 9.99;
  const tax = (total >= 50 ? total : total + shipping) * 0.1;
  const finalTotal = subtotal + shipping + tax;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        src={item.product.image}
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
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="space-y-3 py-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Beneficios del envío */}
              {total >= 50 && (
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

              {/* Información sobre MercadoPago */}
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

              {/* Botón de pago */}
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
