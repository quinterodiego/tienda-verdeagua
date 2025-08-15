// Sistema de iconos usando Heroicons - Reemplazo de Lucide React
// Heroicons es más ligero, estable y mejor integrado con Tailwind CSS

import {
  // Navegación y UI básica
  ShoppingCartIcon,
  MagnifyingGlassIcon as SearchIcon,
  Bars3Icon as MenuIcon,
  UserIcon,
  XMarkIcon as XIcon,
  HeartIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon as LogOutIcon,
  
  // Admin y gestión
  UsersIcon,
  Cog6ToothIcon as SettingsIcon,
  ChartBarIcon as BarChart3Icon,
  ArrowLeftIcon,
  EyeIcon,
  ExclamationTriangleIcon as AlertTriangleIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  CurrencyDollarIcon as DollarSignIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  TagIcon,
  QuestionMarkCircleIcon as HelpCircleIcon,
  EnvelopeIcon as MailIcon,
  PlusIcon,
  PencilIcon as EditIcon,
  TrashIcon as Trash2Icon,
  ShieldCheckIcon as ShieldIcon,
  ArrowPathIcon as RefreshIcon,
  
  // Productos y tienda
  ArchiveBoxIcon as PackageIcon,
  StarIcon,
  PhotoIcon as ImageIcon,
  PhoneIcon,
  CreditCardIcon,
  MapPinIcon,
  LockClosedIcon as LockIcon,
  CheckBadgeIcon as PackageCheckIcon,
  ArrowPathIcon as LoaderIcon,
  CalendarIcon,
  MinusIcon,
  ShareIcon,
  
  // Notificaciones
  InformationCircleIcon as InfoIcon,
  FunnelIcon as FilterIcon,
  SunIcon,
  MoonIcon,
  UserGroupIcon,
  TrophyIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowTopRightOnSquareIcon,
  EyeSlashIcon,
  AtSymbolIcon,
  SwatchIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  PlayIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';

// Iconos sólidos para casos específicos
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  InformationCircleIcon as InfoIconSolid,
  ExclamationTriangleIcon as AlertTriangleIconSolid,
} from '@heroicons/react/24/solid';

// Re-exportar todos los iconos con nombres consistentes
export {
  // Básicos
  ShoppingCartIcon,
  SearchIcon,
  MenuIcon,
  UserIcon,
  XIcon,
  HeartIcon,
  HomeIcon,
  LogOutIcon,
  
  // Admin
  UsersIcon,
  SettingsIcon,
  BarChart3Icon,
  ArrowLeftIcon,
  EyeIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  DollarSignIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  TagIcon,
  HelpCircleIcon,
  MailIcon,
  PlusIcon,
  EditIcon,
  Trash2Icon,
  ShieldIcon,
  RefreshIcon,
  
  // Productos
  PackageIcon,
  StarIcon,
  ImageIcon,
  PhoneIcon,
  CreditCardIcon,
  MapPinIcon,
  LockIcon,
  PackageCheckIcon,
  LoaderIcon,
  CalendarIcon,
  MinusIcon,
  ShareIcon,
  
  // Otros
  InfoIcon,
  FilterIcon,
  
  // Versiones sólidas
  CheckCircleIconSolid,
  XCircleIconSolid,
  InfoIconSolid,
  AlertTriangleIconSolid,
};

// Iconos sociales personalizados (no están en Heroicons)
interface IconProps {
  className?: string;
}

export const FacebookIcon = ({ className }: IconProps) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export const InstagramIcon = ({ className }: IconProps) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.082 5.52.204 5.02.43a5.988 5.988 0 00-2.16 1.404A5.994 5.994 0 00.43 4.02C.204 4.52.082 5.094.048 6.041.013 7.989 0 8.396 0 12.017s.013 4.028.048 4.976c.034.947.156 1.521.382 2.021a5.988 5.988 0 001.404 2.16 5.994 5.994 0 002.16 1.404c.5.226 1.074.348 2.021.382.948.035 1.355.048 4.976.048s4.028-.013 4.976-.048c.947-.034 1.521-.156 2.021-.382a5.988 5.988 0 002.16-1.404 5.994 5.994 0 001.404-2.16c.226-.5.348-1.074.382-2.021.035-.948.048-1.355.048-4.976s-.013-4.028-.048-4.976c-.034-.947-.156-1.521-.382-2.021a5.988 5.988 0 00-1.404-2.16A5.994 5.994 0 0019.021.43c-.5-.226-1.074-.348-2.021-.382C16.052.013 15.645 0 12.017 0zM12.017 2.163c3.204 0 3.584.012 4.85.07.3.007.611.028.918.058.5.05.987.141 1.432.344a3.84 3.84 0 011.404.915 3.84 3.84 0 01.915 1.404c.203.445.294.932.344 1.432.029.307.051.618.058.918.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.007.3-.029.611-.058.918-.05.5-.141.987-.344 1.432a3.84 3.84 0 01-.915 1.404 3.84 3.84 0 01-1.404.915c-.445.203-.932.294-1.432.344-.307.029-.618.051-.918.058-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-.3-.007-.611-.029-.918-.058-.5-.05-.987-.141-1.432-.344a3.84 3.84 0 01-1.404-.915 3.84 3.84 0 01-.915-1.404c-.203-.445-.294-.932-.344-1.432a10.43 10.43 0 01-.058-.918c-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.007-.3.029-.611.058-.918.05-.5.141-.987.344-1.432a3.84 3.84 0 01.915-1.404A3.84 3.84 0 015.639.635c.445-.203.932-.294 1.432-.344.307-.029.618-.051.918-.058 1.266-.058 1.646-.07 4.85-.07zm0 3.5a6.354 6.354 0 100 12.708 6.354 6.354 0 000-12.708zm0 10.484a4.13 4.13 0 110-8.258 4.13 4.13 0 010 8.258zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

export const MessageCircleIcon = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
  </svg>
);

// Aliases para compatibilidad con código existente
export const CheckCircleIcon2 = CheckCircleIcon;
export const XCircleIcon2 = XCircleIcon;

// Iconos de tema
export { SunIcon, MoonIcon };

// Iconos adicionales
export { UserGroupIcon, TrophyIcon, PaperAirplaneIcon, ChatBubbleLeftIcon, ArrowPathIcon };

// Iconos con nombres alternativos (compatibilidad)
export { 
  ExclamationTriangleIcon, 
  ComputerDesktopIcon, 
  ShieldCheckIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  ClipboardDocumentIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowTopRightOnSquareIcon,
  EyeSlashIcon,
  AtSymbolIcon,
  SwatchIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  PlayIcon,
  SpeakerWaveIcon
};
