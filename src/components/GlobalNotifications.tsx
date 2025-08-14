'use client';

import { useNotification } from './NotificationProvider';
import { CheckCircleIcon, XCircleIcon, InfoIcon, AlertTriangleIcon, XIcon } from './Icons';

export default function GlobalNotifications() {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />;
      default:
        return <InfoIcon className="w-5 h-5 flex-shrink-0" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-[#68c3b7] border-[#64b7ac]';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getColors(notification.type)} text-white px-6 py-4 rounded-lg shadow-lg border-l-4 flex items-center space-x-3 max-w-sm animate-slide-in`}
        >
          {getIcon(notification.type)}
          <span className="flex-1 text-sm font-medium">{notification.message}</span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-white hover:text-gray-200 transition-colors ml-2"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
