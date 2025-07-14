import { component$, useContext, $, useSignal } from '@builder.io/qwik';
import { AppContext } from '~/contexts/TaskContext';
import { useNotifications } from './NotificationSystem';
import { exportData, importData } from '~/utils/storage';

export default component$(() => {
  const state = useContext(AppContext);
  const { addNotification } = useNotifications();
  const showSettings = useSignal(false);
  const showKeyboardShortcuts = useSignal(false);

  const handleThemeChange = $((theme: 'light' | 'dark' | 'system') => {
    state.settings = { ...state.settings, theme };
    addNotification({
      type: 'success',
      title: 'Theme Updated',
      message: `Theme changed to ${theme}`,
    });
  });

  const handleSearch = $((query: string) => {
    state.searchQuery = query;
  });

  const handleExport = $(() => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasknest-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addNotification({
        type: 'success',
        title: 'Data Exported',
        message: 'Your data has been exported successfully',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export data',
      });
    }
  });

  const handleImport = $((event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          if (importData(data)) {
            // Reload the page to refresh the data
            location.reload();
          } else {
            addNotification({
              type: 'error',
              title: 'Import Failed',
              message: 'Invalid data format',
            });
          }
        } catch (error) {
          addNotification({
            type: 'error',
            title: 'Import Failed',
            message: 'Failed to import data',
          });
        }
      };
      reader.readAsText(file);
    }
  });

  const getThemeIcon = () => {
    switch (state.settings.theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'system': return '🖥️';
      default: return '🖥️';
    }
  };

  return (
    <header class="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between relative">
      <div class="flex items-center space-x-4">
        <h1 class="text-xl font-bold text-indigo-600 dark:text-indigo-400">TaskNest</h1>
        <div class="relative">
          <input
            type="text"
            placeholder="Search tasks and projects..."
            value={state.searchQuery}
            onInput$={(e) => handleSearch((e.target as HTMLInputElement).value)}
            class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white w-64"
          />
          <div class="absolute left-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        {/* View Toggle */}
        <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['all', 'today', 'upcoming', 'completed'] as const).map((view) => (
            <button
              key={view}
              onClick$={() => (state.currentView = view)}
              class={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                state.currentView === view
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <div class="relative">
          <button
            onClick$={() => showSettings.value = !showSettings.value}
            class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {getThemeIcon()}
          </button>
          
          {showSettings.value && (
            <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div class="p-2">
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</div>
                <div class="space-y-1">
                  {(['light', 'dark', 'system'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick$={() => {
                        handleThemeChange(theme);
                        showSettings.value = false;
                      }}
                      class={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        state.settings.theme === theme
                          ? 'bg-indigo-500 text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div class="border-t border-gray-200 dark:border-gray-700 p-2">
                <button
                  onClick$={() => {
                    handleExport();
                    showSettings.value = false;
                  }}
                  class="w-full text-left px-3 py-2 rounded text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  📤 Export Data
                </button>
                <label class="w-full text-left px-3 py-2 rounded text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer block">
                  📥 Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange$={handleImport}
                    class="hidden"
                  />
                </label>
                <button
                  onClick$={() => {
                    showKeyboardShortcuts.value = true;
                    showSettings.value = false;
                  }}
                  class="w-full text-left px-3 py-2 rounded text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ⌨️ Keyboard Shortcuts
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts.value && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Keyboard Shortcuts</h3>
              <button
                onClick$={() => showKeyboardShortcuts.value = false}
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span>Search</span>
                <kbd class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl + K</kbd>
              </div>
              <div class="flex justify-between">
                <span>New Task</span>
                <kbd class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl + N</kbd>
              </div>
              <div class="flex justify-between">
                <span>New Project</span>
                <kbd class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl + Shift + N</kbd>
              </div>
              <div class="flex justify-between">
                <span>Toggle Theme</span>
                <kbd class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl + T</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}); 