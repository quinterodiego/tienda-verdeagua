'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Shield,
  Tag,
  // CreditCard, // Oculto temporalmente
  HelpCircle,
  Menu,
  X,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { useAdminStore, Order } from '@/lib/admin-store';
import { AdminProduct } from '@/lib/admin-products-sheets'; // Importar la interfaz correcta
import ProductModal from '@/components/admin/ProductModal';
import OrderModal from '@/components/admin/OrderModal';
import CategoryModal from '@/components/admin/CategoryModal';
import UserRoleManager from '@/components/admin/UserRoleManager';
// import MercadoPagoTestPanel from '@/components/admin/MercadoPagoTestPanel'; // Oculto temporalmente
import EmailTestPanel from '@/components/admin/EmailTestPanel';
import EmailPreviewPanel from '@/components/admin/EmailPreviewPanel';
import { useNotifications, NotificationsStore } from '@/lib/store';
import { isAdminUserSync } from '@/lib/admin-config';
import { useSettings } from '@/lib/use-settings';
import { User, Category } from '@/types';

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
  const loadSheetsData = async () => {
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
  };

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
  }, [loading, session]);

  if (status === 'loading' || loading) {
    return (        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
          <ProductsContent 
            sheetsProducts={sheetsProducts}
            dataLoading={dataLoading}
            onReloadData={loadSheetsData}
            onOpenProductModal={(mode, product) => setProductModal({ isOpen: true, mode, product })}
          />
        );
      case 'categories':
        return (
          <CategoriesContent />
        );
      case 'orders':
        return (
          <OrdersContent 
            sheetsOrders={sheetsOrders}
            dataLoading={dataLoading}
            onReloadData={loadSheetsData}
            onOpenOrderModal={(order) => setOrderModal({ isOpen: true, order })}
          />
        );
      case 'users':
        return (
          <UsersContent 
            sheetsUsers={sheetsUsers}
            dataLoading={dataLoading}
            onReloadData={loadSheetsData}
            onOpenRoleManager={() => setShowUserRoleManager(true)}
          />
        );
      // case 'test-payments':
      //   return <MercadoPagoTestPanel />; // Oculto temporalmente
      case 'test-emails':
        return (
          <EmailTestPanel 
            onSendTest={(result) => {
              addNotification(
                result.message,
                result.success ? 'success' : 'error'
              );
            }}
          />
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
                  <Menu className="h-6 w-6" />
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
        onUpdateStatus={(orderId, status) => {
          const { updateOrderStatus } = useAdminStore.getState();
          updateOrderStatus(orderId, status);
          addNotification(`Estado del pedido actualizado a: ${status}`, 'success');
          setOrderModal({ isOpen: false });
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

    // Debug: Log para ver los pedidos del mes
    const currentMonthOrders = sheetsOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const isValidDate = !isNaN(orderDate.getTime());
      const isCurrentMonth = orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      const isNotCancelled = order.status !== 'cancelled';
      
      console.log('Order debug:', {
        orderId: order.id,
        status: order.status,
        total: order.total,
        totalType: typeof order.total,
        totalParsed: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
        createdAt: order.createdAt,
        orderDate: orderDate.toString(),
        isValidDate,
        isCurrentMonth,
        isNotCancelled,
        shouldInclude: isNotCancelled && isCurrentMonth && isValidDate
      });
      
      return isNotCancelled && isCurrentMonth && isValidDate;
    });
    
    console.log('Todos los pedidos:', sheetsOrders);
    console.log('Pedidos del mes filtrados:', currentMonthOrders);
    console.log('Ingresos del mes calculados:', monthlyRevenue);

    // Calcular ingresos totales (para comparación)
    const totalRevenue = sheetsOrders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => {
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
      totalRevenue,
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
      change: `${formatCurrency(stats.totalRevenue)} total histórico`, 
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
                <span className="font-medium">Atención:</span> Tienes {stats.lowStockProducts} productos con stock bajo (menos de 20 unidades).
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

// Componente Productos
function ProductsContent({ 
  sheetsProducts,
  dataLoading,
  onReloadData,
  onOpenProductModal 
}: { 
  sheetsProducts: AdminProduct[];
  dataLoading: boolean;
  onReloadData: () => Promise<void>;
  onOpenProductModal: (mode: 'create' | 'edit', product?: AdminProduct) => void 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoriesForFilter, setCategoriesForFilter] = useState<{value: string, label: string}[]>([
    { value: 'all', label: 'Todas las categorías' }
  ]);
  // Comentado: const products = useAdminStore((state) => state.products); // Ya no usamos el store local
  // Comentado: const deleteProduct = useAdminStore((state) => state.deleteProduct); // Ya no usamos el store local
  const addNotification = useNotifications((state: NotificationsStore) => state.addNotification);
  
  // Usar sheetsProducts en lugar del store local
  const products = sheetsProducts;

  // Cargar categorías para el filtro
  useEffect(() => {
    const loadCategoriesForFilter = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          const categories = data.categories || [];
          const categoryOptions = [
            { value: 'all', label: 'Todas las categorías' },
            ...categories
              .filter((cat: any) => cat.isActive)
              .map((cat: any) => ({
                value: cat.slug,
                label: cat.name
              }))
          ];
          setCategoriesForFilter(categoryOptions);
        }
      } catch (error) {
        console.error('Error al cargar categorías para filtro:', error);
      }
    };

    loadCategoriesForFilter();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${productName}"? (Esto solo lo marcará como inactivo)`)) {
      try {
        const response = await fetch(`/api/admin/products`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: productId }),
        });

        if (!response.ok) {
          throw new Error('Error al eliminar producto');
        }

        addNotification('Producto eliminado exitosamente', 'success');
        await onReloadData(); // Recargar datos después de eliminar
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        addNotification('Error al eliminar producto', 'error');
      }
    }
  };

  const handlePermanentDeleteProduct = async (productId: string, productName: string) => {
    if (window.confirm(`⚠️ ELIMINACIÓN DEFINITIVA ⚠️\n\n¿Estás COMPLETAMENTE seguro de que quieres eliminar DEFINITIVAMENTE "${productName}"?\n\nEsta acción NO SE PUEDE DESHACER y el producto será eliminado permanentemente de la base de datos.`)) {
      if (window.confirm(`CONFIRMACIÓN FINAL:\n\nEscribe "ELIMINAR" si realmente quieres eliminar "${productName}" para siempre:`)) {
        try {
          console.log('🗑️ Frontend: Iniciando eliminación definitiva de:', productId);
          
          const response = await fetch(`/api/admin/products/${productId}/permanent-delete`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log('📡 Frontend: Respuesta del servidor:', response.status, response.statusText);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Frontend: Error del servidor:', errorData);
            throw new Error(errorData.details || errorData.error || 'Error al eliminar producto definitivamente');
          }

          const result = await response.json();
          console.log('✅ Frontend: Eliminación exitosa:', result);

          addNotification('Producto eliminado DEFINITIVAMENTE', 'success');
          await onReloadData(); // Recargar datos después de eliminar
        } catch (error) {
          console.error('❌ Frontend: Error al eliminar producto definitivamente:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          addNotification(`Error al eliminar producto definitivamente: ${errorMessage}`, 'error');
        }
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Agotado', color: 'text-red-600' };
    if (stock < 10) return { text: 'Stock crítico', color: 'text-red-600' };
    if (stock < 20) return { text: 'Stock bajo', color: 'text-yellow-600' };
    return { text: 'En stock', color: 'text-green-600' };
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Productos</h2>
          <p className="text-gray-600">Administra el catálogo de productos ({products.length} productos)</p>
        </div>
        <button 
          onClick={() => onOpenProductModal('create')}
          className="bg-[#68c3b7] text-white px-4 py-2 rounded-lg hover:bg-[#64b7ac] flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos por nombre, descripción o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-gray-600 w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
            >
              {categoriesForFilter.map((cat: {value: string, label: string}) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {filteredProducts.length !== products.length && (
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredProducts.length} de {products.length} productos
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredProducts.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={product.images[0] || '/placeholder-image.svg'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg mr-4"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.svg';
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                              {product.brand && (
                                <div className="text-xs text-gray-400">{product.brand}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{product.category}</div>
                          {product.subcategory && (
                            <div className="text-xs text-gray-500">{product.subcategory}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                          {/* COMENTADO - Sin funcionalidad de descuentos
                          {product.originalPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              {formatCurrency(product.originalPrice)}
                            </div>
                          )}
                          */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${stockStatus.color}`}>
                            {product.stock} unidades
                          </div>
                          <div className={`text-xs ${stockStatus.color}`}>
                            {stockStatus.text}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => onOpenProductModal('edit', product)}
                              className="text-[#68c3b7] hover:text-[#64b7ac] p-1"
                              title="Editar producto"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="text-yellow-600 hover:text-yellow-800 p-1"
                              title="Desactivar producto (eliminar temporalmente)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handlePermanentDeleteProduct(product.id, product.name)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="⚠️ ELIMINAR DEFINITIVAMENTE (no se puede deshacer)"
                            >
                              <Trash2 className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <div key={product.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <img
                          src={product.images[0] || '/placeholder-image.svg'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.svg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                              {product.brand && (
                                <p className="text-xs text-gray-400 mt-1">{product.brand}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {formatCurrency(product.price)}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">
                                  {product.category}
                                  {product.subcategory && ` > ${product.subcategory}`}
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              product.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-medium ${stockStatus.color}`}>
                                {product.stock} en stock
                              </span>
                              <span className={`text-xs ${stockStatus.color}`}>
                                ({stockStatus.text})
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={() => onOpenProductModal('edit', product)}
                                className="text-[#68c3b7] hover:text-[#64b7ac] p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                title="Editar producto"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                className="text-yellow-600 hover:text-yellow-800 p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                title="Desactivar producto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handlePermanentDeleteProduct(product.id, product.name)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                title="⚠️ Eliminar definitivamente"
                              >
                                <Trash2 className="w-4 h-4 fill-current" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer producto'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button 
                onClick={() => onOpenProductModal('create')}
                className="bg-[#68c3b7] text-white px-4 py-2 rounded-lg hover:bg-[#64b7ac] inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Producto
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Pedidos
interface OrdersContentProps {
  sheetsOrders: Order[];
  dataLoading: boolean;
  onReloadData: () => Promise<void>;
  onOpenOrderModal: (order: Order) => void;
}

function OrdersContent({ 
  sheetsOrders,
  dataLoading,
  onReloadData,
  onOpenOrderModal 
}: OrdersContentProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [searchTerm, setSearchTerm] = useState('ORD-1754141616846'); // Pre-poblado para debug

  // Debug: Buscar orden específica
  useEffect(() => {
    const specificOrder = sheetsOrders.find(order => order.id === 'ORD-1754141616846');
    if (specificOrder) {
      console.log('🔍 ORDEN ESPECÍFICA EN ORDERS CONTENT:', specificOrder);
    }
  }, [sheetsOrders]);

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'processing', label: 'Procesando' },
    { value: 'shipped', label: 'Enviados' },
    { value: 'delivered', label: 'Entregados' },
    { value: 'cancelled', label: 'Cancelados' }
  ];

  const statusInfo = {
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    processing: { label: 'Procesando', color: 'bg-teal-100 text-teal-800', icon: Package },
    shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
    delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const filteredOrders = sheetsOrders.filter((order: Order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Pedidos</h2>
        <p className="text-gray-600">Administra todos los pedidos de la tienda ({sheetsOrders.length} pedidos)</p>
      </div>

      {/* Loading State */}
      {dataLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68c3b7]"></div>
          <span className="ml-2 text-gray-600">Cargando pedidos...</span>
        </div>
      )}

      {/* Content Only When Loaded */}
      {!dataLoading && (
        <>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ID, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-gray-600 w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {filteredOrders.length !== sheetsOrders.length && (
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredOrders.length} de {sheetsOrders.length} pedidos
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredOrders.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order: Order) => {
                    const currentStatusInfo = statusInfo[order.status];
                    const StatusIcon = currentStatusInfo.icon;
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.items.reduce((total: number, item: any) => total + item.quantity, 0)} unidades
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {currentStatusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => onOpenOrderModal(order)}
                            className="text-[#68c3b7] hover:text-[#64b7ac] mr-3"
                          >
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200">
                {filteredOrders.map((order: Order) => {
                  const currentStatusInfo = statusInfo[order.status];
                  const StatusIcon = currentStatusInfo.icon;
                  
                  return (
                    <div key={order.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            Pedido #{order.id}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {currentStatusInfo.label}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Cliente:</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-xs text-gray-500">{order.customerEmail}</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Productos:</span>
                          <div className="text-right">
                            <div className="text-sm text-gray-900">
                              {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.items.reduce((total: number, item: any) => total + item.quantity, 0)} unidades
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Total:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <button 
                          onClick={() => onOpenOrderModal(order)}
                          className="w-full text-center text-[#68c3b7] hover:text-[#64b7ac] text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pedidos</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Los pedidos aparecerán aquí cuando los clientes hagan compras'
              }
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {sheetsOrders.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusInfo).map(([status, info]) => {
            const count = sheetsOrders.filter((order: Order) => order.status === status).length;
            const StatusIcon = info.icon;
            
            return (
              <div key={status} className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${info.color} mb-2`}>
                  <StatusIcon className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">{info.label}</div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}
    </div>
  );
}

// Componente Usuarios
interface UsersContentProps {
  sheetsUsers: AdminUser[];
  dataLoading: boolean;
  onReloadData: () => Promise<void>;
  onOpenRoleManager: () => void;
}

function UsersContent({ sheetsUsers, dataLoading, onReloadData, onOpenRoleManager }: UsersContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const addNotification = useNotifications((state: NotificationsStore) => state.addNotification);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredUsers = sheetsUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          isActive: !currentStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar usuario');
      }

      await onReloadData();
      addNotification(
        `Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`, 
        'success'
      );
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      addNotification('Error al actualizar el usuario', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68c3b7]"></div>
        <span className="ml-2 text-gray-600">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h2>
            <p className="text-gray-600">Administra los usuarios registrados ({sheetsUsers.length} usuarios)</p>
          </div>
          <button
            onClick={onOpenRoleManager}
            className="flex items-center space-x-2 px-4 py-2 bg-[#68c3b7] text-white rounded-lg hover:bg-[#5ab3a7] transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>Gestionar Roles</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-gray-600 w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="user">Usuarios</option>
            </select>
          </div>
        </div>
        
        {filteredUsers.length !== sheetsUsers.length && (
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredUsers.length} de {sheetsUsers.length} usuarios
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredUsers.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actividad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#68c3b7] rounded-full flex items-center justify-center mr-4">
                            <span className="text-white text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.ordersCount} pedidos
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(user.totalSpent)} gastados
                        </div>
                        {user.lastLogin && (
                          <div className="text-xs text-gray-400">
                            Último: {formatDate(user.lastLogin)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          disabled={isUpdating}
                          className={`text-sm px-3 py-1 rounded-lg ${
                            user.isActive
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isUpdating ? 'Actualizando...' : (user.isActive ? 'Desactivar' : 'Activar')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-[#68c3b7] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                            <p className="text-xs text-gray-400 mt-1">ID: {user.id}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : 'Usuario'}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Registro:</span>
                            <div className="text-gray-900">{formatDate(user.createdAt)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Pedidos:</span>
                            <div className="text-gray-900">{user.ordersCount}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Gastado:</span>
                            <div className="text-gray-900">{formatCurrency(user.totalSpent)}</div>
                          </div>
                          {user.lastLogin && (
                            <div>
                              <span className="text-gray-500">Último acceso:</span>
                              <div className="text-gray-900">{formatDate(user.lastLogin)}</div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <button 
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            disabled={isUpdating}
                            className={`w-full text-center text-sm font-medium py-2 px-4 rounded-lg transition-colors ${
                              user.isActive
                                ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'active:bg-gray-200'}`}
                          >
                            {isUpdating ? 'Actualizando...' : (user.isActive ? 'Desactivar' : 'Activar')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-600">
              {searchTerm || roleFilter !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Los usuarios aparecerán aquí cuando se registren'
              }
            </p>
          </div>
        )}
      </div>

      {/* User Stats */}
      {sheetsUsers.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-[#68c3b7]">{sheetsUsers.length}</div>
            <div className="text-sm text-gray-600">Total Usuarios</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {sheetsUsers.filter(u => u.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Usuarios Activos</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {sheetsUsers.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">Administradores</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {formatCurrency(sheetsUsers.reduce((sum, user) => sum + user.totalSpent, 0))}
            </div>
            <div className="text-sm text-gray-600">Ingresos Totales</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Configuración
function SettingsContent() {
  const addNotification = useNotifications((state: NotificationsStore) => state.addNotification);
  const { settings, loading, saving, error, saveSettings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar localSettings cuando se cargan los settings desde Sheets
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      setHasChanges(false);
    }
  }, [settings]);

  const handleInputChange = (field: keyof NonNullable<typeof settings>, value: any) => {
    if (!settings) return;
    setLocalSettings(prev => ({ ...prev!, [field]: value }));
    setHasChanges(true);
  };

  const handleNestedChange = (
    parent: keyof NonNullable<typeof settings>, 
    field: string, 
    value: any
  ) => {
    if (!settings) return;
    setLocalSettings(prev => ({
      ...prev!,
      [parent]: {
        ...(prev![parent] as any),
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localSettings) return;
    
    const result = await saveSettings(localSettings);
    if (result.success) {
      setHasChanges(false);
      addNotification('Configuración guardada exitosamente en Google Sheets', 'success');
    } else {
      addNotification(`Error al guardar: ${result.error}`, 'error');
    }
  };

  const handleReset = () => {
    if (settings) {
      setLocalSettings(settings);
      setHasChanges(false);
    }
  };

  // Mostrar loading mientras se cargan los settings
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68c3b7]"></div>
        <span className="ml-3 text-gray-600">Cargando configuración...</span>
      </div>
    );
  }

  // Mostrar error si no se pudieron cargar los settings
  if (error && !settings) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar configuración</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!localSettings) return null;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h2>
        <p className="text-gray-600">Configura los ajustes de la tienda</p>
      </div>

      {hasChanges && (
        <div className="mb-6 bg-teal-50 border-l-4 border-[#68c3b7] p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-[#68c3b7]" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-teal-700">
                  Tienes cambios sin guardar
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleReset}
                className="text-sm text-[#68c3b7] hover:text-[#64b7ac]"
              >
                Descartar
              </button>
              <button
                onClick={handleSave}
                className="text-sm bg-[#68c3b7] text-white px-3 py-1 rounded hover:bg-[#64b7ac]"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Tienda
              </label>
              <input
                type="text"
                value={localSettings.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de Contacto
              </label>
              <input
                type="email"
                value={localSettings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={3}
                value={localSettings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                value={localSettings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              >
                <option value="ARS">Pesos ($)</option>
                <option value="USD">Dólar (USD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pago</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Mercado Pago</span>
              <button
                onClick={() => handleNestedChange('paymentMethods', 'mercadopago', !localSettings.paymentMethods.mercadopago)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  localSettings.paymentMethods.mercadopago 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {localSettings.paymentMethods.mercadopago ? 'Activo' : 'Inactivo'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Pago al retirar</span>
              <button
                onClick={() => handleNestedChange('paymentMethods', 'cashOnPickup', !localSettings.paymentMethods.cashOnPickup)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  localSettings.paymentMethods.cashOnPickup 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {localSettings.paymentMethods.cashOnPickup ? 'Activo' : 'Inactivo'}
              </button>
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Envíos</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo de Envío Estándar ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={localSettings.shippingCost}
                onChange={(e) => handleInputChange('shippingCost', parseFloat(e.target.value) || 0)}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Envío Gratis Desde ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={localSettings.freeShippingThreshold}
                onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tasa de Impuesto (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={localSettings.taxRate}
                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Nuevos Pedidos</span>
                <p className="text-xs text-gray-500">Recibir notificaciones cuando lleguen nuevos pedidos</p>
              </div>
              <input 
                type="checkbox" 
                checked={localSettings.notifications.newOrders}
                onChange={(e) => handleNestedChange('notifications', 'newOrders', e.target.checked)}
                className="h-4 w-4 text-[#68c3b7] focus:ring-[#68c3b7] border-gray-300 rounded" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Stock Bajo</span>
                <p className="text-xs text-gray-500">Alertas cuando el stock esté por agotarse</p>
              </div>
              <input 
                type="checkbox" 
                checked={localSettings.notifications.lowStock}
                onChange={(e) => handleNestedChange('notifications', 'lowStock', e.target.checked)}
                className="h-4 w-4 text-[#68c3b7] focus:ring-[#68c3b7] border-gray-300 rounded" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Nuevos Usuarios</span>
                <p className="text-xs text-gray-500">Notificaciones de registros de usuarios</p>
              </div>
              <input 
                type="checkbox" 
                checked={localSettings.notifications.newUsers}
                onChange={(e) => handleNestedChange('notifications', 'newUsers', e.target.checked)}
                className="h-4 w-4 text-[#68c3b7] focus:ring-[#68c3b7] border-gray-300 rounded" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {localSettings.lastUpdated ? (
            <>Última actualización en Sheets: {new Date(localSettings.lastUpdated).toLocaleString('es-ES')}</>
          ) : (
            <>Configuración desde localStorage</>
          )}
        </div>
        <div className="space-x-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 ${
              hasChanges && !saving ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Descartar Cambios
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-6 py-2 rounded-lg text-white flex items-center ${
              hasChanges && !saving
                ? 'bg-[#68c3b7] hover:bg-[#64b7ac]' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {saving ? 'Guardando en Sheets...' : 'Guardar en Google Sheets'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente para gestionar categorías
function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryModal, setCategoryModal] = useState<{
    isOpen: boolean;
    category?: Category | null;
  }>({ isOpen: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const { addNotification } = useNotifications();

  // Cargar categorías
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        addNotification('Error al cargar categorías', 'error');
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      addNotification('Error al cargar categorías', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtrar categorías
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === null || category.isActive === filterActive;
    return matchesSearch && matchesFilter;
  });

  // Crear categoría
  const handleCreateCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        addNotification('Categoría creada exitosamente', 'success');
        loadCategories();
      } else {
        const error = await response.json();
        addNotification(error.error || 'Error al crear categoría', 'error');
      }
    } catch (error) {
      console.error('Error al crear categoría:', error);
      addNotification('Error al crear categoría', 'error');
    }
  };

  // Actualizar categoría
  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      if (response.ok) {
        addNotification('Categoría actualizada exitosamente', 'success');
        loadCategories();
      } else {
        const error = await response.json();
        addNotification(error.error || 'Error al actualizar categoría', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      addNotification('Error al actualizar categoría', 'error');
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = async (id: string) => {
    // Buscar el nombre de la categoría para mostrarlo en la confirmación
    const category = categories.find(cat => cat.id === id);
    const categoryName = category?.name || 'esta categoría';
    
    // Mostrar confirmación
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la categoría "${categoryName}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) {
      return; // Si el usuario cancela, no hacer nada
    }

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addNotification('Categoría eliminada exitosamente', 'success');
        loadCategories();
      } else {
        const error = await response.json();
        addNotification(error.error || 'Error al eliminar categoría', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      addNotification('Error al eliminar categoría', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68c3b7]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Categorías</h2>
        <button
          onClick={() => setCategoryModal({ isOpen: true, category: null })}
          className="bg-[#68c3b7] text-white px-4 py-2 rounded-lg hover:bg-[#64b7ac] flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="sm:inline">Nueva Categoría</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          />
        </div>
        <select
          value={filterActive === null ? 'all' : filterActive.toString()}
          onChange={(e) => {
            const value = e.target.value;
            setFilterActive(value === 'all' ? null : value === 'true');
          }}
          className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
        >
          <option value="all">Todas</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
      </div>

      {/* Lista de categorías - Vista Desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creada
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                      {category.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {category.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                      category.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(category.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setCategoryModal({ isOpen: true, category })}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No hay categorías</p>
            <p className="text-gray-400">
              {searchTerm || filterActive !== null 
                ? 'No se encontraron categorías con los filtros aplicados'
                : 'Crea tu primera categoría para organizar los productos'
              }
            </p>
          </div>
        )}
      </div>

      {/* Lista de categorías - Vista Móvil/Tablet */}
      <div className="lg:hidden space-y-4">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center flex-1 min-w-0">
                <Tag className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {category.name}
                  </h3>
                  <div className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                    {category.slug}
                  </div>
                </div>
              </div>
              
              {/* Estado */}
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 flex-shrink-0 ${
                category.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {category.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            {/* Descripción */}
            {category.description && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {category.description}
                </p>
              </div>
            )}

            {/* Footer con fecha y acciones */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Creada: {new Date(category.createdAt).toLocaleDateString('es-ES')}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCategoryModal({ isOpen: true, category })}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar</span>
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-900 px-2 py-1 rounded text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No hay categorías</p>
            <p className="text-gray-400 px-4">
              {searchTerm || filterActive !== null 
                ? 'No se encontraron categorías con los filtros aplicados'
                : 'Crea tu primera categoría para organizar los productos'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de categoría */}
      <CategoryModal
        isOpen={categoryModal.isOpen}
        onClose={() => setCategoryModal({ isOpen: false })}
        category={categoryModal.category}
        onSave={handleCreateCategory}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
      />
    </div>
  );
}
