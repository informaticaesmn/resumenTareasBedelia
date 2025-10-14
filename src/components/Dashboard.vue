<!-- src/components/Dashboard.vue -->
<template>
  <div>
    <!-- Controles de Filtro y Búsqueda -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-lg shadow">
      <!-- Búsqueda Rápida -->
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700">Búsqueda Global</label>
        <input
          type="text"
          id="search"
          v-model="searchQuery"
          placeholder="Buscar por archivo o tarea..."
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <!-- Filtro por Carpeta -->
      <div>
        <label for="folderFilter" class="block text-sm font-medium text-gray-700">Filtrar por Carpeta</label>
        <select
          id="folderFilter"
          v-model="selectedFolder"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Todas las Carpetas</option>
          <option v-for="folder in uniqueFolders" :key="folder" :value="folder">
            {{ folder }}
          </option>
        </select>
      </div>

      <!-- Filtro por Tarea y Estado -->
      <div>
        <label for="taskFilter" class="block text-sm font-medium text-gray-700">Filtrar por Tarea</label>
        <select
          id="taskFilter"
          v-model="selectedTask"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Todas las Tareas</option>
          <optgroup label="Tareas Cumplidas">
            <option v-for="task in uniqueTasks" :key="task" :value="task + '|true'">
              {{ task }} (Cumplida)
            </option>
          </optgroup>
          <optgroup label="Tareas Pendientes">
             <option v-for="task in uniqueTasks" :key="task + '-pendiente'" :value="task + '|false'">
              {{ task }} (Pendiente)
            </option>
          </optgroup>
        </select>
      </div>
    </div>

    <!-- Tabla de Datos -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carpeta</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planilla</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarea</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Confirmación</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-if="loading">
                        <td colspan="6" class="px-6 py-4 text-center text-gray-500">Cargando datos del ciclo {{ cycleId }}...</td>
                      </tr>
                      <tr v-else-if="fetchError">
                        <td colspan="6" class="px-6 py-4 text-center text-red-500">Error al cargar datos: {{ fetchError.message || fetchError }}</td>
                      </tr>
                      <tr v-else-if="paginatedTasks.length === 0">
                        <td colspan="6" class="px-6 py-4 text-center text-gray-500">No se encontraron resultados.</td>
                      </tr>
            <tr v-for="task in paginatedTasks" :key="task.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ task.carpeta }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ task.archivo }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button v-if="task.archivo && task.archivo.length > 8" @click.prevent="openPlanilla(task.archivo)" class="text-indigo-600 hover:text-indigo-900 underline">Abrir</button>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ task.tarea }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ task.usuario }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatTimestamp(task.fecha) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
       <!-- Paginación -->
      <div v-if="totalPages > 1" class="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="prevPage" :disabled="currentPage === 1" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"> Anterior </button>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"> Siguiente </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando
              <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
              a
              <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredTasks.length) }}</span>
              de
              <span class="font-medium">{{ filteredTasks.length }}</span>
              resultados
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button @click="prevPage" :disabled="currentPage === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                <span class="sr-only">Anterior</span>
                &lt;
              </button>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                <span class="sr-only">Siguiente</span>
                &gt;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted } from 'vue';
import { useSecuencias } from '../composables/useSecuencias.js';
import { useFiltroTareas } from '../composables/useFiltroTareas.js';

// --- PROPS ---
const props = defineProps({
  cycleId: { type: String, required: true }
});

// Extraer la lógica de secuencias y tareas
const { allTasks, loading, fetchError } = useSecuencias(props.cycleId);

// Filtros y paginación
const { searchQuery, selectedFolder, selectedTask, currentPage, itemsPerPage, uniqueFolders, uniqueTasks, filteredTasks, paginatedTasks, totalPages, nextPage, prevPage } = useFiltroTareas(allTasks, { itemsPerPage: 50 });

onUnmounted(() => {
  // El composable se encarga de limpiar listeners; aquí por compatibilidad
});

// --- MÉTODOS SIMPLES ---
const formatTimestamp = (timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') return 'N/A';
  const date = timestamp.toDate();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const openPlanilla = (id) => {
  if (!id) return;
  const base = 'https://docs.google.com/spreadsheets/d/';
  const url = `${base}${encodeURIComponent(id)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
// función openPlanilla definida arriba

</script>

<style scoped>
/* Estilos específicos si fueran necesarios */
</style>
