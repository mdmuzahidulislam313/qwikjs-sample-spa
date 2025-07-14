import { component$ } from '@builder.io/qwik';
import DragDropTaskList from '~/components/DragDropTaskList';
import TaskList from '~/components/TaskList';

export default component$(() => {
  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Organize your tasks with drag-and-drop functionality
          </p>
        </div>
      </div>

      {/* Drag and Drop Task List */}
      <DragDropTaskList />

      {/* Task Creation Form */}
      <div class="mt-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Task</h2>
        <TaskList />
      </div>
    </div>
  );
}); 