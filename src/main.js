import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { auth } from './config/firebase.js'
import router from './router'
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged } from 'firebase/auth'

const provider = new GoogleAuthProvider()

// Estado de la aplicación
let appInstance = null;
let appMounted = false;
let triedSignIn = false;

// Inicializar la aplicación Vue con todos los plugins
const initApp = () => {
	if (appInstance) return appInstance;
	
	const app = createApp(App);
	app.use(router);
	appInstance = app;
	return app;
};

// Montar la aplicación en el DOM
const mountApp = () => {
	if (appMounted) return;
	
	const app = initApp();
	app.mount('#app');
	appMounted = true;
};

// Lógica de autenticación
const handleAuthentication = () => {
	onAuthStateChanged(auth, (user) => {
		if (user) {
			// Usuario autenticado - montar app
			mountApp();
		} else {
			// Usuario no autenticado
			if (triedSignIn) {
				// Ya intentamos autenticar, montar app para mostrar UI de error
				mountApp();
				return;
			}

			triedSignIn = true;
			attemptSignIn();
		}
	});
};

const attemptSignIn = () => {
	signInWithPopup(auth, provider)
		.then(() => {
			mountApp();
		})
		.catch((err) => {
			console.error('No se pudo iniciar sesión con Google (popup):', err);
			handleSignInError(err);
		});
};

const handleSignInError = (err) => {
	const code = err?.code || '';
	const message = String(err?.message || '');
	
	// Verificar si debemos intentar redirect como fallback
	const shouldTryRedirect = 
		code === 'auth/popup-blocked' || 
		code === 'auth/operation-not-supported-in-this-environment' || 
		message.includes('Cross-Origin-Opener-Policy');

	if (shouldTryRedirect) {
		try {
			signInWithRedirect(auth, provider);
			// No montamos la app: el redirect recargará la página
			return;
		} catch (redirectErr) {
			console.error('Fallback redirect failed:', redirectErr);
		}
	}

	// Si no hay fallback viable, montamos la app para mostrar errores en UI
	mountApp();
};

// Inicializar la aplicación
handleAuthentication();