import { component$, useSignal, useContext, $, useVisibleTask$ } from '@builder.io/qwik';
import { AppContext } from '~/contexts/TaskContext';
import { useNotifications } from './NotificationSystem';
import { type Task } from '~/utils/storage';

interface TaskDetailsModalProps {
  task: Task;
  isOpen: boolean;
  onClose$: () => void;
}

export default component$<TaskDetailsModalProps>(({ task, isOpen, onClose$ }) => {
  const state = useContext(AppContext);
  const { addNotification } = useNotifications();
  const isEditing = useSignal(false);
  const editForm = useSignal<HTMLFormElement>();
  const commentText = useSignal('');
  const attachmentInput = useSignal<HTMLInputElement>();

  // Mock comments for demonstration
  const comments = [
    {
      id: '1',
      text: 'This task is progressing well!',
      author: 'You',
      timestamp: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      text: 'Added some additional requirements.',
      author: 'You',
      timestamp: '2024-01-15T14:45:00Z',
    },
  ];

  // Mock attachments for demonstration
  const attachments = [
    {
      id: '1',
      name: 'requirements.pdf',
      size: '2.4 MB',
      type: 'application/pdf',
      uploadedAt: '2024-01-15T09:00:00Z',
    },
    {
      id: '2',
      name: 'design-mockup.png',
      size: '1.8 MB',
      type: 'image/png',
      uploadedAt: '2024-01-15T11:30:00Z',
    },
  ];

  const handleSaveEdit = $((formData: FormData) => {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;
    const category = formData.get('category') as string;
    const dueDate = formData.get('dueDate') as string;
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];

    const updatedTask = {
      ...task,
      title: title.trim(),
      description: description?.trim() || '',
      priority: priority as 'low' | 'medium' | 'high' | 'urgent',
      category: category.trim(),
      dueDate,
      tags,
      updatedAt: new Date().toISOString(),
    };

    state.tasks = state.tasks.map(t => t.id === task.id ? updatedTask : t);
    isEditing.value = false;
    
    addNotification({
      type: 'success',
      title: 'Task Updated',
      message: 'Task has been updated successfully',
    });
  });

  const handleAddComment = $(() => {
    if (commentText.value.trim()) {
      addNotification({
        type: 'success',
        title: 'Comment Added',
        message: 'Your comment has been added to the task',
      });
      commentText.value = '';
    }
  });

  const handleFileUpload = $((event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      addNotification({
        type: 'success',
        title: 'File Uploaded',
        message: `${files[0].name} has been uploaded successfully`,
      });
    }
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const categories = [
    'Work', 'Personal', 'Shopping', 'Health', 'Learning', 'Travel', 'Finance', 'Other'
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return '🖼️';
    } else if (type === 'application/pdf') {
      return '📄';
    } else if (type.includes('document') || type.includes('word')) {
      return '📝';
    } else if (type.includes('spreadsheet') || type.includes('excel')) {
      return '📊';
    }
    return '📎';
  };

  // Focus management for accessibility
  useVisibleTask$(({ track }) => {
    track(() => isOpen);
    if (isOpen) {
      // Focus the modal when it opens
      setTimeout(() => {
        const modal = document.querySelector('[data-modal]') as HTMLElement;
        if (modal) modal.focus();
      }, 100);
    }
  });

  if (!isOpen) return null;

  return (
    <div 
      class="fixed inset-0 z-50 overflow-y-auto"
      onClick$={(e) => {
        if (e.target === e.currentTarget) {
          onClose$();
        }
      }}
    >
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80"></div>
        
        <div 
          class="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg"
          data-modal
          tabIndex={-1}
        >
          {/* Header */}
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-3">
              <div class={`w-3 h-3 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing.value ? 'Edit Task' : 'Task Details'}
              </h2>
            </div>
            <button
              onClick$={onClose$}
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div class="p-6 max-h-96 overflow-y-auto">
            {isEditing.value ? (
              <form
                ref={editForm}
                onSubmit$={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleSaveEdit(formData);
                }}
                class="space-y-4"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={task.title}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={task.description}
                    rows={3}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={task.priority}
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={task.category}
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={task.dueDate}
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={task.tags.join(', ')}
                    placeholder="Enter tags separated by commas"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </form>
            ) : (
              <div class="space-y-6">
                {/* Task Info */}
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {task.title}
                  </h3>
                  <div class="flex items-center space-x-4 mb-4">
                    <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {task.category}
                    </span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      Due: {formatDate(task.dueDate)}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p class="text-gray-600 dark:text-gray-400 mb-4">
                      {task.description}
                    </p>
                  )}
                  
                  {task.tags && task.tags.length > 0 && (
                    <div class="flex flex-wrap gap-2 mb-4">
                      {task.tags.map((tag, index) => (
                        <span key={index} class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attachments */}
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-md font-medium text-gray-900 dark:text-white">
                      Attachments ({attachments.length})
                    </h4>
                    <button
                      onClick$={() => attachmentInput.value?.click()}
                      class="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                    >
                      + Add File
                    </button>
                  </div>
                  
                  <input
                    ref={attachmentInput}
                    type="file"
                    class="hidden"
                    onChange$={handleFileUpload}
                    multiple
                  />
                  
                  <div class="space-y-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div class="flex items-center space-x-3">
                          <span class="text-lg">{getFileIcon(attachment.type)}</span>
                          <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">
                              {attachment.name}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                              {attachment.size} • {formatDate(attachment.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <button class="text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Comments ({comments.length})
                  </h4>
                  
                  <div class="space-y-3 mb-4">
                    {comments.map((comment) => (
                      <div key={comment.id} class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.author}
                          </span>
                          <span class="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.timestamp)}
                          </span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div class="flex space-x-2">
                    <input
                      type="text"
                      bind:value={commentText}
                      placeholder="Add a comment..."
                      class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <button
                      onClick$={handleAddComment}
                      class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors text-sm"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div class="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Created: {formatDate(task.createdAt)}
              {task.updatedAt !== task.createdAt && (
                <span> • Updated: {formatDate(task.updatedAt)}</span>
              )}
            </div>
            
            <div class="flex space-x-3">
              {isEditing.value ? (
                <>
                  <button
                    onClick$={() => isEditing.value = false}
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick$={() => {
                      if (editForm.value) {
                        const formData = new FormData(editForm.value);
                        handleSaveEdit(formData);
                      }
                    }}
                    class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick$={() => isEditing.value = true}
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  Edit Task
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}); 