'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { AdminProduct } from '@/lib/admin-store';
import { Category } from '@/types';
import ImageUploader from './ImageUploader';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>) => void;
  product?: AdminProduct;
  mode: 'create' | 'edit';
}

export default function ProductModal({ isOpen, onClose, onSave, product, mode }: ProductModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    // originalPrice: undefined as number | undefined, // COMENTADO - Sin funcionalidad de descuentos
    category: '',
    subcategory: '',
    images: [''] as string[],
    stock: 0,
    isActive: true,
    sku: '',
    brand: '',
    tags: '',
    medidas: '', // Nuevo campo para medidas
    color: '' // Nuevo campo para color
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Función para generar SKU basado en el nombre del producto
  const generateSKUFromName = (name: string): string => {
    if (!name.trim()) return '';
    
    // Limpiar y procesar el nombre
    const cleanName = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '') // Quitar caracteres especiales
      .trim();
    
    // Tomar las primeras letras de cada palabra
    const words = cleanName.split(/\s+/);
    let prefix = '';
    
    if (words.length >= 2) {
      // Si hay 2+ palabras, tomar primeras 2-3 letras de cada una
      prefix = words.slice(0, 2).map(word => word.substring(0, 3)).join('');
    } else {
      // Si hay solo 1 palabra, tomar primeras 4-6 letras
      prefix = words[0].substring(0, 6);
    }
    
    // Generar número aleatorio de 3 dígitos
    const randomNum = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    
    return `${prefix}-${randomNum}`;
  };

  // Función para manejar cambios en el nombre y generar SKU automáticamente
  const handleNameChange = (newName: string) => {
    setFormData(prev => ({
      ...prev,
      name: newName,
      // Solo generar SKU automáticamente en modo crear y si el SKU está vacío o es generado
      sku: mode === 'create' ? generateSKUFromName(newName) : prev.sku
    }));
  };

  // Actualizar el formulario cuando cambie el producto o el modo
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product) {
        console.log('🔧 ProductModal: Editando producto:', product);
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || 0,
          // originalPrice: product.originalPrice || undefined, // COMENTADO - Sin funcionalidad de descuentos
          category: product.category || '',
          subcategory: product.subcategory || '',
          images: product.images && product.images.length > 0 ? product.images.filter(img => img.trim()) : [''],
          stock: product.stock || 0,
          isActive: product.isActive ?? true,
          sku: product.sku || '',
          brand: product.brand || '',
          tags: product.tags?.join(', ') || '',
          medidas: (product as any).medidas || '', // Nuevo campo para medidas
          color: (product as any).color || '' // Nuevo campo para color
        });
      } else {
        console.log('🆕 ProductModal: Creando producto nuevo');
        // Modo crear - resetear formulario
        setFormData({
          name: '',
          description: '',
          price: 0,
          // originalPrice: undefined, // COMENTADO - Sin funcionalidad de descuentos
          category: '',
          subcategory: '',
          images: [''],
          stock: 0,
          isActive: true,
          sku: '',
          brand: '',
          tags: '',
          medidas: '', // Nuevo campo para medidas
          color: '' // Nuevo campo para color
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, product]);

  // Cargar categorías cuando se abre el modal
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        console.error('Error al cargar categorías');
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (formData.price <= 0) newErrors.price = 'El precio debe ser mayor a 0';
    if (formData.stock < 0) newErrors.stock = 'El stock no puede ser negativo';
    if (!formData.sku.trim()) newErrors.sku = 'El SKU es requerido';
    if (!formData.category.trim()) newErrors.category = 'Debe seleccionar una categoría';
    if (formData.images.filter(img => img.trim()).length === 0) {
      newErrors.images = 'Debe agregar al menos una imagen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const productData = {
      ...formData,
      // originalPrice: formData.originalPrice || undefined, // COMENTADO - Sin funcionalidad de descuentos
      subcategory: formData.subcategory || undefined,
      brand: formData.brand || undefined,
      medidas: formData.medidas || undefined, // Incluir medidas
      color: formData.color || undefined, // Incluir color
      images: formData.images.filter(img => img.trim()),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    onSave(productData);
    onClose();
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: iPhone 15 Pro"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                  errors.sku ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Se genera automáticamente al escribir el nombre"
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
              {mode === 'create' && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Se genera automáticamente cuando escribes el nombre del producto
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}                className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Descripción detallada del producto"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Campos para productos personalizados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medidas
              </label>
              <input
                type="text"
                value={formData.medidas}
                onChange={(e) => setFormData({ ...formData, medidas: e.target.value })}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="Ej: 20cm x 30cm x 5cm"
              />
              <p className="text-xs text-gray-500 mt-1">Opcional</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="Ej: Azul marino, Rojo, Negro mate"
              />
              <p className="text-xs text-gray-500 mt-1">Opcional</p>
            </div>
          </div>

          {/* Precios y categoría */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Original
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.originalPrice || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  originalPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="Para descuentos"
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>

          {/* Categoría y marca */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'}
                </option>
                {categories
                  .filter(cat => cat.isActive)
                  .map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategoría
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="Ej: Pro Max"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="Ej: Apple"
              />
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imágenes del Producto *
            </label>
            {errors.images && <p className="text-red-500 text-xs mb-2">{errors.images}</p>}
            
            <ImageUploader
              images={formData.images.filter(img => img.trim())}
              onImagesChange={(newImages) => setFormData({ ...formData, images: newImages })}
              maxImages={8}
              allowReorder={true}
              minDimensions={{ width: 400, height: 400 }}
              maxFileSize={8} // 8MB máximo por imagen
              className="mb-4"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiquetas
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              placeholder="nuevo, premium, destacado (separadas por comas)"
            />
            <p className="text-xs text-gray-500 mt-1">Separa las etiquetas con comas</p>
          </div>

          {/* Estado */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-[#68c3b7] focus:ring-[#68c3b7] border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Producto activo (visible en la tienda)
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#68c3b7] text-white rounded-lg hover:bg-[#64b7ac]"
            >
              {mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
