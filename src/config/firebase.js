// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 💡 IMPORTANTE: Usa variables de entorno (ej: .env file en Vue/Vite)
const firebaseConfig = {
  apiKey: "TU_API_KEY", 
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
// inicializar Cloud Firestore
const db = getFirestore(app);   
// Exportar el servicio de la base de datos
export { db };