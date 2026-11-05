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

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

/**
 * Business validation for POST /evento. Returns a list of human readable errors (empty when valid).
 * Wizard drafts (EnPreparacion1) are saved after the first step, so dates are only mandatory for non-draft events.
 */
export const validateEventoCreate = (body = {}) => {
  const errors = [];
  if (!hasValue(body.nombre)) errors.push('El nombre del evento es obligatorio');

  const isDraft = body.estado === 'EnPreparacion1';
  const inicio = hasValue(body.fechaHoraInicioEvento) ? parseIsoDate(body.fechaHoraInicioEvento) : null;
  const fin = hasValue(body.fechaHoraFinEvento) ? parseIsoDate(body.fechaHoraFinEvento) : null;
  if (!isDraft) {
    if (!inicio) errors.push('La fecha de inicio del evento es obligatoria');
    if (!fin) errors.push('La fecha de fin del evento es obligatoria');
  }
  if (inicio && fin && fin.getTime() <= inicio.getTime()) {
    errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
  }

  for (const field of ['capacidadMaxima', 'cantidadRepartidores', 'cantidadPuestos']) {
    if (hasValue(body[field])) {
      const num = Number(body[field]);
      if (!Number.isInteger(num) || num < 0) errors.push(`${field} debe ser un entero mayor o igual a 0`);
    }
  }

  const dias = Array.isArray(body.diasEvento) ? body.diasEvento : [];
  dias.forEach((dia, index) => {
    const diaInicio = parseIsoDate(dia?.horaInicio);
    const diaFin = parseIsoDate(dia?.horaFin);
    if (!diaInicio || !diaFin) errors.push(`El día ${index + 1} necesita horario de inicio y fin válidos`);
    else if (diaFin.getTime() <= diaInicio.getTime()) errors.push(`El día ${index + 1} debe terminar después de empezar`);
  });

  return errors;
};
