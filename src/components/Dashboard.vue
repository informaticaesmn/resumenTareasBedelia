<template>
  <div class="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard de Bedelía</h1>

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
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarea</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Confirmación</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">Cargando datos...</td>
              </tr>
              <tr v-else-if="paginatedTasks.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">No se encontraron resultados.</td>
              </tr>
              <tr v-for="task in paginatedTasks" :key="task.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ task.carpeta }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ task.archivo }}</td>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/config/firebase'; // Asegúrate que la ruta sea correcta

// --- REFERENCIAS REACTIVAS ---
const allTasks = ref([]); // Almacena todas las tareas de Firestore
const loading = ref(true); // Estado de carga
const searchQuery = ref(''); // Para el input de búsqueda
const selectedFolder = ref(''); // Para el select de carpetas
const selectedTask = ref(''); // Para el select de tareas

// --- PAGINACIÓN ---
const currentPage = ref(1);
const itemsPerPage = 50; // Límite de registros por página

// --- CONEXIÓN A FIRESTORE ---
let unsubscribe = null; // Para detener el listener al desmontar el componente

onMounted(() => {
  const q = query(collection(db, 'tareas'));
  unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasksData = [];
    const allFiles = new Set(); // Para identificar tareas pendientes

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasksData.push({ id: doc.id, ...data });
      // Agregamos el archivo a un Set para luego buscar tareas faltantes
      allFiles.add(data.archivo);
    });

    // Lógica para tareas pendientes
    const fulfilledTasks = new Map(); // Mapa de 'archivo' -> Set de 'tareas' cumplidas
    tasksData.forEach(task => {
        if (!fulfilledTasks.has(task.archivo)) {
            fulfilledTasks.set(task.archivo, new Set());
        }
        fulfilledTasks.get(task.archivo).add(task.tarea);
    });

    const pendingTasks = [];
    const uniqueTaskNames = [...new Set(tasksData.map(t => t.tarea))];

    allFiles.forEach(archivo => {
        const tasksForFile = fulfilledTasks.get(archivo) || new Set();
        const baseTaskInfo = tasksData.find(t => t.archivo === archivo); // Tomar datos base
        uniqueTaskNames.forEach(tareaName => {
            if (!tasksForFile.has(tareaName)) {
                pendingTasks.push({
                    id: `${archivo}-${tareaName}`, // ID único para la key de Vue
                    carpeta: baseTaskInfo.carpeta,
                    archivo: archivo,
                    tarea: tareaName,
                    estado: false, // Pendiente
                    usuario: '---',
                    fecha: null // Sin fecha
                });
            }
        });
    });

    // Combinamos las tareas cumplidas y las pendientes
    allTasks.value = [...tasksData, ...pendingTasks];
    loading.value = false;
  }, (error) => {
    console.error("Error al obtener las tareas:", error);
    loading.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// --- PROPIEDADES COMPUTADAS PARA FILTROS ---

// Extrae carpetas únicas para el menú desplegable
const uniqueFolders = computed(() => {
  const folders = allTasks.value.map(task => task.carpeta);
  return [...new Set(folders)].sort();
});

// Extrae tareas únicas para el menú desplegable
const uniqueTasks = computed(() => {
  const tasks = allTasks.value.map(task => task.tarea);
  return [...new Set(tasks)].sort();
});


// Filtra las tareas según los criterios de búsqueda y selección
const filteredTasks = computed(() => {
  let tasks = allTasks.value;

  // 1. Filtro por búsqueda global
  if (searchQuery.value.trim()) {
    const lowerQuery = searchQuery.value.toLowerCase();
    tasks = tasks.filter(task =>
      task.archivo.toLowerCase().includes(lowerQuery) ||
      task.tarea.toLowerCase().includes(lowerQuery)
    );
  }

  // 2. Filtro por carpeta seleccionada
  if (selectedFolder.value) {
    tasks = tasks.filter(task => task.carpeta === selectedFolder.value);
  }

  // 3. Filtro por tarea y estado
  if (selectedTask.value) {
    const [taskName, status] = selectedTask.value.split('|');
    const isCompleted = status === 'true';
    tasks = tasks.filter(task => task.tarea === taskName && task.estado === isCompleted);
  }

  return tasks;
});

// --- PROPIEDADES COMPUTADAS PARA PAGINACIÓN ---

const totalPages = computed(() => {
  return Math.ceil(filteredTasks.value.length / itemsPerPage);
});

const paginatedTasks = computed(() => {
  if (filteredTasks.value.length <= itemsPerPage) {
    return filteredTasks.value; // No paginar si no es necesario
  }
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTasks.value.slice(start, end);
});

// --- MÉTODOS ---

// Formatea el timestamp de Firestore a un formato legible
const formatTimestamp = (timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return 'N/A';
  }
  const date = timestamp.toDate();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Navegación de paginación
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

</script>

<style scoped>
</style>