Agent Tasking: resumen-bedelia
Este documento sirve como un manifiesto técnico y guía de arquitectura para el proyecto resumen-bedelia. Su propósito es describir los componentes, flujos de datos, lógica de negocio y puntos clave para el desarrollo y mantenimiento.

1. Resumen del Proyecto
El proyecto es una aplicación web (SPA) construida con Vue 3 y Vite, diseñada para visualizar el estado de las tareas administrativas de la bedelía de una institución educativa. La aplicación se autentica contra Firebase Authentication y consume datos de una base de datos Firestore.

El ecosistema completo tiene dos partes principales:

Sistema de Entrada de Datos (Google Sheets): El personal de bedelía utiliza planillas de Google Sheets para registrar tareas. Un script de Google Apps (FBedelia.js) centraliza estos registros en una planilla "Resumen".
Sistema de Visualización (Esta Web App): La aplicación web lee los datos procesados y almacenados en Firestore para presentarlos en un dashboard.
2. Pila Tecnológica (Stack)
Frontend: Vue 3 (Composition API), Vite, TailwindCSS.
Enrutamiento: Vue Router.
Backend & DB: Firebase (Authentication, Firestore).
Plataforma de Despliegue: Vercel.
Fuente de Datos Primaria: Google Sheets con Google Apps Script.
Control de Versiones: Git (gestionado con un script de PowerShell para versionado).
3. Arquitectura y Flujo de Datos
El flujo de información es crucial para entender el sistema:

mermaid
graph TD
    A[Planilla Bedelía (Google Sheet)] -- 1. Confirma Tarea --> B(FBedelia.js - Apps Script);
    B -- 2. Escribe Fila --> C[Planilla Central "Resumen" (Google Sheet)];
    C -- 3. Proceso Externo (Manual/Futura Function) --> D[Firebase Firestore];
    D -- 4. Lee Datos --> E[App Web Vue (resumen-bedelia)];
    F[Usuario (Personal Bedelía)] -- 5. Inicia Sesión --> G[Firebase Authentication];
    G -- 6. OK --> E;
    E -- 7. Muestra Datos --> F;

    subgraph "Entorno Google Sheets"
        A
        B
        C
    end

    subgraph "Entorno Web (Vercel/Firebase)"
        D
        E
        G
    end
Puntos Clave del Flujo:

FBedelia.js: Este script es el "pegamento" en el lado de Google Sheets. Crea un menú en las planillas, y al confirmar una tarea, escribe una nueva fila en la planilla central Resumen con datos clave como id_planilla, codigoSecuencia, nombreTarea, etc.
Punto Ciego (Paso 3): Existe un paso, actualmente no automatizado en el código proporcionado, que consiste en tomar los datos de la planilla "Resumen" y cargarlos en Firestore. El comentario en FBedelia.js sugiere que este es el siguiente paso a desarrollar, posiblemente con una Cloud Function.
La App Web: Su rol es de solo lectura y visualización. Se autentica y luego consulta las colecciones en Firestore para mostrar la información.
4. Análisis de Componentes Clave
main.js (Punto de Entrada)
Este archivo es más que una simple inicialización de Vue. Contiene la lógica de autenticación crítica que protege toda la aplicación.

Lógica de Montaje Condicional: La aplicación Vue no se monta en el DOM hasta que el estado de autenticación de Firebase se resuelve. Esto previene que se muestre cualquier vista protegida a un usuario no autenticado.
Flujo de Autenticación Robusto:
onAuthStateChanged es el observador principal.
Si el usuario está autenticado, se monta la app (mountApp()).
Si el usuario no está autenticado, intenta un inicio de sesión.
Prioriza signInWithRedirect en desarrollo (import.meta.env.DEV), ya que es más resistente a bloqueadores de pop-ups.
En producción, intenta signInWithPopup primero. Si falla (por ejemplo, auth/popup-blocked), tiene una lógica de fallback para reintentar con signInWithRedirect.
El estado triedSignIn previene bucles infinitos de intentos de login.
vite.config.js (Configuración de Build)
Variables de Entorno Globales: Utiliza define para inyectar información del build (versión, commit, branch) directamente en el código de la aplicación. Esto es útil para depuración y para mostrar la versión actual en la UI.
Optimización de Bundles (manualChunks): Separa el código de firebase en un "chunk" de vendor separado. Esto es una buena práctica para el cacheo del navegador. Como la librería de Firebase es grande y no cambia tan a menudo como el código de tu aplicación, los usuarios no tendrán que volver a descargarla en cada deploy.
Alias de Rutas: Configura el alias @ para apuntar a /src, una convención estándar que mejora la legibilidad de las importaciones.
oCiclos.vue (Selector de Contexto)
Este componente actúa como un "selector de contexto" para el dashboard principal.

Responsabilidad Única: Su única tarea es obtener la lista de ciclos lectivos (ciclos) de Firestore y permitir al usuario seleccionar uno.
Paso de Props: Una vez que se selecciona un ciclo, renderiza el componente Dashboard.vue (mencionado como Tablero.vue en tu solicitud) y le pasa el selectedCycle como una prop. Esto desacopla la lógica de selección de la lógica de visualización.
Modelo de Datos Implícito: Revela una estructura de datos clave en Firestore: una colección raíz llamada ciclos, donde cada documento representa un ciclo lectivo y su ID es el año (ej. "2024").
update-version.ps1 (Automatización de Release)
Este script de PowerShell define un proceso de release semi-automatizado.

Flujo: Sincroniza con el remoto, comitea cambios pendientes, incrementa la versión del paquete (npm version), actualiza la versión en README.md, y finalmente hace push de los cambios y tags a GitHub.
Intención: Demuestra una intención clara de mantener un historial de versiones limpio y un proceso de despliegue consistente.
5. Puntos de Acción y Próximos Pasos
Automatizar la Sincronización Sheet -> Firestore: Este es el eslabón perdido más importante. La estrategia recomendada sería una Firebase Cloud Function que se active por un trigger (ej. un onCall desde el Apps Script, o un trigger de tiempo onSchedule) para leer la planilla "Resumen" y actualizar/insertar los datos en Firestore.
Refactorizar Tablero.vue / Dashboard.vue: Como mencionaste, este componente necesita ser reformulado. La estructura actual con oCiclos.vue como padre es sólida. El refactor debe centrarse en cómo Dashboard.vue consulta y presenta los datos para un cycleId específico.
Seguridad en Firestore: El script gen-rules en package.json es un placeholder o está incompleto. Es crítico definir reglas de seguridad en firestore.rules para asegurar que los usuarios autenticados solo puedan leer los datos a los que tienen permiso. Por ejemplo: allow read: if request.auth != null;.
Gestión de Errores en UI: La lógica de main.js maneja bien los errores de autenticación a nivel de consola, pero si todos los métodos de inicio de sesión fallan, la app se monta sin un usuario. Se debería implementar una vista o componente global que muestre un mensaje de error claro al usuario en esta situación.
