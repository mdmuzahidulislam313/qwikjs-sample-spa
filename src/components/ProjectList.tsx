import { component$, useContext, $, useSignal } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { AppContext } from '~/contexts/TaskContext';
import { useNotifications } from './NotificationSystem';

export default component$(() => {
  const state = useContext(AppContext);
  const location = useLocation();
  const { addNotification } = useNotifications();
  const editingProject = useSignal<string | null>(null);
  const editName = useSignal('');

  const getTaskStats = (projectId: string) => {
    const projectTasks = state.tasks.filter(task => task.projectId === projectId);
    const completed = projectTasks.filter(task => task.completed).length;
    const total = projectTasks.length;
    const overdue = projectTasks.filter(task => 
      !task.completed && new Date(task.dueDate) < new Date()
    ).length;
    
    return { completed, total, overdue };
  };

  const getAllTaskStats = () => {
    const completed = state.tasks.filter(task => task.completed).length;
    const total = state.tasks.length;
    const overdue = state.tasks.filter(task => 
      !task.completed && new Date(task.dueDate) < new Date()
    ).length;
    
    return { completed, total, overdue };
  };

  const startEditProject = $((project: any) => {
    editingProject.value = project.id;
    editName.value = project.name;
  });

  const saveProjectEdit = $(() => {
    if (editingProject.value && editName.value.trim()) {
      state.projects = state.projects.map(p => 
        p.id === editingProject.value 
          ? { ...p, name: editName.value.trim(), updatedAt: new Date().toISOString() }
          : p
      );
      editingProject.value = null;
      editName.value = '';
      addNotification({
        type: 'success',
        title: 'Project Updated',
        message: 'Project name has been updated',
      });
    }
  });

  const cancelEdit = $(() => {
    editingProject.value = null;
    editName.value = '';
  });

  const deleteProject = $((projectId: string) => {
    if (confirm('Are you sure you want to delete this project? All tasks will also be deleted.')) {
      state.projects = state.projects.filter(p => p.id !== projectId);
      state.tasks = state.tasks.filter(t => t.projectId !== projectId);
      addNotification({
        type: 'success',
        title: 'Project Deleted',
        message: 'Project and all its tasks have been deleted',
      });
    }
  });

  const getProjectColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      indigo: 'bg-indigo-500',
      gray: 'bg-gray-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  const filteredProjects = state.projects.filter(project =>
    project.name.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  const allStats = getAllTaskStats();

  return (
    <aside class="w-80 bg-white dark:bg-gray-800 shadow-md flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-bold mb-4">Navigation</h2>
        
        {/* All Tasks */}
        <Link
          href="/"
          class={`flex items-center justify-between p-3 rounded-lg mb-2 transition-colors ${
            location.url.pathname === '/' 
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <div class="flex items-center">
            <span class="text-lg mr-3">📋</span>
            <span class="font-medium">All Tasks</span>
          </div>
          <div class="flex items-center space-x-2 text-xs">
            <span class="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
              {allStats.completed}/{allStats.total}
            </span>
            {allStats.overdue > 0 && (
              <span class="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                {allStats.overdue} overdue
              </span>
            )}
          </div>
        </Link>

        {/* Analytics */}
        <Link
          href="/analytics"
          class={`flex items-center justify-between p-3 rounded-lg mb-2 transition-colors ${
            location.url.pathname === '/analytics' 
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <div class="flex items-center">
            <span class="text-lg mr-3">📊</span>
            <span class="font-medium">Analytics</span>
          </div>
          <div class="flex items-center space-x-2 text-xs">
            <span class="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
              Insights
            </span>
          </div>
        </Link>

        {/* Task Management */}
        <Link
          href="/tasks"
          class={`flex items-center justify-between p-3 rounded-lg mb-2 transition-colors ${
            location.url.pathname === '/tasks' 
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <div class="flex items-center">
            <span class="text-lg mr-3">🎯</span>
            <span class="font-medium">Task Management</span>
          </div>
          <div class="flex items-center space-x-2 text-xs">
            <span class="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
              Drag & Drop
            </span>
          </div>
        </Link>

        {/* Quick Views */}
        <div class="space-y-1 mb-4">
          <button
            onClick$={() => state.currentView = 'today'}
            class={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
              state.currentView === 'today' 
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>📅 Today</span>
            <span class="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
              {state.tasks.filter(t => !t.completed && new Date(t.dueDate).toDateString() === new Date().toDateString()).length}
            </span>
          </button>
          <button
            onClick$={() => state.currentView = 'upcoming'}
            class={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
              state.currentView === 'upcoming' 
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>⏰ Upcoming</span>
            <span class="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
              {state.tasks.filter(t => !t.completed && new Date(t.dueDate) > new Date()).length}
            </span>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div class="p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">Projects</h3>
            <span class="text-sm text-gray-500">{filteredProjects.length}</span>
          </div>
          
          <nav class="space-y-2">
            {filteredProjects.map((project) => {
              const stats = getTaskStats(project.id);
              const isActive = location.url.pathname === `/projects/${project.id}`;
              
              return (
                <div key={project.id} class="group">
                  {editingProject.value === project.id ? (
                    <div class="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <input
                        type="text"
                        value={editName.value}
                        onInput$={(e) => editName.value = (e.target as HTMLInputElement).value}
                        onKeyDown$={(e) => {
                          if (e.key === 'Enter') saveProjectEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        class="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                        autoFocus
                      />
                      <button
                        onClick$={saveProjectEdit}
                        class="text-green-600 hover:text-green-700 text-sm"
                      >
                        ✓
                      </button>
                      <button
                        onClick$={cancelEdit}
                        class="text-red-600 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div class={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}>
                      <Link
                        href={`/projects/${project.id}`}
                        class="flex items-center flex-1 min-w-0"
                      >
                        <div class={`w-3 h-3 rounded-full mr-3 ${getProjectColor(project.color)}`}></div>
                        <div class="flex-1 min-w-0">
                          <div class="font-medium truncate">{project.name}</div>
                          <div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>{stats.completed}/{stats.total} tasks</span>
                            {stats.overdue > 0 && (
                              <span class="text-red-500">{stats.overdue} overdue</span>
                            )}
                          </div>
                        </div>
                      </Link>
                      <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick$={() => startEditProject(project)}
                          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ✏️
                        </button>
                        <button
                          onClick$={() => deleteProject(project.id)}
                          class="p-1 text-gray-400 hover:text-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/new"
          class="flex items-center justify-center w-full p-3 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
        >
          <span class="mr-2">+</span>
          New Project
        </Link>
      </div>
    </aside>
  );
}); 