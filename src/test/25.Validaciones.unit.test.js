import * as chai from 'chai';
import { describe, it } from 'mocha';
import {
  parsePositiveInteger,
  parseIsoDate,
  isValidPrice,
  isEventoFinalizado,
  getEstadoEfectivo,
  withEstadoEfectivo,
} from '../util/validation.js';

const expect = chai.expect;

describe('validation util (unit, no server/DB required)', () => {
  describe('parsePositiveInteger', () => {
    it('accepts positive integers and numeric strings', () => {
      expect(parsePositiveInteger(5)).to.equal(5);
      expect(parsePositiveInteger('12')).to.equal(12);
    });
    it('rejects undefined, "undefined", zero, negatives and garbage', () => {
      for (const v of [undefined, null, 'undefined', '', 0, -1, '1.5', 'abc', NaN]) {
        expect(parsePositiveInteger(v), String(v)).to.equal(null);
      }
    });
  });

  describe('parseIsoDate', () => {
    it('accepts ISO date and datetime strings', () => {
      expect(parseIsoDate('1995-01-01').toISOString()).to.equal('1995-01-01T00:00:00.000Z');
      expect(parseIsoDate('2026-10-06T13:00:00.000Z').toISOString()).to.equal('2026-10-06T13:00:00.000Z');
      expect(parseIsoDate('2026-10-06T10:00:00-03:00').toISOString()).to.equal('2026-10-06T13:00:00.000Z');
    });
    it('rejects ambiguous non-ISO formats (dd/mm/yyyy, mm/dd/yyyy)', () => {
      expect(parseIsoDate('01/02/1995')).to.equal(null);
      expect(parseIsoDate('25/12/1995')).to.equal(null);
      expect(parseIsoDate('12/25/1995')).to.equal(null);
    });
    it('rejects impossible calendar dates and non-strings', () => {
      expect(parseIsoDate('1995-02-31')).to.equal(null);
      expect(parseIsoDate('1995-13-01')).to.equal(null);
      expect(parseIsoDate(undefined)).to.equal(null);
      expect(parseIsoDate(12345)).to.equal(null);
    });
    it('passes Date instances through when valid', () => {
      const d = new Date('2026-01-01T00:00:00Z');
      expect(parseIsoDate(d).getTime()).to.equal(d.getTime());
      expect(parseIsoDate(new Date('nope'))).to.equal(null);
    });
  });

  describe('isValidPrice', () => {
    it('accepts zero and positive numbers (also numeric strings)', () => {
      expect(isValidPrice(0)).to.equal(true);
      expect(isValidPrice(3500)).to.equal(true);
      expect(isValidPrice('99.5')).to.equal(true);
    });
    it('rejects negatives, NaN, empty and non numeric values', () => {
      for (const v of [-5, '-1', NaN, '', null, undefined, 'abc', Infinity]) {
        expect(isValidPrice(v), String(v)).to.equal(false);
      }
    });
  });

  describe('isEventoFinalizado', () => {
    const now = new Date('2026-10-06T12:00:00Z');
    it('is true for Finalizado/Cancelado states', () => {
      expect(isEventoFinalizado({ estado: 'Finalizado' }, now)).to.equal(true);
      expect(isEventoFinalizado({ estado: 'Cancelado' }, now)).to.equal(true);
    });
    it('is true when the end date already passed', () => {
      expect(isEventoFinalizado({ estado: 'EnCurso', fechaHoraFin: '2026-09-18T00:00:00Z' }, now)).to.equal(true);
    });
    it('is false for running or future events', () => {
      expect(isEventoFinalizado({ estado: 'EnCurso', fechaHoraFin: '2026-10-20T00:00:00Z' }, now)).to.equal(false);
      expect(isEventoFinalizado({ estado: 'Confirmado' }, now)).to.equal(false);
    });
    it('last day boundary: an event ending today at 10:00 (AR) is still open during that day', () => {
      const evento = { estado: 'EnCurso', fechaHoraFin: '2026-10-06T13:00:00Z' };
      expect(isEventoFinalizado(evento, new Date('2026-10-06T20:00:00Z'))).to.equal(false);
      expect(isEventoFinalizado(evento, new Date('2026-10-07T02:59:59Z'))).to.equal(false);
      expect(isEventoFinalizado(evento, new Date('2026-10-07T03:00:01Z'))).to.equal(true);
    });
    it('uses the end of the last DiaEvento when days exist', () => {
      const evento = {
        estado: 'EnCurso',
        fechaHoraFin: '2026-10-05T00:00:00Z',
        diaEventos: [
          { fechaHoraFinDiaEvento: '2026-10-05T23:00:00Z' },
          { fechaHoraFinDiaEvento: '2026-10-06T23:00:00Z' },
        ],
      };
      expect(isEventoFinalizado(evento, new Date('2026-10-06T22:00:00Z'))).to.equal(false);
      expect(isEventoFinalizado(evento, new Date('2026-10-06T23:30:00Z'))).to.equal(true);
    });
  });

  describe('ISO strictness', () => {
    it('rejects date-times without Z/offset (timezone-ambiguous)', () => {
      expect(parseIsoDate('2026-10-06T10:00:00')).to.equal(null);
      expect(parseIsoDate('2026-10-06 10:00')).to.equal(null);
    });
  });

  describe('getEstadoEfectivo / withEstadoEfectivo', () => {
    const now = new Date('2026-10-06T12:00:00Z');
    it('shows Finalizado for stale stored states after the last day', () => {
      for (const estado of ['EnCurso', 'Confirmado', 'EnPreparacion']) {
        expect(getEstadoEfectivo({ estado, fechaHoraFin: '2026-09-18T00:00:00Z' }, now), estado).to.equal('Finalizado');
      }
    });
    it('keeps drafts, Cancelado and future events untouched', () => {
      expect(getEstadoEfectivo({ estado: 'EnPreparacion1', fechaHoraFin: '2020-01-01T00:00:00Z' }, now)).to.equal('EnPreparacion1');
      expect(getEstadoEfectivo({ estado: 'Cancelado', fechaHoraFin: '2020-01-01T00:00:00Z' }, now)).to.equal('Cancelado');
      expect(getEstadoEfectivo({ estado: 'EnCurso', fechaHoraFin: '2999-01-01T00:00:00Z' }, now)).to.equal('EnCurso');
    });
    it('uses the last day end as the event end and does not mutate the input', () => {
      const evento = {
        estado: 'EnCurso',
        fechaHoraFin: '2026-09-18T00:00:00Z',
        diaEventos: [{ fechaHoraFinDiaEvento: '2026-08-17T23:00:00Z' }],
      };
      const out = withEstadoEfectivo(evento, now);
      expect(out.fechaHoraFin).to.equal('2026-08-17T23:00:00.000Z');
      expect(out.estado).to.equal('Finalizado');
      expect(evento.estado).to.equal('EnCurso');
    });
  });
});
