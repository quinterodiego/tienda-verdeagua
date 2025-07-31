import { ProductStatus } from '@/types';

interface ProductStatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

export default function ProductStatusBadge({ status, className = '' }: ProductStatusBadgeProps) {
  const getStatusConfig = (status: ProductStatus) => {
    switch (status) {
      case 'active':
        return {
          label: 'Activo',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'inactive':
        return {
          label: 'Inactivo',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      case 'pending':
        return {
          label: 'Pendiente',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'draft':
        return {
          label: 'Borrador',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      default:
        return {
          label: 'Desconocido',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
