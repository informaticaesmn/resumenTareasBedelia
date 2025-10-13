/** local/FBedelia.js
 * =================================================================
 * FBedelia.js
 * =================================================================
 * contiene la lógica principal de la biblioteca FBedelia.
 * Esta biblioteca es utilizada por las planillas de Google Sheets de las bedelías
 * para gestionar la confirmación de tareas y la sincronización con la planilla central "Resumen".
 * =================================================================
 * CONFIGURACIÓN CENTRAL
 * =================================================================
 */
// ⬇️ Constantes para la conexion con Resumen".
const ID_PLANILLA_RESUMEN = '1XnlFsWWsv0Aua2jSqoZ_HpUYiQmBrN7ncKtuKuuDQD4'; 
const TAREAS_RESUMEN = 'tareas'; 

/**
 * =================================================================
 * FUNCIONES AUXILIARES (HELPERS)
 * =================================================================
 */

/**
 * Busca un dato específico en el rango de configuración de la hoja Aux (E2:F)
 * y devuelve su valor. Es insensible a mayúsculas/minúsculas.
 * @param {Sheet} hojaAux La hoja de cálculo "Aux" ya obtenida.
 * @param {string} nombreDelDato El nombre del dato a buscar en la columna E (ej. "secuencia").
 * @returns {string|number|null} El valor encontrado en la columna F o null si no se encuentra.
 */
function obtenerDatoDeAux(hojaAux, nombreDelDato) {
  const rangoDatos = hojaAux.getRange('E2:F' + hojaAux.getLastRow()).getValues();
  const nombreDatoNormalizado = nombreDelDato.toLowerCase().trim();

  for (let i = 0; i < rangoDatos.length; i++) {
    // Comprueba que la celda de la clave no esté vacía
    if (rangoDatos[i][0] && rangoDatos[i][0].toString().toLowerCase().trim() === nombreDatoNormalizado) {
      return rangoDatos[i][1]; // Retorna el valor de la columna F
    }
  }
  return null; // Retorna null si no encuentra el dato
}

/** pasa la nota en letras y si es 0 coloca "ausente" */
function enLetras(n) {
  const letras = ["ausente", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"];
  return (n >= 0 && n <= 10) ? letras[n] : "";
}

/**
 * =================================================================
 * LÓGICA DEL MENÚ Y DISPATCHER 
 * =================================================================
 */

/** funcion para crear el menu en todas las planillas */
function crearMenuTareas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const nombreHoja = "Aux";
  const hoja = ss.getSheetByName(nombreHoja);

  if (!hoja) {
    ui.alert(`⚠️ La hoja "${nombreHoja}" no existe.`);
    return;
  }

  const colTareas = 12, colEstado = 13, colFecha = 14;
  const primeraFila = 2;
  const ultimaFila = hoja.getLastRow();
  const cantidadMaxima = 12;

  if (ultimaFila < primeraFila) return;

  const valoresTareas = hoja.getRange(primeraFila, colTareas, ultimaFila - primeraFila + 1).getValues();
  const valoresEstado = hoja.getRange(primeraFila, colEstado, ultimaFila - primeraFila + 1).getValues();

  const menu = ui.createMenu("Tareas");
  let tareasAgregadas = 0;

  for (let i = 0; i < valoresTareas.length; i++) {
    const texto = valoresTareas[i][0];
    if (!texto) continue;

    const filaHoja = i + primeraFila;
    const estado = valoresEstado[i][0];
    
    let textoMenu = "";
    if (estado === true) {
      const fechaFormateada = hoja.getRange(filaHoja, colFecha).getDisplayValue();
      textoMenu = " ✓ " + texto + (fechaFormateada ? " - " + fechaFormateada : "");
    } else {
      textoMenu = " \u2610 "+ texto;
    }

    const functionName = `menuDispatcherFila${filaHoja}`;
    PropertiesService.getScriptProperties().setProperty(functionName, filaHoja.toString());
    menu.addItem(textoMenu, functionName);

    tareasAgregadas++;
    if (tareasAgregadas >= cantidadMaxima) break;
  }

  if (tareasAgregadas > 0) {
    menu.addToUi();
  }
  
  hoja.hideSheet(); // Oculta la hoja Aux después de crear el menú.
}

/** Funcion que arma las funciones antes enumeradas */
function menuDispatcher(key) {
  const fila = parseInt(PropertiesService.getScriptProperties().getProperty(key), 10);
  if (!fila) {
    SpreadsheetApp.getUi().alert("No se pudo encontrar la tarea.");
    return;
  }
  confirmarTarea(fila);
}

/**
 * =================================================================
 * FUNCIÓN PRINCIPAL (MODIFICADA)
 * =================================================================
 */

/**
 * Confirma una tarea localmente en la hoja "Aux" y luego envía los datos
 * a la planilla central "Resumen" para su procesamiento.
 * @param {number} fila El número de fila de la tarea en la hoja "Aux".
 */
function confirmarTarea(fila) {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaAux = ss.getSheetByName("Aux");

  // --- 1. ACTUALIZACIÓN LOCAL (Lógica sin cambios) ---
  const cConfirma = hojaAux.getRange(fila, 13);
  if (cConfirma.getValue() === true) {
    ui.alert("La tarea ya estaba confirmada previamente el " + hojaAux.getRange(fila, 14).getDisplayValue());
    return;
  }

  const fechaConfirmacion = new Date();
  const emailUsuario = Session.getActiveUser().getEmail();

  hojaAux.getRange(fila, 13).setValue(true);
  hojaAux.getRange(fila, 14).setValue(fechaConfirmacion);
  hojaAux.getRange(fila, 15).setValue(emailUsuario);

  // --- 2. PREPARACIÓN DE DATOS PARA ENVIAR  ---
  try {
    const nombreTarea = hojaAux.getRange(fila, 12).getValue();
    
    // --- CAMBIO 2: Obtenemos el código de secuencia desde la hoja Aux ---
    const codigoSecuencia = obtenerDatoDeAux(hojaAux, 'secuencia');

    if (!codigoSecuencia) {
      // Mensaje de error mejorado para guiar al usuario
      throw new Error("No se pudo encontrar el dato 'secuencia' en la columna E de la hoja Aux.");
    }

    // --- 3. ENVÍO A LA PLANILLA RESUMEN (Lógica sin cambios) ---
    const planillaResumen = SpreadsheetApp.openById(ID_PLANILLA_RESUMEN);
    const hojaTareasResumen = planillaResumen.getSheetByName(TAREAS_RESUMEN);
    const id_planilla = ss.getId();
    if (!hojaTareasResumen) {
      throw new Error(`No se encontró la hoja llamada "${TAREAS_RESUMEN}" en la planilla Resumen.`);
    }

    const nuevaFila = [
      id_planilla,
      codigoSecuencia,
      nombreTarea,
      fechaConfirmacion,
      emailUsuario,
      false
    ];
    
    hojaTareasResumen.appendRow(nuevaFila);

    // --- 4. CONFIRMACIÓN FINAL AL USUARIO (Lógica sin cambios) ---
    SpreadsheetApp.flush();
    crearMenuTareas();
    ui.alert(`¡Tarea "${nombreTarea}" confirmada y enviada!`);

  } catch (e) {
    Logger.log(e);
    ui.alert("Error de Sincronización", "La tarea fue confirmada localmente, pero falló el envío a la planilla Resumen: " + e.message, ui.ButtonSet.OK);
  }
}

/** =================================================================
 * FUNCIONES AUTOMÁTICAS DE GOOGLE SHEETS
 * =================================================================
 */

/* ### Próximos Pasos

1.  **Reemplaza el código** en tu editor de scripts `FBedelia` con esta nueva versión.
2.  **Asegúrate de poner el ID correcto** de tu planilla "Resumen" en la constante `ID_PLANILLA_RESUMEN`.
3.  **Guarda** el proyecto de script.
4.  **Vuelve a Publicar la Biblioteca** para que todas las planillas que la usan reciban la actualización.
    *   Ve a `Publicar > Implementar...`.
    *   Busca tu implementación activa y haz clic en el ícono de engranaje (`Gestionar implementaciones`).
    *   Haz clic en el lápiz (`Editar`).
    *   En "Versión", selecciona **"Nueva versión"**.
    *   Haz clic en **"Implementar"**.

Ahora tu sistema está listo y es aún más robusto. Cuando confirmes una tarea, ocultará la hoja `Aux` y obtendrá todos los datos que necesita de esa misma hoja.

¡Ya estamos listos para el siguiente gran paso cuando quieras: leer los datos de "Resumen" y subirlos a Firestore */