<!-- src/views/Tablero.vue -->
<template>
  <div class="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-xl font-bold text-stone-700 mb-6">Tablero General
        <span v-if="currentCycleId" class="text-xl text-indigo-600 font-medium">| Ciclo Vigente: {{ currentCycleId }}</span>
      </h2>

      <div v-if="loading" class="text-center py-10">
        <p class="text-gray-500">Determinando ciclo vigente...</p>
      </div>
      <div v-else-if="fetchError" class="text-center py-10 text-red-500">
        <p>Error al determinar el ciclo: {{ fetchError.message || fetchError }}</p>
      </div>
      <div v-else-if="!currentCycleId" class="text-center py-10 text-gray-600">
        <p>No se pudo determinar un ciclo lectivo. Por favor, verifique la configuración en Firestore.</p>
      </div>
      
      <!-- Renderiza el componente Dashboard solo cuando tenemos un ciclo -->
      <Dashboard v-if="currentCycleId" :cycle-id="currentCycleId" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.js'; 
import Dashboard from '../components/Dashboard.vue'; // Importamos el nuevo componente

// --- REFERENCIAS REACTIVAS ---
const loading = ref(true); // Estado de carga
const fetchError = ref(null);
const currentCycleId = ref('');

onMounted(async () => {
  loading.value = true;
  try {
    const cyclesRef = collection(db, 'ciclos');
    const cyclesSnap = await getDocs(cyclesRef);
    console.debug('Ciclos encontrados:', cyclesSnap.size);

    const allCycles = [];
    cyclesSnap.forEach(doc => allCycles.push({ id: doc.id, ...doc.data() }));

    if (allCycles.length > 0) {
      const now = new Date();
      let activeCycleId = null;

      for (const cycle of allCycles) {
        if (cycle.fInicio?.toDate && cycle.fCierre?.toDate) {
          if (now >= cycle.fInicio.toDate() && now < cycle.fCierre.toDate()) {
            activeCycleId = cycle.id;
            break;
          }
        }
      }

      currentCycleId.value = activeCycleId || allCycles.sort((a, b) => b.id.localeCompare(a.id))[0].id;
      console.log(`Ciclo vigente determinado: ${currentCycleId.value}`);
    } else {
      console.warn('No se encontraron ciclos en Firestore.');
    }
  } catch (err) {
    console.error('Error listando ciclos:', err);
    fetchError.value = err;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
</style>