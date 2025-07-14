import { component$, useContext, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { AppContext } from '~/contexts/TaskContext';

export default component$(() => {
  const state = useContext(AppContext);
  const selectedPeriod = useSignal('7d');
  const animationProgress = useSignal(0);

  // Calculate analytics data
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.completed).length;
  const overdueTasks = state.tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;
  const urgentTasks = state.tasks.filter(t => !t.completed && t.priority === 'urgent').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  function calculateAverageCompletionTime() {
    const completedTasksWithTime = state.tasks.filter(t => t.completed && t.completedAt);
    if (completedTasksWithTime.length === 0) return 0;
    
    const totalTime = completedTasksWithTime.reduce((sum, task) => {
      const created = new Date(task.createdAt).getTime();
      const completed = new Date(task.completedAt!).getTime();
      return sum + (completed - created);
    }, 0);
    
    return Math.round(totalTime / completedTasksWithTime.length / (1000 * 60 * 60 * 24)); // Days
  }

  function calculateProductivityScore() {
    const overdueRate = overdueTasks / Math.max(totalTasks, 1) * 100;
    const urgentRate = urgentTasks / Math.max(totalTasks, 1) * 100;
    
    return Math.max(0, Math.min(100, completionRate - (overdueRate * 0.5) - (urgentRate * 0.3)));
  }

  function getTasksByPriority() {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    return priorities.map(priority => ({
      priority,
      count: state.tasks.filter(t => t.priority === priority).length,
      completed: state.tasks.filter(t => t.priority === priority && t.completed).length,
    }));
  }

  function getTasksByCategory() {
    const categories = [...new Set(state.tasks.map(t => t.category))];
    return categories.map(category => ({
      category,
      count: state.tasks.filter(t => t.category === category).length,
      completed: state.tasks.filter(t => t.category === category && t.completed).length,
    }));
  }

  function getCompletionTrend() {
    const days = 7;
    const trend = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const completed = state.tasks.filter(t => 
        t.completedAt && t.completedAt.startsWith(dateString)
      ).length;
      
      trend.push({
        date: dateString,
        completed,
        label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }
    
    return trend;
  }

  function getDailyActivity() {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      tasks: state.tasks.filter(t => {
        const hour = new Date(t.createdAt).getHours();
        return hour === i;
      }).length,
    }));
    
    return hours;
  }

  const analytics = {
    totalTasks,
    completedTasks,
    overdueTasks,
    urgentTasks,
    completionRate,
    averageCompletionTime: calculateAverageCompletionTime(),
    productivityScore: calculateProductivityScore(),
    tasksByPriority: getTasksByPriority(),
    tasksByCategory: getTasksByCategory(),
    completionTrend: getCompletionTrend(),
    dailyActivity: getDailyActivity(),
  };

  // Animate progress bars
  useVisibleTask$(() => {
    const animate = () => {
      animationProgress.value += 0.02;
      if (animationProgress.value < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  });

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
  };

  const categoryColors = [
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-lime-500',
  ];

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Track your productivity and task completion patterns
          </p>
        </div>
        
        <div class="flex items-center space-x-2">
          <select
            bind:value={selectedPeriod}
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalTasks}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{analytics.completedTasks}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
              <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{analytics.overdueTasks}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Productivity Score</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(analytics.productivityScore)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate */}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Completion Rate</h3>
          <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <div>
                <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 dark:bg-green-900 dark:text-green-200">
                  Progress
                </span>
              </div>
              <div class="text-right">
                <span class="text-xs font-semibold inline-block text-green-600 dark:text-green-400">
                  {Math.round(analytics.completionRate)}%
                </span>
              </div>
            </div>
            <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200 dark:bg-green-900">
              <div 
                style={`width: ${analytics.completionRate * animationProgress.value}%; transition: width 0.5s ease-in-out`}
                class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              ></div>
            </div>
          </div>
        </div>

        {/* Average Completion Time */}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Average Completion Time</h3>
          <div class="text-center">
            <div class="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {analytics.averageCompletionTime}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              days on average
            </div>
          </div>
        </div>
      </div>

      {/* Tasks by Priority */}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks by Priority</h3>
        <div class="space-y-4">
          {analytics.tasksByPriority.map((item) => (
            <div key={item.priority} class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class={`w-3 h-3 rounded-full ${priorityColors[item.priority as keyof typeof priorityColors]}`}></div>
                <span class="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {item.priority}
                </span>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {item.completed}/{item.count}
                </div>
                <div class="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    class={`h-2 rounded-full ${priorityColors[item.priority as keyof typeof priorityColors]}`}
                    style={`width: ${item.count > 0 ? (item.completed / item.count) * 100 * animationProgress.value : 0}%; transition: width 0.5s ease-in-out`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Trend */}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">7-Day Completion Trend</h3>
        <div class="flex items-end space-x-2 h-32">
          {analytics.completionTrend.map((day, index) => (
            <div key={day.date} class="flex-1 flex flex-col items-center">
              <div class="flex-1 flex items-end">
                <div 
                  class="w-full bg-indigo-500 rounded-t"
                  style={`height: ${Math.max(4, (day.completed / Math.max(...analytics.completionTrend.map(d => d.completed), 1)) * 100 * animationProgress.value)}%; transition: height 0.5s ease-in-out`}
                ></div>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                {day.label}
              </div>
              <div class="text-xs font-semibold text-gray-900 dark:text-white">
                {day.completed}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks by Category */}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks by Category</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.tasksByCategory.map((item, index) => (
            <div key={item.category} class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class={`w-3 h-3 rounded-full ${categoryColors[index % categoryColors.length]}`}></div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {item.category}
                </span>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {item.completed}/{item.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}); 