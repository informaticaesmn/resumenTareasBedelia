/** local/cadaPlanilla.js
 * contiene las funciones específicas para cada planilla de bedelía.
 * Estas funciones interactúan con la biblioteca FBedelia para gestionar
 * la confirmación de tareas y la sincronización con la planilla central "Resumen".
 */
/* Id FBedelia1 = "1ayl9-wOaO2XMo63J3LbZgLO0WlNiG68frZSd-0IGeCwtIRqho2ac-SKr" */
function onOpen(){
  FBedelia1.crearMenuTareas();
}


/** Funciones necesarias para armar la funcion de cada tarea */
function menuDispatcherFila2() { FBedelia1.menuDispatcher("menuDispatcherFila2"); }
function menuDispatcherFila3() { FBedelia1.menuDispatcher("menuDispatcherFila3"); }
function menuDispatcherFila4() { FBedelia1.menuDispatcher("menuDispatcherFila4"); }
function menuDispatcherFila5() { FBedelia1.menuDispatcher("menuDispatcherFila5"); }
function menuDispatcherFila6() { FBedelia1.menuDispatcher("menuDispatcherFila6"); }
function menuDispatcherFila7() { FBedelia1.menuDispatcher("menuDispatcherFila7"); }
function menuDispatcherFila8() { FBedelia1.menuDispatcher("menuDispatcherFila8"); }
function menuDispatcherFila9() { FBedelia1.menuDispatcher("menuDispatcherFila9"); }
function menuDispatcherFila10() { FBedelia1.menuDispatcher("menuDispatcherFila10"); }
function menuDispatcherFila11() { FBedelia1.menuDispatcher("menuDispatcherFila11"); }
function menuDispatcherFila12() { FBedelia1.menuDispatcher("menuDispatcherFila12"); }
function menuDispatcherFila13() { FBedelia1.menuDispatcher("menuDispatcherFila13"); }


function enLetras(n) {
  const letras = ["Ausente", "Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez"];
  return (n >= 0 && n <= 10) ? letras[n] : "";
}
