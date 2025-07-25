'use client';

import { useState, useEffect } from 'react';
import { CreditCard, MapPin, User, ArrowLeft, CheckCircle, Shield, Lock, Truck } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useAdminStore } from '@/lib/admin-store';
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
  
  // Información de pago
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

// Funciones de validación y formateo
const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
};

const formatExpiryDate = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
  }
  return v;
};

const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{0,3})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}${match[4] ? ' ' + match[4] : ''}`;
  }
  return value;
};

const getCardType = (cardNumber: string) => {
  const number = cardNumber.replace(/\s/g, '');
  if (/^4/.test(number)) return 'visa';
  if (/^5[1-5]/.test(number)) return 'mastercard';
  if (/^3[47]/.test(number)) return 'amex';
  return 'unknown';
};

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateCardNumber = (cardNumber: string) => {
  const number = cardNumber.replace(/\s/g, '');
  return number.length >= 13 && number.length <= 19;
};

const validateExpiryDate = (expiryDate: string) => {
  const [month, year] = expiryDate.split('/');
  if (!month || !year) return false;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  const expMonth = parseInt(month, 10);
  const expYear = parseInt(year, 10);
  
  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return false;
  return true;
};

const generateOrderId = () => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const { addOrder } = useAdminStore();
  const { addNotification } = useNotifications();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [currentStep, setCurrentStep] = useState(1);

  // Verificar autenticación
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin?callbackUrl=/checkout');
    }
  }, [session, status, router]);
  
  const [form, setForm] = useState<CheckoutForm>({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: session?.user?.name || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Aplicar formateo automático
    switch (name) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        break;
      case 'expiryDate':
        formattedValue = formatExpiryDate(value);
        break;
      case 'phone':
        formattedValue = formatPhone(value);
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').substring(0, 4);
        break;
      case 'zipCode':
        formattedValue = value.replace(/\D/g, '').substring(0, 5);
        break;
    }
    
    setForm(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name as keyof CheckoutForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {};
    
    // Validación de información personal
    if (!form.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!form.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
    if (!form.email.trim()) newErrors.email = 'El email es requerido';
    else if (!validateEmail(form.email)) newErrors.email = 'Email no válido';
    if (!form.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    
    // Validación de dirección
    if (!form.address.trim()) newErrors.address = 'La dirección es requerida';
    if (!form.city.trim()) newErrors.city = 'La ciudad es requerida';
    if (!form.state.trim()) newErrors.state = 'El estado es requerido';
    if (!form.zipCode.trim()) newErrors.zipCode = 'El código postal es requerido';
    
    // Validación de pago
    if (!form.cardName.trim()) newErrors.cardName = 'El nombre en la tarjeta es requerido';
    if (!form.cardNumber.trim()) newErrors.cardNumber = 'El número de tarjeta es requerido';
    else if (!validateCardNumber(form.cardNumber)) newErrors.cardNumber = 'Número de tarjeta inválido';
    if (!form.expiryDate.trim()) newErrors.expiryDate = 'La fecha de vencimiento es requerida';
    else if (!validateExpiryDate(form.expiryDate)) newErrors.expiryDate = 'Fecha de vencimiento inválida';
    if (!form.cvv.trim()) newErrors.cvv = 'El CVV es requerido';
    else if (form.cvv.length < 3) newErrors.cvv = 'CVV inválido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification('Por favor, corrige los errores en el formulario', 'error');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simular procesamiento de pago con pasos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generar ID único para el pedido
      const newOrderId = generateOrderId();
      setOrderId(newOrderId);
      
      // Crear el pedido para el sistema de administración
      const orderData = {
        id: newOrderId,
        customerName: `${form.firstName} ${form.lastName}`,
        customerEmail: form.email,
        customerPhone: form.phone,
        items: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
        })),
        shippingAddress: {
          street: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: 'España'
        },
        paymentMethod: {
          type: 'card',
          cardType: getCardType(form.cardNumber),
          lastFour: form.cardNumber.slice(-4)
        },
        subtotal: total,
        shipping: total >= 50 ? 0 : 9.99,
        tax: total >= 50 ? total * 0.1 : (total + 9.99) * 0.1,
        total: total >= 50 ? total * 1.1 : (total + 9.99) * 1.1,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Agregar el pedido al store de administración
      addOrder(orderData);
      
      // Simular tiempo de confirmación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOrderComplete(true);
      clearCart();
      addNotification('¡Pedido realizado con éxito!', 'success');
      
    } catch (error) {
      console.error('Error processing order:', error);
      addNotification('Error al procesar el pedido. Inténtalo de nuevo.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state mientras verifica autenticación
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#68c3b7]"></div>
      </div>
    );
  }

  // Si no está autenticado, se redirigirá
  if (!session) {
    return null;
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-600 mb-6">
            Agrega algunos productos antes de proceder al checkout
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-[#68c3b7] text-white font-semibold rounded-lg hover:bg-[#64b7ac] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Pedido confirmado!
            </h1>
            <p className="text-gray-600 mb-4">
              Tu pedido ha sido procesado exitosamente.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="text-sm text-gray-600 mb-1">Número de pedido</div>
            <div className="font-mono text-lg font-semibold text-[#68c3b7]">{orderId}</div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              <span>Pago procesado de forma segura</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Truck className="w-4 h-4 mr-2 text-[#68c3b7]" />
              <span>Entrega estimada: 3-5 días hábiles</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            Recibirás un email de confirmación con los detalles de tu pedido y la información de seguimiento.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-[#68c3b7] text-white py-3 px-4 rounded-lg hover:bg-[#64b7ac] transition-colors font-medium"
            >
              Continuar comprando
            </Link>
            <Link
              href="/mis-pedidos"
              className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Ver mis pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-[#68c3b7] hover:text-[#64b7ac] mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al carrito
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            {/* Indicador de progreso */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Proceso de Checkout</h2>
                <span className="text-sm text-gray-500">Paso 1 de 1</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#68c3b7] h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Información personal</span>
                <span>Dirección de envío</span>
                <span>Método de pago</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Personal */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Información Personal
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="123 456 789"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dirección de Envío */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Dirección de Envío
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleInputChange}
                      placeholder="Calle, número, piso, puerta..."
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado/Provincia *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={form.state}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={form.zipCode}
                        onChange={handleInputChange}
                        placeholder="12345"
                        required
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors ${
                          errors.zipCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Pago */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Información de Pago
                </h2>
                
                {/* Indicadores de seguridad */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-green-50 rounded-lg">
                  <Lock className="w-5 h-5 text-green-600" />
                  <div className="text-sm">
                    <span className="font-medium text-green-800">Pago 100% seguro</span>
                    <p className="text-green-600">Tus datos están protegidos con encriptación SSL</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre en la tarjeta *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={form.cardName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors ${
                        errors.cardName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cardName && (
                      <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de tarjeta *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={form.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                        className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {/* Indicador de tipo de tarjeta */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getCardType(form.cardNumber) === 'visa' && (
                          <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">VISA</div>
                        )}
                        {getCardType(form.cardNumber) === 'mastercard' && (
                          <div className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">MC</div>
                        )}
                        {getCardType(form.cardNumber) === 'amex' && (
                          <div className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">AMEX</div>
                        )}
                      </div>
                    </div>
                    {errors.cardNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de vencimiento *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={form.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors ${
                          errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.expiryDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={form.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                        required
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors ${
                          errors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cvv && (
                        <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Envío */}
              <div className="relative">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#68c3b7] hover:bg-[#64b7ac] transform hover:scale-[1.02]'
                  } text-white shadow-lg hover:shadow-xl`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Procesando pago...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Lock className="w-5 h-5 mr-2" />
                      Realizar pedido - €{(total >= 50 ? total * 1.1 : (total + 9.99) * 1.1).toFixed(2)}
                    </div>
                  )}
                </button>
                
                {/* Información de seguridad */}
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Protegido por encriptación SSL de 256 bits
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Resumen del Pedido
              </h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-3">
                    <div className="relative w-12 h-12">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-base">
                  <span>Subtotal</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="flex items-center">
                    Envío
                    {total >= 50 && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        ¡GRATIS!
                      </span>
                    )}
                  </span>
                  <span className={total >= 50 ? 'line-through text-gray-500' : ''}>
                    €{total >= 50 ? '0.00' : '9.99'}
                  </span>
                </div>
                {total < 50 && (
                  <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                    💡 Añade €{(50 - total).toFixed(2)} más para envío gratis
                  </div>
                )}
                <div className="flex justify-between text-base">
                  <span>Impuestos (10%)</span>
                  <span>€{(total >= 50 ? total * 0.1 : (total + 9.99) * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-[#68c3b7]">
                      €{(total >= 50 ? total * 1.1 : (total + 9.99) * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {/* Estimación de entrega */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="w-4 h-4 mr-2 text-[#68c3b7]" />
                    <span>Entrega estimada: 3-5 días hábiles</span>
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
