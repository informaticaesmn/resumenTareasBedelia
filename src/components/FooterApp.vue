<!-- src/components/FooterApp.vue -->
<template>
  <footer class="bg-stone-800 text-stone-300 text-xs text-light flex-1 grid md:grid-cols-2 text-center">
    
    <!-- Sección Izquierda: Info de Versión y Layout Actual -->
    <div class="flex flex-col md:flex-row items-center justify-center gap-x-4 gap-y-2 p-1">
        <!-- Info de Versión -->
      <div class="flex items-center gap-2">
        <div v-if="currentUserEmail" class="text-xs font-light text-stone-500 px-4"> {{ currentUserEmail }}</div>
        <CodeBracketSquareIcon class="h-5 w-5 text-primary-light"/> <!-- THEME-AWARE -->
        <span> 
          {{ branch == "dev" ? 'Desarrollo' : 'Versión' }} | <i>{{ branch }} v{{ version }}</i>
        </span>
      </div>

    </div>

    <!-- Sección Derecha: Copyright y Enlaces -->
    <div class="flex items-center justify-center gap-4 p-1">
      <!-- Enlace a la ESMN con ícono -->
      <button 
        class="btn btn-link text-primary focus:text-stone-50 hover:text-stone-50 transition
              focus:ring-2 focus:outline-none focus:ring-primary-light rounded-sm px-2 py-1 justify-center pr-2"
        @click='sitioOficial'
      >
        <AcademicCapIcon class="h-5 w-5"/> 
        <span>
          Escuela Superior de Música de Neuquén &copy; 
          {{ new Date().getFullYear() }}
        </span>
      </button>  
      <a 
        href="https://esm-nqn.infd.edu.ar/sitio/" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="shrink-0">
        <img src="/avatar.png" alt="Logo ESMN" class="w-9 rounded-full">
      </a>
    </div>

  </footer>
</template>


<script setup>
  import { CodeBracketSquareIcon } from '@heroicons/vue/16/solid';
  import { AcademicCapIcon } from '@heroicons/vue/24/outline';
  import { ref } from 'vue';
  import { auth } from '../config/firebase.js';
  import { onAuthStateChanged } from 'firebase/auth';

  // Variables de entorno inyectadas en tiempo de compilación
  const version = __APP_VERSION__;
  const branch = __APP_BRANCH__;
  const commit = __APP_COMMIT__;

  // Email del usuario autenticado (se muestra en el footer)
  const currentUserEmail = ref(null);
  onAuthStateChanged(auth, (user) => {
    currentUserEmail.value = user ? user.email : null;
  });

  // Función para navegar al sitio de la escuela
  const sitioOficial = () => {
    window.open('https://esm-nqn.infd.edu.ar/sitio/', '_blank', 'noopener,noreferrer');
  };
</script>