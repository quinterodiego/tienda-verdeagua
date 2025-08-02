'use client';

import React, { useState, useRef } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Package,
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  TrendingUp,
  Search,
  Filter,
  PlusCircle,
  Settings,
  BarChart3,
  AlertTriangle,
  Download,
  ArrowLeft
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
}

export default function AdminAyudaPage() {
  const [expandedSection, setExpandedSection] = useState<string>('');
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? '' : sectionId);
  };

  const getIconColor = (sectionId: string) => {
    const colorMap = {
      'productos': 'text-blue-500',
      'pedidos': 'text-green-500',
      'clientes': 'text-purple-500',
      'analiticas': 'text-orange-500',
      'configuracion': 'text-gray-500',
      'consejos': 'text-yellow-500'
    };
    return colorMap[sectionId as keyof typeof colorMap] || 'text-gray-500';
  };

  const generatePDF = async () => {
    if (!contentRef.current) return;
    
    setGeneratingPDF(true);
    const originalExpanded = expandedSection;
    
    try {
      // Expandir todo el contenido temporalmente
      setExpandedSection('all');
      
      // Esperar a que se renderice el contenido expandido
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Importar librerías de manera dinámica
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;
      
      const content = contentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f9fafb'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      // Páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('guia-administracion.pdf');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Inténtalo de nuevo.');
    } finally {
      // Restaurar el estado original
      setExpandedSection(originalExpanded);
      setGeneratingPDF(false);
    }
  };

  const sections: Section[] = [
    {
      id: 'productos',
      title: 'Gestión de Productos',
      icon: Package,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Package className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-800">Sistema de Productos Personalizados</h4>
            </div>
            <p className="text-blue-700">
              Tu tienda maneja productos únicos que se personalizan según las necesidades del cliente.
              Cada producto puede tener medidas específicas y colores personalizados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Plus className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-semibold">Agregar Producto</h4>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Haz clic en "Agregar Producto" en el panel admin</li>
                <li>Completa el nombre (se genera SKU automático)</li>
                <li>Agrega descripción detallada</li>
                <li>Establece el precio en pesos argentinos</li>
                <li>Sube una imagen representativa</li>
                <li>Selecciona la categoría apropiada</li>
                <li>Define si acepta personalización</li>
                <li>Agrega medidas disponibles (ej: "30x40cm, 50x70cm")</li>
                <li>Especifica colores disponibles (ej: "Blanco, Negro, Azul")</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Edit className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-semibold">Editar Producto</h4>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Localiza el producto en la lista</li>
                <li>Haz clic en el ícono de editar</li>
                <li>Modifica los campos necesarios</li>
                <li>El SKU se actualiza automáticamente si cambias el nombre</li>
                <li>Guarda los cambios</li>
                <li>Los cambios se reflejan inmediatamente en Google Sheets</li>
              </ol>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <h4 className="font-semibold text-yellow-800">SKU Automático</h4>
            </div>
            <p className="text-yellow-700 mb-2">
              El sistema genera automáticamente códigos SKU basados en el nombre del producto:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-700">
              <li>"Taza Personalizada" → "TAZPER-001"</li>
              <li>"Cuadro Decorativo" → "CUADEC-002"</li>
              <li>"Almohada Custom" → "ALMCUS-003"</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Settings className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Campos Personalizados</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <h5 className="font-medium text-green-700 mb-1">Medidas</h5>
                <p className="text-sm text-green-600">
                  Especifica las dimensiones disponibles separadas por comas.
                  Ejemplo: "20x30cm, 30x40cm, 50x70cm"
                </p>
              </div>
              <div>
                <h5 className="font-medium text-green-700 mb-1">Colores</h5>
                <p className="text-sm text-green-600">
                  Lista los colores disponibles separados por comas.
                  Ejemplo: "Blanco, Negro, Azul, Rojo"
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'pedidos',
      title: 'Gestión de Pedidos',
      icon: ShoppingCart,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <ShoppingCart className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Flujo de Pedidos Personalizados</h4>
            </div>
            <p className="text-green-700">
              Los pedidos requieren seguimiento especial debido a la personalización. 
              Cada pedido debe ser revisado y confirmado antes de producir.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <h4 className="font-semibold">Pendientes</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Revisar especificaciones del cliente</li>
                <li>• Confirmar disponibilidad de materiales</li>
                <li>• Validar medidas y colores solicitados</li>
                <li>• Contactar al cliente si hay dudas</li>
                <li>• Estimar tiempo de producción</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-semibold">En Proceso</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Iniciar producción del artículo</li>
                <li>• Tomar fotos del progreso</li>
                <li>• Enviar updates al cliente</li>
                <li>• Control de calidad durante producción</li>
                <li>• Preparar para envío</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <XCircle className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-semibold">Completados</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Producto terminado y enviado</li>
                <li>• Seguimiento de entrega</li>
                <li>• Confirmar recepción del cliente</li>
                <li>• Solicitar feedback/reseña</li>
                <li>• Archivar información del pedido</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Eye className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-800">Detalles del Pedido</h4>
            </div>
            <p className="text-blue-700 mb-3">
              Cada pedido contiene información crucial para la personalización:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-blue-700 mb-1">Información del Producto</h5>
                <ul className="text-sm text-blue-600 list-disc list-inside">
                  <li>Producto base seleccionado</li>
                  <li>Medidas específicas solicitadas</li>
                  <li>Color elegido</li>
                  <li>Instrucciones especiales</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-700 mb-1">Información del Cliente</h5>
                <ul className="text-sm text-blue-600 list-disc list-inside">
                  <li>Datos de contacto</li>
                  <li>Dirección de envío</li>
                  <li>Preferencias de entrega</li>
                  <li>Historial de pedidos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'clientes',
      title: 'Gestión de Clientes',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-semibold text-purple-800">Base de Clientes</h4>
            </div>
            <p className="text-purple-700">
              Mantén una relación personalizada con cada cliente para fomentar compras recurrentes
              y recomendaciones en productos personalizados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <User className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-semibold">Perfil del Cliente</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Mail className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="font-medium text-sm">Información de Contacto</p>
                    <p className="text-xs text-gray-600">Email, teléfono, preferencias de comunicación</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="font-medium text-sm">Direcciones</p>
                    <p className="text-xs text-gray-600">Facturación, envío, direcciones guardadas</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="font-medium text-sm">Historial</p>
                    <p className="text-xs text-gray-600">Pedidos anteriores, fechas importantes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-semibold">Análisis del Cliente</h4>
              </div>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded">
                  <p className="font-medium text-sm text-green-800">Valor del Cliente</p>
                  <p className="text-xs text-green-600">Total gastado, frecuencia de compra</p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-medium text-sm text-blue-800">Preferencias</p>
                  <p className="text-xs text-blue-600">Productos favoritos, colores, medidas usuales</p>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <p className="font-medium text-sm text-orange-800">Comportamiento</p>
                  <p className="text-xs text-orange-600">Patrones de compra, estacionalidad</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Phone className="w-5 h-5 text-indigo-600 mr-2" />
              <h4 className="font-semibold text-indigo-800">Comunicación Efectiva</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <h5 className="font-medium text-indigo-700 mb-1">Pre-venta</h5>
                <ul className="text-sm text-indigo-600 list-disc list-inside">
                  <li>Responder consultas rápidamente</li>
                  <li>Explicar proceso de personalización</li>
                  <li>Mostrar ejemplos similares</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-indigo-700 mb-1">Durante Producción</h5>
                <ul className="text-sm text-indigo-600 list-disc list-inside">
                  <li>Updates de progreso</li>
                  <li>Fotos del proceso</li>
                  <li>Confirmar detalles</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-indigo-700 mb-1">Post-venta</h5>
                <ul className="text-sm text-indigo-600 list-disc list-inside">
                  <li>Seguimiento de satisfacción</li>
                  <li>Solicitar testimonios</li>
                  <li>Ofrecer productos relacionados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'analiticas',
      title: 'Analíticas',
      icon: BarChart3,
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <BarChart3 className="w-5 h-5 text-orange-600 mr-2" />
              <h4 className="font-semibold text-orange-800">Métricas Clave</h4>
            </div>
            <p className="text-orange-700">
              Monitorea el rendimiento de tu tienda de productos personalizados con 
              métricas específicas para este tipo de negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-semibold">Ventas</h4>
              </div>
              <div className="space-y-2">
                <div className="bg-blue-50 p-2 rounded text-sm">
                  <span className="font-medium">Ingresos Mensuales:</span> Tracking en ARS
                </div>
                <div className="bg-blue-50 p-2 rounded text-sm">
                  <span className="font-medium">Ticket Promedio:</span> Valor por pedido
                </div>
                <div className="bg-blue-50 p-2 rounded text-sm">
                  <span className="font-medium">Conversión:</span> Visitantes → Compradores
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Package className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-semibold">Productos</h4>
              </div>
              <div className="space-y-2">
                <div className="bg-purple-50 p-2 rounded text-sm">
                  <span className="font-medium">Más Vendidos:</span> Top productos
                </div>
                <div className="bg-purple-50 p-2 rounded text-sm">
                  <span className="font-medium">Personalizaciones:</span> Opciones populares
                </div>
                <div className="bg-purple-50 p-2 rounded text-sm">
                  <span className="font-medium">Rentabilidad:</span> Margen por producto
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-orange-600 mr-2" />
                <h4 className="font-semibold">Operaciones</h4>
              </div>
              <div className="space-y-2">
                <div className="bg-orange-50 p-2 rounded text-sm">
                  <span className="font-medium">Tiempo Producción:</span> Promedio por producto
                </div>
                <div className="bg-orange-50 p-2 rounded text-sm">
                  <span className="font-medium">Satisfacción:</span> Rating de clientes
                </div>
                <div className="bg-orange-50 p-2 rounded text-sm">
                  <span className="font-medium">Devoluciones:</span> % de productos devueltos
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Search className="w-5 h-5 text-gray-600 mr-2" />
              <h4 className="font-semibold">Reportes Disponibles</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Reportes de Ventas</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ventas diarias/semanales/mensuales</li>
                  <li>• Comparativo con períodos anteriores</li>
                  <li>• Análisis de estacionalidad</li>
                  <li>• Productos más rentables</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Reportes de Clientes</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Clientes más valiosos</li>
                  <li>• Frecuencia de compra</li>
                  <li>• Geografía de ventas</li>
                  <li>• Análisis de retención</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <h4 className="font-semibold text-yellow-800">KPIs Específicos para Personalización</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <h5 className="font-medium text-yellow-700 mb-1">Tiempo de Producción</h5>
                <p className="text-sm text-yellow-600">
                  Monitorea cuánto tiempo toma producir cada tipo de producto personalizado
                  para optimizar tiempos de entrega.
                </p>
              </div>
              <div>
                <h5 className="font-medium text-yellow-700 mb-1">Satisfacción del Cliente</h5>
                <p className="text-sm text-yellow-600">
                  Tracking especial para productos personalizados, ya que la satisfacción
                  depende de que el resultado final cumpla expectativas específicas.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'configuracion',
      title: 'Configuración',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Settings className="w-5 h-5 text-gray-600 mr-2" />
              <h4 className="font-semibold text-gray-800">Configuración del Sistema</h4>
            </div>
            <p className="text-gray-700">
              Ajusta la configuración de tu tienda para optimizar la experiencia
              tanto para clientes como para la gestión administrativa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Package className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-semibold">Configuración de Productos</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm mb-1">Categorías</h5>
                  <p className="text-xs text-gray-600 mb-2">Organiza tus productos en categorías lógicas</p>
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    Tazas, Cuadros, Almohadas, Accesorios, etc.
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-1">Opciones de Personalización</h5>
                  <p className="text-xs text-gray-600 mb-2">Define las opciones disponibles</p>
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    Medidas estándar, colores disponibles, materiales
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <ShoppingCart className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-semibold">Configuración de Pedidos</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm mb-1">Estados de Pedido</h5>
                  <p className="text-xs text-gray-600 mb-2">Personaliza el flujo de estados</p>
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    Pendiente → En Producción → Listo → Enviado → Entregado
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-1">Tiempos de Producción</h5>
                  <p className="text-xs text-gray-600 mb-2">Establece tiempos estimados por producto</p>
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    Tazas: 2-3 días, Cuadros: 5-7 días, etc.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <PlusCircle className="w-5 h-5 text-indigo-600 mr-2" />
              <h4 className="font-semibold text-indigo-800">Integración con Google Sheets</h4>
            </div>
            <p className="text-indigo-700 mb-3">
              Tu sistema está conectado con Google Sheets para facilitar la gestión:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-indigo-700 mb-1">Productos</h5>
                <ul className="text-sm text-indigo-600 list-disc list-inside">
                  <li>Sincronización automática</li>
                  <li>Backup de datos en tiempo real</li>
                  <li>Acceso desde cualquier dispositivo</li>
                  <li>Columnas P y Q para medidas y colores</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-indigo-700 mb-1">Pedidos</h5>
                <ul className="text-sm text-indigo-600 list-disc list-inside">
                  <li>Registro completo de transacciones</li>
                  <li>Historial de cambios</li>
                  <li>Reportes automáticos</li>
                  <li>Respaldo de información crítica</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <h4 className="font-semibold text-red-800">Configuraciones Importantes</h4>
            </div>
            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-red-700 mb-1">Moneda</h5>
                <p className="text-sm text-red-600">
                  El sistema está configurado para pesos argentinos (ARS). 
                  Todos los precios se muestran con formato local.
                </p>
              </div>
              <div>
                <h5 className="font-medium text-red-700 mb-1">SKU Automático</h5>
                <p className="text-sm text-red-600">
                  Los códigos SKU se generan automáticamente basados en el nombre del producto.
                  No es necesario ingresarlos manualmente.
                </p>
              </div>
              <div>
                <h5 className="font-medium text-red-700 mb-1">Personalización</h5>
                <p className="text-sm text-red-600">
                  Los campos de medidas y colores son específicos para productos personalizados.
                  Úsalos para definir las opciones disponibles para cada producto.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'consejos',
      title: 'Consejos y Trucos',
      icon: AlertTriangle,
      content: (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
              <h4 className="font-semibold text-emerald-800">Optimización de Ventas</h4>
            </div>
            <p className="text-emerald-700">
              Estrategias específicas para maximizar el éxito de tu tienda de productos personalizados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Eye className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-semibold">Fotografía de Productos</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Múltiples ángulos:</strong> Muestra el producto desde diferentes perspectivas</li>
                <li>• <strong>Contexto de uso:</strong> Fotografía el producto en su ambiente natural</li>
                <li>• <strong>Detalles de calidad:</strong> Acércate a los acabados y materiales</li>
                <li>• <strong>Ejemplos de personalización:</strong> Muestra diferentes variaciones</li>
                <li>• <strong>Iluminación natural:</strong> Usa luz natural para colores reales</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Edit className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-semibold">Descripciones Efectivas</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Beneficios claros:</strong> Explica qué problema resuelve</li>
                <li>• <strong>Proceso de personalización:</strong> Detalla cómo funciona</li>
                <li>• <strong>Materiales y calidad:</strong> Especifica qué incluye</li>
                <li>• <strong>Tiempos de entrega:</strong> Sé transparente con los plazos</li>
                <li>• <strong>Cuidados:</strong> Incluye instrucciones de mantenimiento</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-800">Atención al Cliente</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <h5 className="font-medium text-blue-700 mb-1">Respuesta Rápida</h5>
                <ul className="text-sm text-blue-600 list-disc list-inside">
                  <li>Responde consultas en menos de 2 horas</li>
                  <li>Usa respuestas preparadas para preguntas comunes</li>
                  <li>Programa notificaciones</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-700 mb-1">Comunicación Clara</h5>
                <ul className="text-sm text-blue-600 list-disc list-inside">
                  <li>Confirma todos los detalles por escrito</li>
                  <li>Envía bocetos cuando sea necesario</li>
                  <li>Documenta cambios solicitados</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-700 mb-1">Seguimiento Proactivo</h5>
                <ul className="text-sm text-blue-600 list-disc list-inside">
                  <li>Updates de progreso regulares</li>
                  <li>Fotos del proceso</li>
                  <li>Confirmación de entrega</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <h4 className="font-semibold text-yellow-800">Gestión de Expectativas</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <h5 className="font-medium text-yellow-700 mb-1">Tiempos Realistas</h5>
                <p className="text-sm text-yellow-600">
                  Siempre agrega 1-2 días extra a tus estimaciones. Es mejor entregar antes
                  que generar ansiedad en el cliente.
                </p>
              </div>
              <div>
                <h5 className="font-medium text-yellow-700 mb-1">Limitaciones Claras</h5>
                <p className="text-sm text-yellow-600">
                  Especifica qué tipo de personalizaciones son posibles y cuáles no.
                  La transparencia evita malentendidos.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Estrategias de Crecimiento</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <h5 className="font-medium text-green-700 mb-1">Marketing de Contenido</h5>
                <ul className="text-sm text-green-600 list-disc list-inside">
                  <li>Comparte el proceso de creación</li>
                  <li>Muestra productos terminados en uso</li>
                  <li>Publica testimonios de clientes</li>
                  <li>Crea tutoriales de cuidado</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-green-700 mb-1">Fidelización</h5>
                <ul className="text-sm text-green-600 list-disc list-inside">
                  <li>Programa de clientes frecuentes</li>
                  <li>Descuentos por referir amigos</li>
                  <li>Ofertas en fechas especiales</li>
                  <li>Follow-up post-compra</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <HelpCircle className="w-8 h-8 text-[#68c3b7] mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Centro de Ayuda - Administración</h1>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/admin"
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Panel
              </a>
              {/* <button
                onClick={generatePDF}
                disabled={generatingPDF}
                className="flex items-center bg-[#68c3b7] hover:bg-[#64b7ac] disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                {generatingPDF ? 'Generando PDF...' : 'Descargar PDF'}
              </button> */}
            </div>
          </div>
          <p className="text-gray-600 text-lg">
            Aprende a gestionar tu tienda online de productos personalizados
          </p>
        </div>

        {/* Contenido para PDF */}
        <div ref={contentRef}>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Sistema</p>
                  <p className="text-2xl font-bold text-gray-900">Productos</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <ShoppingCart className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Gestión</p>
                  <p className="text-2xl font-bold text-gray-900">Pedidos</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Control</p>
                  <p className="text-2xl font-bold text-gray-900">Clientes</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Optimización</p>
                  <p className="text-2xl font-bold text-gray-900">Ventas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSection === section.id || expandedSection === 'all';
              
              return (
                <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <Icon className={`w-6 h-6 ${getIconColor(section.id)} mr-3`} />
                      <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-gray-100 pt-4">
                        {section.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div> {/* Cierre del contentRef */}
      </div>
    </div>
  );
}
