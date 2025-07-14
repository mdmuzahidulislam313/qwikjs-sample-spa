// Storage utilities for TaskNest
const STORAGE_KEYS = {
  PROJECTS: 'projects',
  TASKS: 'tasks',
  SETTINGS: 'settings',
} as const;

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'all' | 'today' | 'upcoming' | 'completed';
  showCompletedTasks: boolean;
  taskSortBy: 'dueDate' | 'priority' | 'created' | 'updated';
  taskSortOrder: 'asc' | 'desc';
}

const isLocalStorageAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && 'localStorage' in window;
  } catch {
    return false;
  }
};

// Sample data for demonstration
const getSampleProjects = (): Project[] => [
  {
    id: 'sample-project-1',
    name: 'Personal Development',
    description: 'Self-improvement and learning goals',
    color: 'blue',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-project-2',
    name: 'Work Projects',
    description: 'Professional tasks and deadlines',
    color: 'green',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-project-3',
    name: 'Home & Family',
    description: 'Household tasks and family activities',
    color: 'purple',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const getSampleTasks = (): Task[] => [
  {
    id: 'sample-task-1',
    projectId: 'sample-project-1',
    title: 'Complete Qwik.js Tutorial',
    description: 'Learn the fundamentals of Qwik.js framework for building fast web applications',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    category: 'Learning',
    completed: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['javascript', 'framework', 'web-development'],
  },
  {
    id: 'sample-task-2',
    projectId: 'sample-project-1',
    title: 'Read "Atomic Habits" Book',
    description: 'Read and take notes on habit formation strategies',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    category: 'Learning',
    completed: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['books', 'self-improvement'],
  },
  {
    id: 'sample-task-3',
    projectId: 'sample-project-2',
    title: 'Prepare Quarterly Report',
    description: 'Compile data and create presentation for Q4 performance review',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'urgent',
    category: 'Work',
    completed: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['report', 'deadline', 'presentation'],
  },
  {
    id: 'sample-task-4',
    projectId: 'sample-project-2',
    title: 'Team Meeting Preparation',
    description: 'Prepare agenda and materials for weekly team standup',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    category: 'Work',
    completed: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['meeting', 'team'],
  },
  {
    id: 'sample-task-5',
    projectId: 'sample-project-3',
    title: 'Grocery Shopping',
    description: 'Buy weekly groceries and household essentials',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'low',
    category: 'Shopping',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['groceries', 'weekly'],
  },
  {
    id: 'sample-task-6',
    projectId: 'sample-project-3',
    title: 'Plan Weekend Activity',
    description: 'Research and plan a fun family activity for the weekend',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'low',
    category: 'Personal',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['family', 'weekend', 'fun'],
  },
];

export const saveProjects = (projects: Project[]) => {
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to save projects:', error);
    }
  }
};

export const loadProjects = (): Project[] => {
  if (isLocalStorageAvailable()) {
    try {
      const projects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (projects) {
        return JSON.parse(projects);
      } else {
        // Initialize with sample data if no projects exist
        const sampleProjects = getSampleProjects();
        saveProjects(sampleProjects);
        return sampleProjects;
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      return [];
    }
  }
  return [];
};

export const saveTasks = (tasks: Task[]) => {
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }
};

export const loadTasks = (): Task[] => {
  if (isLocalStorageAvailable()) {
    try {
      const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (tasks) {
        return JSON.parse(tasks);
      } else {
        // Initialize with sample data if no tasks exist
        const sampleTasks = getSampleTasks();
        saveTasks(sampleTasks);
        return sampleTasks;
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      return [];
    }
  }
  return [];
};

export const saveSettings = (settings: AppSettings) => {
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
};

export const loadSettings = (): AppSettings => {
  if (isLocalStorageAvailable()) {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settings) {
        return JSON.parse(settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }
  
  return {
    theme: 'system',
    defaultView: 'all',
    showCompletedTasks: true,
    taskSortBy: 'dueDate',
    taskSortOrder: 'asc',
  };
};

export const exportData = () => {
  const data = {
    projects: loadProjects(),
    tasks: loadTasks(),
    settings: loadSettings(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData: string) => {
  try {
    const data = JSON.parse(jsonData);
    if (data.projects) saveProjects(data.projects);
    if (data.tasks) saveTasks(data.tasks);
    if (data.settings) saveSettings(data.settings);
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};

export const clearAllData = () => {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}; 