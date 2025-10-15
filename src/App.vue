<template>
  <div class="min-h-screen bg-stone-100 flex flex-col">
    
    <BarraApp />
    <div v-if="authState.initializing" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-lg text-center">
        <p class="font-medium mb-4">Inicializando autenticación...</p>
        <p class="text-sm text-gray-600 mb-4">La aplicación está comprobando tu sesión. Si se abre una ventana para iniciar sesión, por favor completala.</p>
        <div class="flex gap-2 justify-center mb-2">
          <button @click="onRetry" class="px-4 py-2 bg-indigo-600 text-white rounded">Reintentar autenticación</button>
        </div>
        <div class="loader" aria-hidden="true">⏳</div>
      </div>
    </div>
    <main class="flex-grow">
      <router-view />
    </main>
    <FooterApp />
  </div>

  <!-- <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div> -->
</template>

<script setup>
import BarraApp from './components/BarraApp.vue';
import FooterApp from './components/FooterApp.vue';
import { authState } from './composables/useAuthState.js';
import { retrySignInPopup, retrySignInRedirect } from './composables/useAuthActions.js';

const onRetry = async () => {
  // En DEV preferimos redirect, en prod popup (si aplicable)
  if (import.meta.env.DEV) {
    const res = await retrySignInRedirect();
    if (!res.ok) console.error('Retry redirect failed:', res.error);
  } else {
    const res = await retrySignInPopup();
    if (!res.ok) console.error('Retry popup failed:', res.error);
  }
};
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
