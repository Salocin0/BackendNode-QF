import { reactivarProcesosAutomaticos } from '../util/procesosAutomaticos.js';

/**
 * Middleware que reactiva los procesos automáticos con cualquier petición HTTP
 * Esto asegura que el sistema se active cuando hay actividad en el servidor
 */
export const middlewareReactivarProcesos = (req, res, next) => {
  // Reactivar procesos automáticos si estaban pausados
  reactivarProcesosAutomaticos();
  
  // Continuar con la siguiente función
  next();
};
