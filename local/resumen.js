/**
 * local/resumen.js
 * Script de Google Apps Script para gestionar la planilla "Resumen" que centraliza
 * las tareas de las bedelías en una organización educativa.
 */
//ID implementacion 0.1: ' https://script.google.com/macros/s/AKfycbzMN6x8dZJXe6CaCje2qZDgQcbjVhtflL-xA6HOqTwqlft746J3TF7FGUt37ttFmhTVSA/exec'

function escanearPlanillasEnDrive() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaPlanillas = ss.getSheetByName('Planillas') || ss.insertSheet('Planillas');
  hojaPlanillas.clear();
  hojaPlanillas.appendRow(['Carpeta', 'Planilla', 'ID']);

  const carpetaRaiz = DriveApp.getFolderById(ss.getId()).getParents().next(); // carpeta que contiene el resumen
  const subcarpetas = carpetaRaiz.getFolders();

  while (subcarpetas.hasNext()) {
    const subcarpeta = subcarpetas.next();
    const archivos = subcarpeta.getFilesByType(MimeType.GOOGLE_SHEETS);

    while (archivos.hasNext()) {
      const archivo = archivos.next();
      hojaPlanillas.appendRow([
        subcarpeta.getName(),
        archivo.getName(),
        archivo.getId()
      ]);
    }
  }

  // Opcional: ordenar por Carpeta y luego por Planilla
  const ultimaFila = hojaPlanillas.getLastRow();
  if (ultimaFila > 1) {
    hojaPlanillas.getRange(2, 1, ultimaFila - 1, 3)
      .sort([{column: 1, ascending: true}, {column: 2, ascending: true}]);
  }

  Logger.log(`Escaneo completado: ${ultimaFila - 1} planillas encontradas.`);
}

function generarResumenDesdePlanillas() {
  const ID_RESUMEN = '1XnlFsWWsv0Aua2jSqoZ_HpUYiQmBrN7ncKtuKuuDQD4';
  const resumen = SpreadsheetApp.openById(ID_RESUMEN);
  const hojaPlanillas = resumen.getSheetByName('Planillas');
  const hojaDatos = resumen.getSheetByName('Datos') || resumen.insertSheet('Datos');
  const hojaAux = resumen.getSheetByName('Aux');
  hojaDatos.clearContents();
  hojaDatos.clearFormats();
  hojaDatos.appendRow(['Carpeta', 'Archivo', 'Tarea', 'Estado', 'Fecha', 'Usuario']);

  const tareas = hojaAux
    .getRange('A2:A13')
    .getValues()
    .flat()
    .filter(t => t);

  const planillas = hojaPlanillas.getRange(2, 1, hojaPlanillas.getLastRow() - 1, 2).getValues();

  const filas = [];

  for (const [carpeta, archivo] of planillas) {
    tareas.forEach(tarea => {
      filas.push([carpeta, archivo, tarea, '', '', '']);
    });
  }
  filas.sort((a, b) => {
  if (a[0] === b[0]) {
    if (a[1] === b[1]) {
      return a[2].localeCompare(b[2]); // Tarea
      }
      return a[1].localeCompare(b[1]);   // Archivo
    }
    return a[0].localeCompare(b[0]);     // Carpeta
    });

  hojaDatos.getRange(2, 1, filas.length, 6).setValues(filas);
  hojaDatos.getRange(2, 4, filas.length).insertCheckboxes(); // Checkboxes en Estado
  hojaDatos.autoResizeColumns(1, 6);

  //Oculto hoja "Datos" y  "Aux"
  hojaDatos.hideSheet();
  hojaAux.hideSheet();
}


function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Tareas')
    .addItem('Escanear carpeta', 'escanearPlanillasEnDrive')
    .addToUi();
}

/** arma un JSON para ser consumido desde pagina externa */
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaPlanillas = ss.getSheetByName('Planillas');
  if (!hojaPlanillas) {
    return ContentService.createTextOutput(JSON.stringify({error: 'No existe hoja Planillas'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const datos = hojaPlanillas.getDataRange().getValues();
  const headers = datos.shift();

  const json = datos.map(fila => {
    return {
      carpeta: fila[0],
      nombre: fila[1],
      id: fila[2],
      link: `https://docs.google.com/spreadsheets/d/${fila[2]}/edit`
    };
  });

  return ContentService
    .createTextOutput(JSON.stringify(json))
    .setMimeType(ContentService.MimeType.JSON);
}
