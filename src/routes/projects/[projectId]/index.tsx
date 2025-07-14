import { component$, useContext } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { AppContext } from '~/contexts/TaskContext';
import TaskList from '~/components/TaskList';

export default component$(() => {
  const location = useLocation();
  const state = useContext(AppContext);
  const projectId = location.params.projectId;
  const project = state.projects.find((p) => p.id === projectId);

  return (
    <>
      <h1 class="text-2xl font-bold mb-4">{project?.name || 'Project'}</h1>
      <TaskList projectId={projectId} />
    </>
  );
}); 