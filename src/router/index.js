// src/router/index.js
/**
 * Configuración del router de Vue.js para la aplicación.
 */
import { createRouter, createWebHistory } from 'vue-router';
import Tablero from '../views/Tablero.vue';
import Confirmadas from '../views/Confirmadas.vue';
import Pendientes from '../views/Pendientes.vue';
import OCiclos from '../views/oCiclos.vue';

const routes = [
    {
        path: '/',
        name: 'Tablero',
        component: Tablero,
    },
    {
        path: '/confirmadas',
        name: 'Confirmadas',
        component: Confirmadas,
    },
    {
        path: '/pendientes',
        name: 'Pendientes',
        component: Pendientes,
    },
    {
        path: '/ociclos',
        name: 'OCiclos',
        component: OCiclos,
    },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
