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
  Truck
} from 'lucide-react';
import Link from 'next/link';
import { useAdminStore, AdminProduct, Order } from '@/lib/admin-store';
import ProductModal from '@/components/admin/ProductModal';
import OrderModal from '@/components/admin/OrderModal';
import { useNotifications, NotificationsStore } from '@/lib/store';

// Simulamos que solo los admins pueden acceder
const ADMIN_EMAILS = ['d86webs@gmail.com']; // Agrega tu email aquí

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const addNotification = useNotifications((state: NotificationsStore) => state.addNotification);

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

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/admin');
      return;
    }

    // Verificar si es admin
    if (!ADMIN_EMAILS.includes(session.user?.email || '')) {
      router.push('/');
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#68c3b7]"></div>
      </div>
    );
  }

  if (!session || !ADMIN_EMAILS.includes(session.user?.email || '')) {
    return null;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'products':
        return (
          <ProductsContent 
            onOpenProductModal={(mode, product) => setProductModal({ isOpen: true, mode, product })}
          />
        );
      case 'orders':
        return (
          <OrdersContent 
            onOpenOrderModal={(order) => setOrderModal({ isOpen: true, order })}
          />
        );
      case 'users':
        return <UsersContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center text-[#68c3b7] hover:text-[#64b7ac] mr-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a la tienda
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
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
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
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
                        onClick={() => setActiveTab(item.id)}
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
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={productModal.isOpen}
        onClose={() => setProductModal({ isOpen: false, mode: 'create' })}
        onSave={(productData) => {
          const { addProduct, updateProduct } = useAdminStore.getState();
          if (productModal.mode === 'create') {
            addProduct(productData);
            addNotification('Producto creado exitosamente', 'success');
          } else if (productModal.product) {
            updateProduct(productModal.product.id, productData);
            addNotification('Producto actualizado exitosamente', 'success');
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
    </div>
  );
}

// Componente Dashboard
function DashboardContent() {
  const getStats = useAdminStore((state) => state.getStats);
  const stats = useMemo(() => getStats(), [getStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
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
      change: '+2 esta semana', 
      icon: Users, 
      color: 'purple',
      trend: 'up'
    },
    { 
      label: 'Ingresos del Mes', 
      value: formatCurrency(stats.monthlyRevenue), 
      change: `${formatCurrency(stats.totalRevenue)} total`, 
      icon: DollarSign, 
      color: 'yellow',
      trend: 'up'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Resumen general de tu tienda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-[#68c3b7] text-white',
            green: 'bg-green-500 text-green-100',
            purple: 'bg-purple-500 text-purple-100',
            yellow: 'bg-yellow-500 text-yellow-100'
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
              stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#68c3b7]/10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-[#68c3b7] text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} ventas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(product.revenue)}</p>
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
          <OrderStatusSummary />
        </div>
      </div>
    </div>
  );
}

// Componente para resumen de estados de pedidos
function OrderStatusSummary() {
  const orders = useAdminStore((state) => state.orders);
  
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
function ProductsContent({ onOpenProductModal }: { 
  onOpenProductModal: (mode: 'create' | 'edit', product?: AdminProduct) => void 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const products = useAdminStore((state) => state.products);
  const deleteProduct = useAdminStore((state) => state.deleteProduct);
  const addNotification = useNotifications((state: NotificationsStore) => state.addNotification);
  
  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'smartphones', label: 'Smartphones' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'tablets', label: 'Tablets' },
    { value: 'audio', label: 'Audio' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'wearables', label: 'Wearables' },
    { value: 'accessories', label: 'Accesorios' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) {
      deleteProduct(productId);
      addNotification('Producto eliminado exitosamente', 'success');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
            >
              {categories.map((cat) => (
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
                          src={product.images[0] || '/placeholder-image.jpg'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg mr-4"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.jpg';
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
                      {product.originalPrice && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatCurrency(product.originalPrice)}
                        </div>
                      )}
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
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
function OrdersContent({ onOpenOrderModal }: { 
  onOpenOrderModal: (order: Order) => void 
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const orders = useAdminStore((state) => state.orders);

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'processing', label: 'Procesando' },
    { value: 'shipped', label: 'Enviados' },
    { value: 'delivered', label: 'Entregados' },
    { value: 'cancelled', label: 'Cancelados' }
  ];

  const statusInfo = {
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    processing: { label: 'Procesando', color: 'bg-teal-100 text-teal-800', icon: Package },
    shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
    delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const filteredOrders = orders.filter(order => {
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
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Pedidos</h2>
        <p className="text-gray-600">Administra todos los pedidos de la tienda ({orders.length} pedidos)</p>
      </div>

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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {filteredOrders.length !== orders.length && (
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredOrders.length} de {orders.length} pedidos
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredOrders.length > 0 ? (
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
              {filteredOrders.map((order) => {
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
                        {order.items.reduce((total, item) => total + item.quantity, 0)} unidades
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
      {orders.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusInfo).map(([status, info]) => {
            const count = orders.filter(order => order.status === status).length;
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
    </div>
  );
}

// Componente Usuarios
function UsersContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const users = useAdminStore((state) => state.users);
  const updateUser = useAdminStore((state) => state.updateUser);
  const addNotification = useNotifications((state: NotificationsStore) => state.addNotification);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    updateUser(userId, { isActive: !currentStatus });
    addNotification(
      `Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`, 
      'success'
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h2>
        <p className="text-gray-600">Administra los usuarios registrados ({users.length} usuarios)</p>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="user">Usuarios</option>
            </select>
          </div>
        </div>
        
        {filteredUsers.length !== users.length && (
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredUsers.length > 0 ? (
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
                    {formatDate(user.registeredAt)}
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
                      className={`text-sm px-3 py-1 rounded-lg ${
                        user.isActive
                          ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      }`}
                    >
                      {user.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      {users.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-[#68c3b7]">{users.length}</div>
            <div className="text-sm text-gray-600">Total Usuarios</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Usuarios Activos</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">Administradores</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {formatCurrency(users.reduce((sum, user) => sum + user.totalSpent, 0))}
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
  const settings = useAdminStore((state) => state.settings);
  const updateSettings = useAdminStore((state) => state.updateSettings);
  const addNotification = useNotifications((state: NotificationsStore) => state.addNotification);
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNestedChange = (
    parent: keyof typeof settings, 
    field: string, 
    value: any
  ) => {
    setLocalSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setHasChanges(false);
    addNotification('Configuración guardada exitosamente', 'success');
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                value={localSettings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dólar ($)</option>
                <option value="GBP">Libra (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pago</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">PayPal</span>
              <button
                onClick={() => handleNestedChange('paymentMethods', 'paypal', !localSettings.paymentMethods.paypal)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  localSettings.paymentMethods.paypal 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {localSettings.paymentMethods.paypal ? 'Activo' : 'Inactivo'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Stripe</span>
              <button
                onClick={() => handleNestedChange('paymentMethods', 'stripe', !localSettings.paymentMethods.stripe)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  localSettings.paymentMethods.stripe 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {localSettings.paymentMethods.stripe ? 'Activo' : 'Inactivo'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Transferencia Bancaria</span>
              <button
                onClick={() => handleNestedChange('paymentMethods', 'bankTransfer', !localSettings.paymentMethods.bankTransfer)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  localSettings.paymentMethods.bankTransfer 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {localSettings.paymentMethods.bankTransfer ? 'Activo' : 'Inactivo'}
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
                Costo de Envío Estándar (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={localSettings.shippingCost}
                onChange={(e) => handleInputChange('shippingCost', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Envío Gratis Desde (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={localSettings.freeShippingThreshold}
                onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
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
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </div>
        <div className="space-x-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 ${
              hasChanges ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Descartar Cambios
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-6 py-2 rounded-lg text-white ${
              hasChanges 
                ? 'bg-[#68c3b7] hover:bg-[#64b7ac]' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}
