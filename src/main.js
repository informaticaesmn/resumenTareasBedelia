import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { auth } from './config/firebase.js'
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged } from 'firebase/auth'

const provider = new GoogleAuthProvider()

// Evitar montar la app más de una vez
let appMounted = false;
const mountApp = () => {
	if (appMounted) return;
	createApp(App).mount('#app');
	appMounted = true;
};

// Evitar intentar el popup repetidas veces
let triedSignIn = false;

onAuthStateChanged(auth, (user) => {
	if (user) {
		mountApp();
	} else {
		if (triedSignIn) {
			// Ya intentamos el popup/redirect, montamos la app para permitir mostrar errores en la UI
			mountApp();
			return;
		}

		triedSignIn = true;
		signInWithPopup(auth, provider)
			.then(() => {
				mountApp();
			})
			.catch((err) => {
				console.error('No se pudo iniciar sesión con Google (popup):', err);
				// Si el popup fue bloqueado, intentar redirect como fallback
				const code = err?.code || '';
				const message = String(err?.message || '');
				if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment' || message.includes('Cross-Origin-Opener-Policy')) {
					try {
						signInWithRedirect(auth, provider);
						// No montamos la app: el redirect recargará y onAuthStateChanged será llamado después
						return;
					} catch (redirectErr) {
						console.error('Fallback redirect failed:', redirectErr);
					}
				}

				// Si no hay fallback viable, montamos la app para que la UI pueda mostrar mensajes de error.
				mountApp();
			});
	}
});
