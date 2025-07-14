import { component$, useSignal, $ } from '@builder.io/qwik';
import { type Task } from '~/utils/storage';
import TaskDetailsModal from './TaskDetailsModal';

interface TaskItemProps {
  task: Task;
  onComplete$: (id: string) => void;
  onDelete$: (id: string) => void;
}

export default component$<TaskItemProps>(({ task, onComplete$, onDelete$ }) => {
  const showDetails = useSignal(false);
  const showModal = useSignal(false);

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
  const isToday = task.dueDate === new Date().toISOString().split('T')[0];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <>
      <div class={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
        task.completed ? 'border-green-200 dark:border-green-800' : 
        isOverdue ? 'border-red-200 dark:border-red-800' : 
        'border-gray-200 dark:border-gray-700'
      }`}>
        <div class="p-4">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-3 mb-2">
                <button
                  onClick$={() => onComplete$(task.id)}
                  class={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                  }`}
                >
                  {task.completed && (
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <div class="flex-1 min-w-0">
                  <h3 class={`text-lg font-medium ${
                    task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {task.title}
                  </h3>
                  
                  <div class="flex items-center space-x-4 mt-1">
                    <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {task.category}
                    </span>
                    
                    <span class={`text-sm ${
                      isOverdue ? 'text-red-600 dark:text-red-400 font-medium' :
                      isToday ? 'text-orange-600 dark:text-orange-400 font-medium' :
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {isOverdue ? 'Overdue' : isToday ? 'Due Today' : `Due ${formatDate(task.dueDate)}`}
                    </span>
                  </div>
                  
                  {task.tags && task.tags.length > 0 && (
                    <div class="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag, index) => (
                        <span key={index} class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {task.description && (
                <div class="mt-2 ml-8">
                  <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {task.description}
                  </p>
                </div>
              )}
            </div>
            
            <div class="flex items-center space-x-1 ml-4">
              <button
                onClick$={() => showModal.value = true}
                class="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="View details"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              
              <button
                onClick$={() => showDetails.value = !showDetails.value}
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Toggle details"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              <button
                onClick$={() => onDelete$(task.id)}
                class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Delete task"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {showDetails.value && (
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                  <span class="ml-2 text-gray-600 dark:text-gray-400">
                    {formatDate(task.createdAt)}
                  </span>
                </div>
                
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Updated:</span>
                  <span class="ml-2 text-gray-600 dark:text-gray-400">
                    {formatDate(task.updatedAt)}
                  </span>
                </div>
                
                {task.completedAt && (
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Completed:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400">
                      {formatDate(task.completedAt)}
                    </span>
                  </div>
                )}
              </div>
              
              {task.description && (
                <div class="mt-3">
                  <span class="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                  <p class="mt-1 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={task}
        isOpen={showModal.value}
        onClose$={() => showModal.value = false}
      />
    </>
  );
}); 