import { parsePositiveInteger } from '../util/validation.js';

export class AsignacionError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Moves a Pendiente offer to Aceptado/Rechazado. When consumidorId is given, the offer must belong to that courier.
 * Kept free of model imports so it can be unit tested with stubs.
 */
export const responder = async ({ Asignacion, getConsumidor }, id, nuevoEstado, consumidorId = null) => {
  const asignacionId = parsePositiveInteger(id);
  if (!asignacionId) throw new AsignacionError('Asignación inválida', 400);
  const asignacion = await Asignacion.findByPk(asignacionId);
  if (!asignacion) throw new AsignacionError('La asignación no existe', 404);
  if (consumidorId !== null && consumidorId !== undefined) {
    const consumidor = await getConsumidor(parsePositiveInteger(consumidorId));
    if (!consumidor?.repartidorId || Number(consumidor.repartidorId) !== Number(asignacion.repartidoreId)) {
      throw new AsignacionError('La asignación no corresponde a este repartidor', 403);
    }
  }
  if (asignacion.estado !== 'Pendiente') {
    throw new AsignacionError(`La asignación ya no está disponible (${asignacion.estado})`, 409);
  }
  asignacion.estado = nuevoEstado;
  await asignacion.save();
  return asignacion;
};
