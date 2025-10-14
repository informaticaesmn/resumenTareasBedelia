import { computed, ref } from 'vue';

export function useFiltroTareas(allTasksRef, options = {}) {
  const searchQuery = ref('');
  const selectedFolder = ref('');
  const selectedTask = ref('');
  const currentPage = ref(1);
  const itemsPerPage = options.itemsPerPage || 50;

  const uniqueFolders = computed(() => {
    const folders = (allTasksRef.value || []).map(task => task.carpeta).filter(Boolean);
    return [...new Set(folders)].sort();
  });

  const uniqueTasks = computed(() => {
    const tasks = (allTasksRef.value || []).map(task => task.tarea).filter(Boolean);
    return [...new Set(tasks)].sort();
  });

  const filteredTasks = computed(() => {
    let tasks = allTasksRef.value || [];
    if (searchQuery.value.trim()) {
      const lowerQuery = searchQuery.value.toLowerCase();
      tasks = tasks.filter(task =>
        (task.archivo || '').toLowerCase().includes(lowerQuery) ||
        (task.tarea || '').toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedFolder.value) {
      tasks = tasks.filter(task => task.carpeta === selectedFolder.value);
    }

    if (selectedTask.value) {
      const [taskName, status] = selectedTask.value.split('|');
      const isCompleted = status === 'true';
      tasks = tasks.filter(task => task.tarea === taskName && task.estado === isCompleted);
    }

    return tasks;
  });

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredTasks.value.length / itemsPerPage)));

  const paginatedTasks = computed(() => {
    if (filteredTasks.value.length <= itemsPerPage) return filteredTasks.value;
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredTasks.value.slice(start, start + itemsPerPage);
  });

  function nextPage() {
    if (currentPage.value < totalPages.value) currentPage.value++;
  }

  function prevPage() {
    if (currentPage.value > 1) currentPage.value--;
  }

  return {
    searchQuery,
    selectedFolder,
    selectedTask,
    currentPage,
    itemsPerPage,
    uniqueFolders,
    uniqueTasks,
    filteredTasks,
    paginatedTasks,
    totalPages,
    nextPage,
    prevPage
  };
}
