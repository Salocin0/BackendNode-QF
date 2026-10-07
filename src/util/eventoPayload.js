import { parseIsoDate } from './validation.js';

export class EventoPayloadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EventoPayloadError';
  }
}

// Legacy clients sent the numeric option code instead of the label.
const TIPO_EVENTO_LABELS = { 1: 'Cines', 2: 'Festival', 3: 'Deporte' };
const TIPO_PAGO_LABELS = { 1: 'Pago', 2: 'Gratuito' };

const toLabel = (value, labels) => {
  if (value === null || value === undefined) return value;
  const key = String(value).trim();
  return labels[key] ?? value;
};

const toDate = (field, value) => {
  const date = parseIsoDate(value);
  if (!date) {
    throw new EventoPayloadError(`${field} debe ser una fecha ISO válida (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ)`);
  }
  return date;
};

const toNonNegativeInt = (field, value) => {
  const num = Number(value);
  if (value === '' || value === null || !Number.isInteger(num) || num < 0) {
    throw new EventoPayloadError(`${field} debe ser un entero mayor o igual a 0`);
  }
  return num;
};

/**
 * Translates the payload sent by the event creation wizard into Evento model columns.
 * Only keys present in the input are returned, so it is safe for partial updates.
 * Throws EventoPayloadError for invalid dates/numbers.
 */
export const normalizeEventoPayload = (input = {}) => {
  const out = { ...input };

  if (out.conRepartidor === undefined && out.tieneRepartidores !== undefined) {
    out.conRepartidor = out.tieneRepartidores;
  }
  delete out.tieneRepartidores;

  if (out.conButaca === undefined && out.tieneButacas !== undefined) {
    out.conButaca = out.tieneButacas;
  }
  delete out.tieneButacas;

  if (out.tipoEvento !== undefined) out.tipoEvento = toLabel(out.tipoEvento, TIPO_EVENTO_LABELS);
  if (out.tipoPago !== undefined) out.tipoPago = toLabel(out.tipoPago, TIPO_PAGO_LABELS);

  if (out.fechaInicio !== undefined) {
    out.fechaHoraInicio = toDate('fechaInicio', out.fechaInicio);
    delete out.fechaInicio;
  }
  if (out.fechaFin !== undefined) {
    out.fechaHoraFin = toDate('fechaFin', out.fechaFin);
    delete out.fechaFin;
  }

  if (out.capacidadMaxima !== undefined) out.capacidadMaxima = toNonNegativeInt('capacidadMaxima', out.capacidadMaxima);
  if (out.cantidadRepartidores !== undefined) {
    out.cantidadRepartidores = toNonNegativeInt('cantidadRepartidores', out.cantidadRepartidores);
  }

  return out;
};

export const DRAFT_ESTADOS = ['EnPreparacion1', 'EnPreparacion2', 'EnPreparacion3'];

/**
 * Decides the event state after a wizard update. Only drafts (EnPreparacion1/2/3) may take the
 * requested state, and a draft in EnPreparacion1 advances to EnPreparacion2. Completed events
 * ("EnPreparacion"), Confirmado, EnCurso, etc. keep their state: an update must never downgrade them.
 */
export const resolveEstadoOnUpdate = (currentEstado, requestedEstado) => {
  if (!DRAFT_ESTADOS.includes(currentEstado)) return currentEstado;
  const next = requestedEstado !== undefined ? requestedEstado : currentEstado;
  return next === 'EnPreparacion1' ? 'EnPreparacion2' : next;
};
