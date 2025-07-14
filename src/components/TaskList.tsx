import { component$, useContext, $, useSignal } from '@builder.io/qwik';
import { AppContext } from '~/contexts/TaskContext';
import { type Task } from '~/utils/storage';
import TaskItem from './TaskItem';
import { useNotifications } from './NotificationSystem';

interface TaskListProps {
  projectId?: string;
}

export default component$<TaskListProps>(({ projectId }) => {
  const state = useContext(AppContext);
  const { addNotification } = useNotifications();
  const isFormVisible = useSignal(false);

  const tasks = projectId
    ? state.tasks.filter((task) => task.projectId === projectId)
    : state.tasks;

  const filteredTasks = tasks.filter(task => {
    if (state.currentView === 'completed') return task.completed;
    if (state.currentView === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return task.dueDate === today && !task.completed;
    }
    if (state.currentView === 'upcoming') {
      const today = new Date();
      const taskDate = new Date(task.dueDate);
      return taskDate > today && !task.completed;
    }
    return state.currentView === 'all' || !task.completed;
  });

  const handleComplete = $((id: string) => {
    const now = new Date().toISOString();
    state.tasks = state.tasks.map((t) =>
      t.id === id ? { 
        ...t, 
        completed: !t.completed,
        completedAt: !t.completed ? now : undefined,
        updatedAt: now
      } : t
    );
    
    const task = state.tasks.find(t => t.id === id);
    addNotification({
      type: 'success',
      title: task?.completed ? 'Task Completed' : 'Task Reopened',
      message: `"${task?.title}" has been ${task?.completed ? 'completed' : 'reopened'}`,
    });
  });

  const handleDelete = $((id: string) => {
    const task = state.tasks.find(t => t.id === id);
    state.tasks = state.tasks.filter((t) => t.id !== id);
    addNotification({
      type: 'success',
      title: 'Task Deleted',
      message: `"${task?.title}" has been deleted`,
    });
  });

  const handleAddTask = $((event: SubmitEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Form submitted - preventing default behavior');
    
    const formData = new FormData(event.target as HTMLFormElement);
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dueDate = formData.get('dueDate') as string;
    const priority = formData.get('priority') as string;
    const category = formData.get('category') as string;
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    console.log('Form data:', { title, description, dueDate, priority, category, tags });

    if (!title || !dueDate || !priority || !category) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      projectId: projectId || 'default',
      title: title.trim(),
      description: description?.trim() || '',
      dueDate,
      priority: priority as 'low' | 'medium' | 'high' | 'urgent',
      category: category.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags,
    };

    state.tasks = [...state.tasks, newTask];
    isFormVisible.value = false;
    
    // Reset form
    (event.target as HTMLFormElement).reset();
    
    addNotification({
      type: 'success',
      title: 'Task Created',
      message: `"${newTask.title}" has been added to your tasks`,
    });
  });

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  ];

  const categories = [
    'Work', 'Personal', 'Shopping', 'Health', 'Learning', 'Travel', 'Finance', 'Other'
  ];

  return (
    <div class="space-y-6">
      {/* Task Statistics */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredTasks.length}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {filteredTasks.filter(t => t.completed).length}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {filteredTasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {filteredTasks.filter(t => !t.completed && t.priority === 'urgent').length}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Urgent</div>
        </div>
      </div>

      {/* Task List */}
      <div class="space-y-3">
        {filteredTasks.length === 0 ? (
          <div class="text-center py-12">
            <div class="text-gray-400 dark:text-gray-500 text-lg mb-2">No tasks found</div>
            <p class="text-gray-500 dark:text-gray-400">
              {state.currentView === 'completed' ? 'No completed tasks yet' : 'Create your first task to get started'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onComplete$={handleComplete}
              onDelete$={handleDelete}
            />
          ))
        )}
      </div>

      {/* Add Task Button */}
      <div class="flex justify-center">
        <button
          onClick$={() => isFormVisible.value = !isFormVisible.value}
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          {isFormVisible.value ? 'Cancel' : '+ Add New Task'}
        </button>
      </div>

      {/* Add Task Form */}
      {isFormVisible.value && (
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4 border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Create New Task</h3>
          
          <form onSubmit$={handleAddTask} preventdefault:submit class="space-y-4">
            
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Enter task title"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                id="description"
                rows={2}
                placeholder="Add task description"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="dueDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label for="priority" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority *
                </label>
                <select
                  name="priority"
                  id="priority"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select priority</option>
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  id="category"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (Optional)
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                placeholder="Enter tags separated by commas"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick$={() => isFormVisible.value = false}
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}); 