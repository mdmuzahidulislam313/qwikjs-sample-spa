import {
  createContextId,
  component$,
  useStore,
  useContextProvider,
  useVisibleTask$,
  Slot,
} from '@builder.io/qwik';
import {
  loadProjects,
  loadTasks,
  loadSettings,
  saveProjects,
  saveTasks,
  saveSettings,
  type Project,
  type Task,
  type AppSettings,
} from '../utils/storage';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  createdAt: string;
}

export interface AppState {
  projects: Project[];
  tasks: Task[];
  settings: AppSettings;
  notifications: Notification[];
  searchQuery: string;
  selectedProjectId: string | null;
  isLoading: boolean;
  currentView: 'all' | 'today' | 'upcoming' | 'completed';
}

export const AppContext = createContextId<AppState>('app-context');

export const AppProvider = component$(() => {
  const state = useStore<AppState>({
    projects: [],
    tasks: [],
    settings: {
      theme: 'system',
      defaultView: 'all',
      showCompletedTasks: true,
      taskSortBy: 'dueDate',
      taskSortOrder: 'asc',
    },
    notifications: [],
    searchQuery: '',
    selectedProjectId: null,
    isLoading: true,
    currentView: 'all',
  });

  // Load data on mount
  useVisibleTask$(() => {
    if (typeof window !== 'undefined') {
      state.projects = loadProjects();
      state.tasks = loadTasks();
      state.settings = loadSettings();
      state.currentView = state.settings.defaultView;
      state.isLoading = false;
      
      // Apply theme
      applyTheme(state.settings.theme);
    }
  });

  // Save projects when they change
  useVisibleTask$(({ track }) => {
    track(() => state.projects);
    if (typeof window !== 'undefined' && !state.isLoading) {
      saveProjects(state.projects);
    }
  });

  // Save tasks when they change
  useVisibleTask$(({ track }) => {
    track(() => state.tasks);
    if (typeof window !== 'undefined' && !state.isLoading) {
      saveTasks(state.tasks);
    }
  });

  // Save settings when they change
  useVisibleTask$(({ track }) => {
    track(() => state.settings);
    if (typeof window !== 'undefined' && !state.isLoading) {
      saveSettings(state.settings);
      applyTheme(state.settings.theme);
    }
  });

  // Auto-remove notifications after their duration
  useVisibleTask$(({ track }) => {
    track(() => state.notifications);
    state.notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          state.notifications = state.notifications.filter(n => n.id !== notification.id);
        }, notification.duration);
      }
    });
  });

  useContextProvider(AppContext, state);

  return <Slot />;
});

const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } else if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}; 