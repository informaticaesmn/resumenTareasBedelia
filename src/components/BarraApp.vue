<!-- src/components/BarraApp.vue -->
<template>
  <nav class="bg-primary-dark text-white px-4 py-2 md:px-6 flex items-center justify-between relative shadow-lg">

    <!-- Menú Mobile -->
    <button
      @click.stop="toggleMenu"
      class="md:hidden text-white hover:text-teal-200 transition"
      aria-label="Menú"
    >
      <Bars3Icon class="h-8 w-8" />
    </button>

    <!-- Links desktop -->
    <div class="hidden md:flex items-center space-x-1">
      <button 
        v-for="link in menuLinks" 
        :key="link.to" 
        @click="navigate(link.to)" 
        class="hover:bg-teal-600 px-3 py-2 flex items-center rounded transition"
      >
        <component :is="link.icon" class="h-5 w-5" />
        <span class="px-2 font-light">{{ link.text }}</span>
      </button>
    </div>

    <!-- Menú móvil desplegable -->
    <transition name="slide">
      <div v-if="menuOpen" class="md:hidden absolute top-full left-0 w-full bg-primary-dark flex flex-col space-y-2 px-4 py-3 shadow-lg z-20">
        <button 
          v-for="link in menuLinks" 
          :key="link.to" 
          @click="navigate(link.to, true)" 
          class="hover:bg-teal-600 px-3 py-2 rounded flex items-center transition text-left"
        >
          <component :is="link.icon" class="h-5 w-5" />
          <span class="px-2">{{ link.text }}</span>
        </button>
      </div>
    </transition>

    <!-- Logo o título de la app -->
    <div class="flex-1 text-right ">
      <h2 class="text-sm font-medium text-stone-200">Bedelia</h2>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Bars3Icon, 
  Squares2X2Icon, 
  Square3Stack3DIcon, 
  DocumentIcon,
  DocumentCheckIcon
} from '@heroicons/vue/24/outline'

const menuOpen = ref(false)
const router = useRouter()

// Menú simplificado - ajusta según tus necesidades
const menuLinks = [
  { to: '/', text: 'Tablero', icon: Squares2X2Icon },
  { to: '/Confirmadas', text: 'Confirmadas', icon: DocumentCheckIcon },
  { to: '/Pendientes', text: 'Pendientes', icon: DocumentIcon },
  { to: '/ociclos', text: 'Otros Ciclos', icon: Square3Stack3DIcon },
]

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function navigate(path, closeMenu = false) {
  if (closeMenu) {
    menuOpen.value = false
  }
  router.push(path)
}
</script>

<style scoped>
/* Animación suave del menú móvil */
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.25s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 15rem;
}
</style>