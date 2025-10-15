import { reactive } from 'vue';

// Estado global sencillo para la inicialización de auth
export const authState = reactive({
  initializing: true,
  user: null
});

export function setAuthInitializing(val) {
  authState.initializing = !!val;
}

export function setAuthUser(user) {
  authState.user = user || null;
}

export default function useAuthState() {
  return {
    authState,
    setAuthInitializing,
    setAuthUser
  };
}
