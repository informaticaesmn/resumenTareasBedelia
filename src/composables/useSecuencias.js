import { ref, watch, onUnmounted } from 'vue';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.js';

export function useSecuencias(cycleIdRef, options = {}) {
  const allTasks = ref([]);
  const loading = ref(true);
  const fetchError = ref(null);

  const POLLING_INTERVAL_MS = options.pollingIntervalMs || 10000;
  let unsubscribe = null;
  let pollingIntervalId = null;
  let isPolling = false;
  const secTasks = new Map();

  async function fetchAllTasksOnce() {
    try {
      const tasksMap = new Map();
      const secIds = Array.from(secTasks.keys());
      for (const secId of secIds) {
        const cycle = cycleIdRef.value;
        const tareasRef = collection(db, 'ciclos', cycle, 'secuencias', secId, 'tareas');
        const snap = await getDocs(tareasRef);
        const tasksForThisSec = [];
        snap.forEach(doc => tasksForThisSec.push({ id: doc.id, secuenciaId: secId, ...doc.data() }));
        tasksMap.set(secId, tasksForThisSec);
      }

      secTasks.clear();
      tasksMap.forEach((v, k) => secTasks.set(k, v));
      updateAllTasks();
      loading.value = false;
      fetchError.value = null;
    } catch (err) {
        console.error('useSecuencias: polling error', err);
        // Mapear errores comunes a mensajes más amigables
        if (err && err.code === 'permission-denied') {
          fetchError.value = { code: err.code, message: 'Acceso denegado: no estás autorizado para leer estos datos. Asegurate de iniciar sesión con una cuenta autorizada.' };
        } else {
          fetchError.value = err;
        }
    }
  }

  function startPolling(secIds) {
    if (isPolling) return;
    isPolling = true;
    secIds.forEach(id => { if (!secTasks.has(id)) secTasks.set(id, []); });
    fetchAllTasksOnce();
    pollingIntervalId = setInterval(fetchAllTasksOnce, POLLING_INTERVAL_MS);
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  function stopPolling() {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
    }
    isPolling = false;
  }

  function updateAllTasks() {
    const tasksData = Array.from(secTasks.values()).flat();

    const allFiles = new Set(tasksData.map(t => t.archivo));

    const fulfilledTasks = new Map();
    tasksData.forEach(task => {
      if (!fulfilledTasks.has(task.archivo)) fulfilledTasks.set(task.archivo, new Set());
      fulfilledTasks.get(task.archivo).add(task.tarea);
    });

    const pendingTasks = [];
    const uniqueTaskNames = [...new Set(tasksData.map(t => t.tarea))];

    allFiles.forEach(archivo => {
      const tasksForFile = fulfilledTasks.get(archivo) || new Set();
      const baseTaskInfo = tasksData.find(t => t.archivo === archivo) || {};
      uniqueTaskNames.forEach(tareaName => {
        if (!tasksForFile.has(tareaName)) {
          pendingTasks.push({
            id: `${archivo}-${tareaName}`,
            carpeta: baseTaskInfo.carpeta,
            archivo: archivo,
            tarea: tareaName,
            estado: false,
            usuario: '---',
            fecha: null
          });
        }
      });
    });

    allTasks.value = [...tasksData.map(t => ({...t, estado: true})), ...pendingTasks];
  }

  const stopWatcher = watch(() => cycleIdRef.value, async (newCycle) => {
    if (!newCycle) return;
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    stopPolling();
    secTasks.clear();
    allTasks.value = [];
    loading.value = true;
    fetchError.value = null;
    try {
      const secRef = collection(db, 'ciclos', newCycle, 'secuencias');
      const secSnapshot = await getDocs(secRef);
      if (secSnapshot.empty) {
        loading.value = false;
        return;
      }

      const unsubList = [];
      const secDataMap = new Map();
      secSnapshot.forEach(secDoc => {
        secTasks.set(secDoc.id, []);
        secDataMap.set(secDoc.id, secDoc.data());
      });

      secSnapshot.forEach(secDoc => {
        const secId = secDoc.id;
        const secData = secDataMap.get(secId) || {};
        
        const tareasRef = collection(db, 'ciclos', newCycle, 'secuencias', secId, 'tareas');
        const unsub = onSnapshot(tareasRef, (querySnapshot) => {
          const tasksForThisSec = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const carpetaVal = secData?.aCursada || secData?.carpeta || secData?.Materia || '';
            const archivoVal = secData?.idPlanilla || secData?.archivo || secData?.libro || secId;
            tasksForThisSec.push({ id: doc.id, secuenciaId: secId, carpeta: carpetaVal, archivo: archivoVal, ...data });
          });

          secTasks.set(secId, tasksForThisSec);
          updateAllTasks();
          loading.value = false;
        }, (error) => {
          console.error('useSecuencias: onSnapshot error', error);
          if (error && error.code === 'permission-denied') {
            fetchError.value = { code: error.code, message: 'Acceso denegado en realtime: no estás autorizado para leer estas colecciones. Reintenta iniciar sesión con una cuenta de la lista blanca.' };
          } else {
            fetchError.value = error;
          }
          loading.value = false;
          if (!isPolling) { startPolling(Array.from(secTasks.keys())); }
        });

        unsubList.push(unsub);
      });

      unsubscribe = () => unsubList.forEach(u => u());
    } catch (err) {
      console.error('useSecuencias: init listeners error', err);
      fetchError.value = err;
      loading.value = false;
    }
  }, { immediate: true });

  onUnmounted(() => {
    if (unsubscribe) unsubscribe();
    stopPolling();
    stopWatcher();
  });

  return {
    allTasks,
    loading,
    fetchError,
    startPolling,
    stopPolling
  };
}
