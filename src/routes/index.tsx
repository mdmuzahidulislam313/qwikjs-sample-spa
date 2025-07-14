import { component$ } from '@builder.io/qwik';
import TaskList from '~/components/TaskList';

export default component$(() => {
  return (
    <>
      <h1 class="text-2xl font-bold mb-4">All Tasks</h1>
      <TaskList />
    </>
  );
});
