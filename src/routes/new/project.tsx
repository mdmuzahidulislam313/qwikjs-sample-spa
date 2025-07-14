import { component$, useSignal, useContext, $ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { AppContext } from '~/contexts/TaskContext';
import { useNotifications } from '~/components/NotificationSystem';

export default component$(() => {
  const state = useContext(AppContext);
  const { addNotification } = useNotifications();
  const nav = useNavigate();
  const selectedColor = useSignal('blue');

  const colors = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    { name: 'Gray', value: 'gray', class: 'bg-gray-500' },
  ];

  const handleAddProject = $((event: SubmitEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(event.target as HTMLFormElement);
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const color = formData.get('color') as string;

    if (!name || !color) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    const newProject = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description?.trim() || '',
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.projects = [...state.projects, newProject];
    
    addNotification({
      type: 'success',
      title: 'Project Created',
      message: `"${newProject.name}" has been created successfully`,
    });

    // Navigate to the new project
    nav(`/projects/${newProject.id}`);
  });

  return (
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create New Project</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Organize your tasks by creating a new project
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit$={handleAddProject} preventdefault:submit class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter project name"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              placeholder="Brief description of the project"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Project Color *
            </label>
            <div class="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <label key={color.value} class="cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={color.value}
                    checked={selectedColor.value === color.value}
                    onChange$={() => selectedColor.value = color.value}
                    class="sr-only"
                  />
                  <div class={`flex items-center justify-center h-12 rounded-lg border-2 transition-all ${
                    selectedColor.value === color.value
                      ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}>
                    <div class={`w-6 h-6 rounded-full ${color.class}`}></div>
                  </div>
                  <p class="text-center text-xs mt-1 text-gray-600 dark:text-gray-400">
                    {color.name}
                  </p>
                </label>
              ))}
            </div>
          </div>

          <div class="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick$={() => history.back()}
              class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}); 