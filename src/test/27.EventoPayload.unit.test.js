import * as chai from 'chai';
import { describe, it } from 'mocha';
import { normalizeEventoPayload, EventoPayloadError, resolveEstadoOnUpdate } from '../util/eventoPayload.js';

const expect = chai.expect;

describe('normalizeEventoPayload (unit, no server/DB required)', () => {
  it('maps UI aliases to model columns (tieneRepartidores -> conRepartidor, tieneButacas -> conButaca)', () => {
    const out = normalizeEventoPayload({ tieneRepartidores: true, tieneButacas: false });
    expect(out.conRepartidor).to.equal(true);
    expect(out.conButaca).to.equal(false);
  });

  it('keeps explicit model columns over aliases', () => {
    const out = normalizeEventoPayload({ conRepartidor: false, tieneRepartidores: true });
    expect(out.conRepartidor).to.equal(false);
  });

  it('stores tipoEvento/tipoPago as text even when legacy clients send numeric codes', () => {
    expect(normalizeEventoPayload({ tipoEvento: '2', tipoPago: 2 })).to.include({ tipoEvento: 'Festival', tipoPago: 'Gratuito' });
    expect(normalizeEventoPayload({ tipoEvento: 'Música', tipoPago: 'Efectivo' })).to.include({ tipoEvento: 'Música', tipoPago: 'Efectivo' });
  });

  it('maps fechaInicio/fechaFin (ISO) to Date columns', () => {
    const out = normalizeEventoPayload({ fechaInicio: '2026-10-20T13:00:00.000Z', fechaFin: '2026-10-21T01:00:00.000Z' });
    expect(out.fechaHoraInicio.toISOString()).to.equal('2026-10-20T13:00:00.000Z');
    expect(out.fechaHoraFin.toISOString()).to.equal('2026-10-21T01:00:00.000Z');
  });

  it('rejects non-ISO dates instead of guessing day/month order', () => {
    expect(() => normalizeEventoPayload({ fechaInicio: '20/10/2026' })).to.throw(EventoPayloadError, /fechaInicio/);
    expect(() => normalizeEventoPayload({ fechaFin: '10/20/2026' })).to.throw(EventoPayloadError, /fechaFin/);
  });

  it('only returns the keys that were provided', () => {
    expect(normalizeEventoPayload({ nombre: 'X' })).to.deep.equal({ nombre: 'X' });
  });

  it('keeps capacidadMaxima / cantidadRepartidores as integers', () => {
    const out = normalizeEventoPayload({ capacidadMaxima: '500', cantidadRepartidores: 3 });
    expect(out.capacidadMaxima).to.equal(500);
    expect(out.cantidadRepartidores).to.equal(3);
    expect(() => normalizeEventoPayload({ capacidadMaxima: '-1' })).to.throw(EventoPayloadError, /capacidadMaxima/);
  });
});

describe('resolveEstadoOnUpdate (unit)', () => {
  it('advances a draft from EnPreparacion1 to EnPreparacion2', () => {
    expect(resolveEstadoOnUpdate('EnPreparacion1', undefined)).to.equal('EnPreparacion2');
    expect(resolveEstadoOnUpdate('EnPreparacion1', 'EnPreparacion1')).to.equal('EnPreparacion2');
  });
  it('lets drafts take another requested draft state', () => {
    expect(resolveEstadoOnUpdate('EnPreparacion2', 'EnPreparacion3')).to.equal('EnPreparacion3');
    expect(resolveEstadoOnUpdate('EnPreparacion2', undefined)).to.equal('EnPreparacion2');
  });
  it('never downgrades completed or confirmed events', () => {
    expect(resolveEstadoOnUpdate('EnPreparacion', 'EnPreparacion1')).to.equal('EnPreparacion');
    expect(resolveEstadoOnUpdate('Confirmado', 'EnPreparacion1')).to.equal('Confirmado');
    expect(resolveEstadoOnUpdate('EnCurso', 'EnPreparacion2')).to.equal('EnCurso');
  });
});
