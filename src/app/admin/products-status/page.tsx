'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProductStatusBadge from '@/components/ProductStatusBadge';
import { Product, ProductStatus } from '@/types';
import { Eye, EyeOff, Edit, Package, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ProductsStatusPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  // Verificar acceso de admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const ADMIN_EMAILS = ['admin@techstore.com', 'dquintero@example.com'];
    if (!ADMIN_EMAILS.includes(session.user?.email || '')) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Cargar productos
  useEffect(() => {
    if (session) {
      fetchProducts();
    }
  }, [session]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?admin=true');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (productId: string, newStatus: ProductStatus) => {
    try {
      setUpdating(productId);
      
      const response = await fetch(`/api/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar producto en el estado local
        setProducts(prev => 
          prev.map(product => 
            product.id === productId 
              ? { ...product, status: newStatus }
              : product
          )
        );
        
        // Refrescar estadísticas
        await fetchProducts();
      } else {
        alert('Error al actualizar estado: ' + data.error);
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar estado del producto');
    } finally {
      setUpdating(null);
    }
  };

  const filteredProducts = selectedStatus === 'all' 
    ? products 
    : products.filter(p => p.status === selectedStatus);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68c3b7]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Estados de Productos</h1>
          <p className="text-gray-600 mt-2">Administra la visibilidad de los productos en la tienda</p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Activos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Edit className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Borradores</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.draft}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <EyeOff className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtrar por estado</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Todos', count: stats?.total },
              { value: 'active', label: 'Activos', count: stats?.active },
              { value: 'pending', label: 'Pendientes', count: stats?.pending },
              { value: 'draft', label: 'Borradores', count: stats?.draft },
              { value: 'inactive', label: 'Inactivos', count: stats?.inactive },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === filter.value
                    ? 'bg-[#68c3b7] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Lista de productos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Productos ({filteredProducts.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
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
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.image}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Intl.NumberFormat('es-AR', {
                              style: 'currency',
                              currency: 'ARS',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(product.price)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ProductStatusBadge status={product.status || 'active'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {product.status !== 'active' && (
                          <button
                            onClick={() => updateProductStatus(product.id, 'active')}
                            disabled={updating === product.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Activar producto"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        
                        {product.status !== 'inactive' && (
                          <button
                            onClick={() => updateProductStatus(product.id, 'inactive')}
                            disabled={updating === product.id}
                            className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                            title="Desactivar producto"
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                        )}
                        
                        {product.status !== 'pending' && (
                          <button
                            onClick={() => updateProductStatus(product.id, 'pending')}
                            disabled={updating === product.id}
                            className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                            title="Marcar como pendiente"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron productos con el filtro seleccionado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
