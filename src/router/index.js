// src/router/index.js
/**
 * Configuración del router de Vue.js para la aplicación.
 */
import { createRouter, createWebHistory } from 'vue-router';
const Tablero = () => import(/* webpackChunkName: "tablero" */ '../views/Tablero.vue');
const Confirmadas = () => import(/* webpackChunkName: "confirmadas" */ '../views/Confirmadas.vue');
const Pendientes = () => import(/* webpackChunkName: "pendientes" */ '../views/Pendientes.vue');
const oCiclos = () => import(/* webpackChunkName: "ociclos" */ '../views/oCiclos.vue');

const routes = [
    { path: '/', name: 'Tablero', component: Tablero },
    { path: '/confirmadas', name: 'Confirmadas', component: Confirmadas },
    { path: '/pendientes', name: 'Pendientes', component: Pendientes },
    { path: '/ociclos', name: 'OtrosCiclos', component: oCiclos },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
