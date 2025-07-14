import { component$, useSignal, useContext, $, useVisibleTask$ } from '@builder.io/qwik';
import { AppContext } from '~/contexts/TaskContext';
import { useNotifications } from './NotificationSystem';
import { type Task } from '~/utils/storage';
import TaskItem from './TaskItem';

interface DragDropTaskListProps {
  projectId?: string;
}

export default component$<DragDropTaskListProps>(({ projectId }) => {
  const state = useContext(AppContext);
  const { addNotification } = useNotifications();
  const draggedTask = useSignal<string | null>(null);
  const dragOverTask = useSignal<string | null>(null);
  const dragStartPosition = useSignal<{ x: number; y: number } | null>(null);
  const isDragging = useSignal(false);

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

  // Sort tasks by priority and due date for better UX
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleDragStart = $((taskId: string, event: DragEvent) => {
    draggedTask.value = taskId;
    isDragging.value = true;
    dragStartPosition.value = { x: event.clientX, y: event.clientY };
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', taskId);
    }
    
    // Add visual feedback
    const element = event.target as HTMLElement;
    element.style.opacity = '0.5';
    element.style.transform = 'rotate(5deg)';
  });

  const handleDragEnd = $((event: DragEvent) => {
    draggedTask.value = null;
    dragOverTask.value = null;
    isDragging.value = false;
    dragStartPosition.value = null;
    
    // Reset visual feedback
    const element = event.target as HTMLElement;
    element.style.opacity = '1';
    element.style.transform = 'none';
  });

  const handleDragOver = $((taskId: string, event: DragEvent) => {
    event.preventDefault();
    dragOverTask.value = taskId;
    
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  });

  const handleDragLeave = $(() => {
    dragOverTask.value = null;
  });

  const handleDrop = $((targetTaskId: string, event: DragEvent) => {
    event.preventDefault();
    
    const draggedTaskId = draggedTask.value;
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;
    
    const draggedTaskIndex = sortedTasks.findIndex(t => t.id === draggedTaskId);
    const targetTaskIndex = sortedTasks.findIndex(t => t.id === targetTaskId);
    
    if (draggedTaskIndex === -1 || targetTaskIndex === -1) return;
    
    // Create new array with reordered tasks
    const newTasks = [...sortedTasks];
    const [draggedTaskItem] = newTasks.splice(draggedTaskIndex, 1);
    newTasks.splice(targetTaskIndex, 0, draggedTaskItem);
    
    // Update the global task list while preserving tasks from other projects
    const otherTasks = state.tasks.filter(task => 
      projectId ? task.projectId !== projectId : false
    );
    
    state.tasks = [...otherTasks, ...newTasks];
    
    addNotification({
      type: 'success',
      title: 'Task Reordered',
      message: `"${draggedTaskItem.title}" has been moved`,
    });
    
    draggedTask.value = null;
    dragOverTask.value = null;
    isDragging.value = false;
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

  // Add keyboard shortcuts for drag and drop
  useVisibleTask$(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDragging.value) {
        draggedTask.value = null;
        dragOverTask.value = null;
        isDragging.value = false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div class="space-y-3">
      {/* Drag and Drop Instructions */}
      <div class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span class="text-sm font-medium text-blue-800 dark:text-blue-200">
            Drag and drop tasks to reorder them
          </span>
        </div>
      </div>

      {/* Task Statistics */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{sortedTasks.length}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {sortedTasks.filter(t => t.completed).length}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {sortedTasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {sortedTasks.filter(t => !t.completed && t.priority === 'urgent').length}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Urgent</div>
        </div>
      </div>

      {/* Task List with Drag and Drop */}
      <div class="space-y-3">
        {sortedTasks.length === 0 ? (
          <div class="text-center py-12">
            <div class="text-gray-400 dark:text-gray-500 text-lg mb-2">No tasks found</div>
            <p class="text-gray-500 dark:text-gray-400">
              {state.currentView === 'completed' ? 'No completed tasks yet' : 'Create your first task to get started'}
            </p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              draggable
              class={`transition-all duration-200 ${
                draggedTask.value === task.id ? 'opacity-50 transform rotate-2 scale-105' : ''
              } ${
                dragOverTask.value === task.id ? 'transform scale-102 shadow-lg' : ''
              }`}
              onDragStart$={(e) => handleDragStart(task.id, e)}
              onDragEnd$={handleDragEnd}
              onDragOver$={(e) => handleDragOver(task.id, e)}
              onDragLeave$={handleDragLeave}
              onDrop$={(e) => handleDrop(task.id, e)}
            >
              <div class={`relative ${
                dragOverTask.value === task.id 
                  ? 'border-2 border-dashed border-indigo-400 bg-indigo-50 dark:bg-indigo-900 rounded-lg p-2' 
                  : ''
              }`}>
                {/* Drag Handle */}
                <div class="absolute left-2 top-1/2 transform -translate-y-1/2 cursor-move opacity-0 hover:opacity-100 transition-opacity">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                
                <div class="ml-6">
                  <TaskItem 
                    task={task} 
                    onComplete$={handleComplete}
                    onDelete$={handleDelete}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Drag Feedback */}
      {isDragging.value && (
        <div class="fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 pointer-events-none">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span class="text-sm font-medium">Dragging task...</span>
          </div>
        </div>
      )}
    </div>
  );
}); 