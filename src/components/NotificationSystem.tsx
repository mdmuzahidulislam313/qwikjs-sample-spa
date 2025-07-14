import { component$, useContext, $ } from '@builder.io/qwik';
import { AppContext, type Notification } from '~/contexts/TaskContext';

export const NotificationSystem = component$(() => {
  const state = useContext(AppContext);

  const removeNotification = $((id: string) => {
    state.notifications = state.notifications.filter(n => n.id !== id);
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getNotificationClasses = (type: Notification['type']) => {
    const baseClasses = 'p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform';
    switch (type) {
      case 'success': return `${baseClasses} bg-green-50 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'error': return `${baseClasses} bg-red-50 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'warning': return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'info': return `${baseClasses} bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      default: return `${baseClasses} bg-gray-50 border-gray-500 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  return (
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {state.notifications.map((notification) => (
        <div
          key={notification.id}
          class={getNotificationClasses(notification.type)}
        >
          <div class="flex items-start">
            <span class="text-lg mr-3 mt-0.5">
              {getNotificationIcon(notification.type)}
            </span>
            <div class="flex-1">
              <h4 class="font-semibold text-sm">{notification.title}</h4>
              <p class="text-sm mt-1 opacity-90">{notification.message}</p>
            </div>
            <button
              onClick$={() => removeNotification(notification.id)}
              class="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});

export const useNotifications = () => {
  const state = useContext(AppContext);

  const addNotification = $((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      duration: notification.duration || 5000,
    };
    state.notifications = [...state.notifications, newNotification];
  });

  const removeNotification = $((id: string) => {
    state.notifications = state.notifications.filter(n => n.id !== id);
  });

  const clearAllNotifications = $(() => {
    state.notifications = [];
  });

  return {
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
}; 