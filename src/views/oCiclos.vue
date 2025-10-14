<!-- src/views/oCiclos.vue -->
<template>
  <div class="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Consulta de Ciclos Anteriores</h1>

      <!-- Selector de Ciclo -->
      <div class="mb-6 max-w-sm">
        <label for="cycleSelect" class="block text-sm font-medium text-gray-700">Seleccione un ciclo para revisar</label>
        <select 
          id="cycleSelect" 
          v-model="selectedCycle" 
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">-- Seleccionar --</option>
          <option v-for="c in cyclesList" :key="c.id" :value="c.id">{{ c.id }}</option>
        </select>
      </div>

      <!-- Renderiza el Dashboard si se ha seleccionado un ciclo -->
      <div v-if="selectedCycle">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Mostrando datos para el ciclo <span class="text-indigo-600">{{ selectedCycle }}</span></h2>
        <Dashboard :cycle-id="selectedCycle" />
      </div>
      <div v-else class="text-center py-10 bg-white rounded-lg shadow">
        <p class="text-gray-600">Por favor, seleccione un ciclo lectivo para ver sus datos.</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import Dashboard from '../components/Dashboard.vue';

const cyclesList = ref([]);
const selectedCycle = ref('');

onMounted(async () => {
  try {
    const cyclesRef = collection(db, 'ciclos');
    const cyclesSnap = await getDocs(cyclesRef);
    const allCycles = [];
    cyclesSnap.forEach(doc => allCycles.push({ id: doc.id, ...doc.data() }));
    // Ordenamos para que los más recientes aparezcan primero en el selector
    cyclesList.value = allCycles.sort((a, b) => b.id.localeCompare(a.id));
  } catch (error) {
    console.error("Error al obtener la lista de ciclos:", error);
  }
});
</script>