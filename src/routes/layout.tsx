import { component$, Slot } from '@builder.io/qwik';
import { AppProvider } from '~/contexts/TaskContext';
import Header from '~/components/Header';
import ProjectList from '~/components/ProjectList';
import { NotificationSystem } from '~/components/NotificationSystem';

export default component$(() => {
  return (
    <AppProvider>
      <div class="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <ProjectList />
        <div class="flex flex-col flex-1 min-w-0">
          <Header />
          <main class="flex-1 p-6 overflow-y-auto">
            <Slot />
          </main>
        </div>
        <NotificationSystem />
      </div>
    </AppProvider>
  );
}); 