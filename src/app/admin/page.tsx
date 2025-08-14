'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  ArrowLeft,
  Eye,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Tag,
  // CreditCard, // Oculto temporalmente
  HelpCircle,
  Menu as MenuIcon,
  X,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/lib/admin-store';
import { AdminProduct } from '@/lib/admin-products-sheets'; // Importar la interfaz correcta
import ProductModal from '@/components/admin/ProductModal';
import OrderModal from '@/components/admin/OrderModal';
import UserRoleManager from '@/components/admin/UserRoleManager';
import ContactTestPanel from '@/components/admin/ContactTestPanel';
// import MercadoPagoTestPanel from '@/components/admin/MercadoPagoTestPanel'; // Oculto temporalmente
import EmailTestPanel from '@/components/admin/EmailTestPanel';
import EmailPreviewPanel from '@/components/admin/EmailPreviewPanel';
import OrderStatusEmailTestPanel from '@/components/admin/OrderStatusEmailTestPanel';
import { useNotifications, NotificationsStore } from '@/lib/store';
import { isAdminUserSync } from '@/lib/admin-config';
import { User } from '@/types';

// Interfaz para usuarios de admin desde Google Sheets (extendida de User)
interface AdminUser extends User {
  lastLogin?: string;
  isActive: boolean;
  ordersCount: number;
  totalSpent: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const addNotification = useNotifications((state: NotificationsStore) => state.addNotification);

  // Estados para datos de Google Sheets
  const [sheetsProducts, setSheetsProducts] = useState<AdminProduct[]>([]);
  const [sheetsUsers, setSheetsUsers] = useState<AdminUser[]>([]);
  const [sheetsOrders, setSheetsOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Modal states
  const [productModal, setProductModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    product?: AdminProduct;
  }>({ isOpen: false, mode: 'create' });

  const [orderModal, setOrderModal] = useState<{
    isOpen: boolean;
    order?: Order;
  }>({ isOpen: false });

  const [showUserRoleManager, setShowUserRoleManager] = useState(false);

  // Verificar si Cloudinary está configurado
  const isCloudinaryConfigured = useMemo(() => {
    // Verificar localStorage
    if (typeof window !== 'undefined' && localStorage.getItem('cloudinary_configured')) {
      return true;
    }
    
    // Verificar si ya hay productos con imágenes de Cloudinary
    const hasCloudinaryImages = sheetsProducts.some((product: AdminProduct) => 
      product.images?.some((img: string) => img.includes('cloudinary.com'))
    );
    
    if (hasCloudinaryImages) {
      // Marcar como configurado en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cloudinary_configured', 'true');
      }
      return true;
    }
    
    return false;
  }, [sheetsProducts]);

  // Verificar si el sistema necesita configuración inicial
  const needsSystemConfiguration = useMemo(() => {
    // No mostrar durante la carga
    if (loading) {
      return false;
    }

    // 1. Verificar localStorage - Si nunca se configuró
    const hasBeenConfigured = typeof window !== 'undefined' && 
      localStorage.getItem('admin_system_configured') === 'true';
    
    // 2. Verificar si hay datos básicos en el sistema
    const hasBasicData = sheetsProducts.length > 0 || sheetsUsers.length > 0 || sheetsOrders.length > 0;
    
    // 3. Auto-marcado inteligente: Si hay datos pero no está marcado como configurado
    if (hasBasicData && !hasBeenConfigured && typeof window !== 'undefined') {
      // Marcar automáticamente como configurado
      localStorage.setItem('admin_system_configured', 'true');
      return false; // Ocultar el botón inmediatamente
    }
    
    // 4. Si ya se configuró antes y hay datos, no necesita configuración
    if (hasBeenConfigured && hasBasicData) {
      return false;
    }
    
    // 5. Si no hay datos básicos, necesita configuración
    if (!hasBasicData) {
      return true;
    }
    
    // 6. Fallback: no mostrar por defecto
    return false;
  }, [loading, sheetsProducts.length, sheetsUsers.length, sheetsOrders.length]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/admin');
      return;
    }

    // Verificar si es admin
    if (!isAdminUserSync(session)) {
      router.push('/');
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  // Funciones para cargar datos desde Google Sheets
  const loadSheetsData = useCallback(async () => {
    setDataLoading(true);
    try {
      // Cargar productos
      const productsResponse = await fetch('/api/admin/products');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setSheetsProducts(productsData.products || []);
      }

      // Cargar usuarios
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setSheetsUsers(usersData.users || []);
      }

      // Cargar pedidos
      const ordersResponse = await fetch('/api/admin/orders');
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setSheetsOrders(ordersData.orders || []);
      } else {
        console.warn('⚠️ Error al cargar pedidos desde Google Sheets');
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      addNotification('Error al cargar datos del sistema', 'error');
    } finally {
      setDataLoading(false);
    }
  }, [addNotification]);

  // Configurar Google Sheets para admin
  const setupAdminSheets = async () => {
    try {
      setDataLoading(true);
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Marcar el sistema como configurado
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_system_configured', 'true');
        }
        
        addNotification('Sistema configurado exitosamente', 'success');
        await loadSheetsData(); // Recargar datos después de configurar
      } else {
        addNotification('Error en la configuración: ' + data.results.errors.join(', '), 'error');
      }
    } catch (error) {
      console.error('Error al configurar sistema:', error);
      addNotification('Error al configurar el sistema', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (!loading && session) {
      loadSheetsData();
    }
  }, [loading, session, loadSheetsData]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#68c3b7]"></div>
      </div>
    );
  }

  if (!session || !isAdminUserSync(session)) {
    return null;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorías', icon: Tag },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'users', label: 'Usuarios', icon: Users },
    // { id: 'test-payments', label: 'Pagos de Prueba', icon: CreditCard }, // Oculto temporalmente
    { id: 'test-emails', label: 'Envío de Emails', icon: Mail },
    { id: 'email-preview', label: 'Diseño de Emails', icon: Eye },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  // Función para abrir setup de Cloudinary
  const openCloudinarySetup = () => {
    window.open('/setup', '_blank');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardContent 
            sheetsProducts={sheetsProducts}
            sheetsUsers={sheetsUsers}
            sheetsOrders={sheetsOrders}
            dataLoading={dataLoading}
            needsSystemConfiguration={needsSystemConfiguration}
            onSetupSheets={setupAdminSheets}
            onReloadData={loadSheetsData}
          />
        );
      case 'products':
        return (
          <ProductsContent />
        );
      case 'categories':
        return (
          <CategoriesContent />
        );
      case 'orders':
        return (
          <OrdersContent />
        );
      case 'users':
        return (
          <UsersContent />
        );
      // case 'test-payments':
      //   return <MercadoPagoTestPanel />; // Oculto temporalmente
      case 'test-emails':
        return (
          <div className="space-y-6">
            <EmailTestPanel 
              onSendTest={(result) => {
                addNotification(
                  result.message,
                  result.success ? 'success' : 'error'
                );
              }}
            />
            
            <OrderStatusEmailTestPanel />
            
            <ContactTestPanel 
              onTestResult={(result) => {
                addNotification(
                  result.message,
                  result.success ? 'success' : 'error'
                );
              }}
            />
          </div>
        );
      case 'email-preview':
        return (
          <EmailPreviewPanel 
            onSendTest={(result) => {
              addNotification(
                result.message,
                result.success ? 'success' : 'error'
              );
            }}
          />
        );
      case 'settings':
        return <SettingsContent />;
      default:
        return (
          <DashboardContent 
            sheetsProducts={sheetsProducts}
            sheetsUsers={sheetsUsers}
            sheetsOrders={sheetsOrders}
            dataLoading={dataLoading}
            needsSystemConfiguration={needsSystemConfiguration}
            onSetupSheets={setupAdminSheets}
            onReloadData={loadSheetsData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Botón hamburguesa para mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#68c3b7] mr-2"
                aria-label="Abrir menú de navegación"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
              
              <Link
                href="/"
                className="flex items-center text-[#68c3b7] hover:text-[#64b7ac] mr-3 sm:mr-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Volver a la tienda</span>
                <span className="sm:hidden">Tienda</span>
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                <span className="hidden sm:inline">Panel de Administración</span>
                <span className="sm:hidden">Admin</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/admin/ayuda"
                className="flex items-center text-gray-600 hover:text-[#68c3b7] transition-colors"
              >
                <HelpCircle className="w-5 h-5 mr-1" />
                <span className="text-sm hidden sm:inline">Ayuda</span>
              </Link>
              <span className="text-sm text-gray-600 hidden md:inline">
                Hola, {session.user?.name}
              </span>
              <div className="w-8 h-8 bg-[#68c3b7] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {session.user?.name?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Overlay para mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out lg:transform-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between p-4 lg:hidden border-b">
            <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="mt-4 lg:mt-8">
            <div className="px-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Navegación
              </h2>
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false); // Cerrar menú en mobile
                        }}
                        className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-[#68c3b7]/10 text-[#68c3b7] border-r-2 border-[#68c3b7]'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-0">
          {/* Banner de configuración de Cloudinary */}
          {!isCloudinaryConfigured && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Configurar hosting de imágenes
                    </h3>
                    <p className="text-sm text-blue-700 hidden sm:block">
                      Configura Cloudinary para subir y optimizar imágenes de productos automáticamente
                    </p>
                    <p className="text-xs text-blue-700 sm:hidden">
                      Configura Cloudinary para subir imágenes
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={openCloudinarySetup}
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <span className="sm:hidden">Configurar</span>
                    <span className="hidden sm:inline">Configurar ahora</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={productModal.isOpen}
        onClose={() => setProductModal({ isOpen: false, mode: 'create' })}
        onSave={async (productData) => {
          try {
            // Para el modo de edición, agregar el ID del producto
            const requestData = productModal.mode === 'edit' && productModal.product
              ? { ...productData, id: productModal.product.id }
              : productData;

            console.log('📤 Enviando datos del producto:', {
              mode: productModal.mode,
              data: requestData
            });

            const response = await fetch('/api/admin/products', {
              method: productModal.mode === 'create' ? 'POST' : 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestData),
            });

            if (!response.ok) {
              const errorData = await response.text();
              console.error('❌ Error response:', errorData);
              throw new Error(`Error al ${productModal.mode === 'create' ? 'crear' : 'actualizar'} producto: ${errorData}`);
            }

            const result = await response.json();
            console.log('✅ Producto guardado exitosamente:', result);

            addNotification(
              `Producto ${productModal.mode === 'create' ? 'creado' : 'actualizado'} exitosamente`, 
              'success'
            );
            await loadSheetsData(); // Recargar datos
            setProductModal({ isOpen: false, mode: 'create' });
          } catch (error) {
            console.error('Error al guardar producto:', error);
            addNotification(`Error al guardar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
          }
        }}
        product={productModal.product}
        mode={productModal.mode}
      />

      <OrderModal
        isOpen={orderModal.isOpen}
        onClose={() => setOrderModal({ isOpen: false })}
        order={orderModal.order}
        onUpdateStatus={async (orderId, status) => {
          try {
            const response = await fetch('/api/admin/orders/status', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderId, status }),
            });

            if (!response.ok) {
              throw new Error('Error al actualizar estado del pedido');
            }

            addNotification(`Estado del pedido actualizado a: ${status}`, 'success');
            
            // Recargar datos y cerrar modal
            await loadSheetsData();
            setOrderModal({ isOpen: false });
          } catch (error) {
            console.error('Error al actualizar estado:', error);
            addNotification('Error al actualizar el estado del pedido', 'error');
          }
        }}
      />

      {/* User Role Manager Modal */}
      {showUserRoleManager && (
        <UserRoleManager onClose={() => setShowUserRoleManager(false)} />
      )}
    </div>
  );
}

// Componente Dashboard
interface DashboardContentProps {
  sheetsProducts: AdminProduct[];
  sheetsUsers: AdminUser[];
  sheetsOrders: Order[];
  dataLoading: boolean;
  needsSystemConfiguration: boolean;
  onSetupSheets: () => Promise<void>;
  onReloadData: () => Promise<void>;
}

function DashboardContent({ 
  sheetsProducts, 
  sheetsUsers, 
  sheetsOrders, 
  dataLoading,
  needsSystemConfiguration,
  onSetupSheets, 
  onReloadData 
}: DashboardContentProps) {
  // Calcular estadísticas desde los datos de Google Sheets
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calcular pedidos de hoy
    const todayOrders = sheetsOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    }).length;

    // Calcular ingresos del mes actual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = sheetsOrders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        // Incluir todos los pedidos excepto los cancelados
        return order.status !== 'cancelled' && 
               orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, order) => {
        // Asegurarse de que total sea un número
        const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
        return sum + (isNaN(total) ? 0 : total);
      }, 0);

    // Calcular usuarios nuevos esta semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    
    const newUsersThisWeek = sheetsUsers.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate >= oneWeekAgo;
    }).length;

    const lowStockProducts = sheetsProducts.filter(product => product.stock < 10).length;

    // Calcular productos más vendidos
    const productSales: { [key: string]: { product: AdminProduct; quantity: number } } = {};
    
    sheetsOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.id;
        if (productSales[productId]) {
          productSales[productId].quantity += item.quantity;
        } else {
          const product = sheetsProducts.find(p => p.id === productId);
          if (product) {
            productSales[productId] = { product, quantity: item.quantity };
          }
        }
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalProducts: sheetsProducts.length,
      totalOrders: sheetsOrders.length,
      todayOrders,
      totalUsers: sheetsUsers.length,
      monthlyRevenue,
      newUsersThisWeek,
      lowStockProducts,
      topProducts
    };
  }, [sheetsProducts, sheetsUsers, sheetsOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const statCards = [
    { 
      label: 'Total Productos', 
      value: stats.totalProducts.toString(), 
      change: `${stats.lowStockProducts} con stock bajo`, 
      icon: Package, 
      color: 'blue',
      trend: 'neutral'
    },
    { 
      label: 'Pedidos Hoy', 
      value: stats.todayOrders.toString(), 
      change: `${stats.totalOrders} total`, 
      icon: ShoppingCart, 
      color: 'green',
      trend: 'up'
    },
    { 
      label: 'Usuarios Registrados', 
      value: stats.totalUsers.toString(), 
      change: `+${stats.newUsersThisWeek} esta semana`, 
      icon: Users, 
      color: 'purple',
      trend: stats.newUsersThisWeek > 0 ? 'up' : 'neutral'
    },
    { 
      label: 'Ingresos del Mes', 
      value: formatCurrency(stats.monthlyRevenue), 
      change: 'Ventas confirmadas', 
      icon: DollarSign, 
      color: 'yellow',
      trend: stats.monthlyRevenue > 0 ? 'up' : 'neutral'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Resumen general de tu tienda</p>
          </div>
          
          {/* Botones de configuración */}
          <div className="flex space-x-3">
            <button
              onClick={onReloadData}
              disabled={dataLoading}
              className="flex items-center px-4 py-2 bg-[#68c3b7] text-white rounded-lg hover:bg-[#64b7ac] disabled:opacity-50 transition-colors"
            >
              {dataLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Actualizar Datos
            </button>
            
            {needsSystemConfiguration && (
              <button
                onClick={onSetupSheets}
                disabled={dataLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {dataLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Settings className="w-4 h-4 mr-2" />
                )}
                Configurar Sistema
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-400 text-white',
            green: 'bg-[#68c3b7]  text-white',
            purple: 'bg-purple-500  text-white',
            yellow: 'bg-amber-400  text-white'
          };

          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.trend === 'up' && <TrendingUp className="inline w-3 h-3 mr-1" />}
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertas importantes */}
      {stats.lowStockProducts > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Atención:</span> Tienes {stats.lowStockProducts} productos con stock bajo (menos de 10 unidades).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos Top */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((productSale, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#68c3b7]/10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-[#68c3b7] text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{productSale.product.name}</p>
                      <p className="text-sm text-gray-600">{productSale.quantity} ventas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(productSale.product.price * productSale.quantity)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No hay datos de ventas disponibles</p>
            )}
          </div>
        </div>

        {/* Resumen de pedidos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Pedidos</h3>
          <OrderStatusSummary orders={sheetsOrders} />
        </div>
      </div>
    </div>
  );
}

// Componente para resumen de estados de pedidos
function OrderStatusSummary({ orders }: { orders: Order[] }) {
  
  const statusCounts = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  const statusInfo = [
    { status: 'pending', label: 'Pendientes', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { status: 'processing', label: 'Procesando', color: 'bg-teal-100 text-teal-800', icon: Package },
    { status: 'shipped', label: 'Enviados', color: 'bg-purple-100 text-purple-800', icon: Truck },
    { status: 'delivered', label: 'Entregados', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { status: 'cancelled', label: 'Cancelados', color: 'bg-red-100 text-red-800', icon: XCircle }
  ];

  return (
    <div className="space-y-3">
      {orders.length === 0 && (
        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-sm">No hay pedidos registrados aún</p>
          <p className="text-xs text-gray-400 mt-1">Todos los contadores mostrarán 0</p>
        </div>
      )}
      {statusInfo.map((info) => {
        const Icon = info.icon;
        const count = statusCounts[info.status] || 0;
        return (
          <div key={info.status} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${info.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">{info.label}</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// Placeholder components - se implementarían con el contenido completo
function ProductsContent() {
  return (
    <div className="text-center py-12">
      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Productos</h3>
      <p className="text-gray-600">Esta funcionalidad está siendo restaurada...</p>
    </div>
  );
}

function CategoriesContent() {
  return (
    <div className="text-center py-12">
      <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Categorías</h3>
      <p className="text-gray-600">Esta funcionalidad está siendo restaurada...</p>
    </div>
  );
}

function OrdersContent() {
  return (
    <div className="text-center py-12">
      <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Pedidos</h3>
      <p className="text-gray-600">Esta funcionalidad está siendo restaurada...</p>
    </div>
  );
}

function UsersContent() {
  return (
    <div className="text-center py-12">
      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Usuarios</h3>
      <p className="text-gray-600">Esta funcionalidad está siendo restaurada...</p>
    </div>
  );
}

function SettingsContent() {
  return (
    <div className="text-center py-12">
      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración</h3>
      <p className="text-gray-600">Esta funcionalidad está siendo restaurada...</p>
    </div>
  );
}
