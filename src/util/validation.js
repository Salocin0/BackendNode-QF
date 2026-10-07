// Small, dependency-free validation helpers shared by controllers and services.

const ISO_DATE_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:?\d{2}))?$/;

/**
 * Returns a positive integer from a number or numeric string, or null when the
 * value is missing, "undefined", zero, negative or not an integer.
 */
export const parsePositiveInteger = (value) => {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  if (!/^\d+$/.test(str)) return null;
  const num = Number(str);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
};

/**
 * Parses ISO-8601 dates only (YYYY-MM-DD or YYYY-MM-DDTHH:mm[:ss[.sss]][Z|+hh:mm]).
 * Ambiguous formats such as dd/mm/yyyy or mm/dd/yyyy are rejected on purpose, because
 * `new Date()` silently swaps day and month for them.
 * Returns a Date or null.
 */
export const parseIsoDate = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value !== 'string') return null;
  const str = value.trim();
  const match = ISO_DATE_REGEX.exec(str);
  if (!match) return null;

  const [, year, month, day] = match;
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  // Reject impossible calendar dates (e.g. 1995-02-31) that Date would roll over.
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) {
    return null;
  }

  const date = new Date(str.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
};

/** A price is valid when it is a finite number >= 0 (numeric strings accepted). */
export const isValidPrice = (value) => {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value !== 'number' && typeof value !== 'string') return false;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
};

const toTime = (value) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

// Argentina has no DST: local time is always UTC-3.
const AR_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Last millisecond of the (Argentina) calendar day that contains the given instant. */
const endOfLocalDay = (time) => {
  const local = time - AR_OFFSET_MS;
  return Math.floor(local / DAY_MS) * DAY_MS + DAY_MS - 1 + AR_OFFSET_MS;
};

/**
 * Effective end of an event: the end of its last DiaEvento when days exist, otherwise the end of
 * the day of fechaHoraFin (a date without a meaningful time must not close the event at 00:00).
 * Returns epoch ms or null when the event has no usable end date.
 */
export const getEventoEndTime = (evento) => {
  const dias = evento?.diaEventos || evento?.diaEvento || evento?.dias || [];
  const diaEnds = (Array.isArray(dias) ? dias : [])
    .map((dia) => toTime(dia?.fechaHoraFinDiaEvento))
    .filter((time) => time !== null);
  if (diaEnds.length > 0) return Math.max(...diaEnds);
  const fin = toTime(evento?.fechaHoraFin);
  return fin === null ? null : endOfLocalDay(fin);
};

/** True when the event is Finalizado/Cancelado or its effective end already passed. */
export const isEventoFinalizado = (evento, now = new Date()) => {
  if (!evento) return false;
  if (evento.estado === 'Finalizado' || evento.estado === 'Cancelado') return true;
  const end = getEventoEndTime(evento);
  return end !== null && end < now.getTime();
};

// Stored states that stop being true once the last day of the event is over.
const STALE_WHEN_FINISHED = ['EnPreparacion', 'Confirmado', 'EnCurso', 'Pausado'];

/**
 * State to show/offer for an event: events past their last day are "Finalizado" even if the stored
 * state lags behind. Drafts (EnPreparacion1/2/3) and Cancelado keep their stored state.
 */
export const getEstadoEfectivo = (evento, now = new Date()) => {
  if (!evento) return undefined;
  if (STALE_WHEN_FINISHED.includes(evento.estado) && isEventoFinalizado(evento, now)) return 'Finalizado';
  return evento.estado;
};

/** Plain copy of the event (JSON-friendly) with the effective state. DB rows are never modified. */
export const withEstadoEfectivo = (evento, now = new Date()) => {
  const plain = typeof evento?.toJSON === 'function' ? evento.toJSON() : { ...evento };
  const result = { ...plain, estado: getEstadoEfectivo(plain, now) };
  // The event ends with its last day: keeps lists and detail views consistent with the day table.
  const dias = Array.isArray(plain.diaEventos) ? plain.diaEventos : [];
  const diaEnds = dias.map((dia) => toTime(dia?.fechaHoraFinDiaEvento)).filter((time) => time !== null);
  if (diaEnds.length > 0) result.fechaHoraFin = new Date(Math.max(...diaEnds)).toISOString();
  return result;
};
