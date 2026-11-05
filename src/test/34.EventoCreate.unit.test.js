import * as chai from 'chai';
import { describe, it } from 'mocha';
import { validateEventoCreate, resolveEstadoOnUpdate } from '../util/eventoPayload.js';

const expect = chai.expect;

const valid = (overrides = {}) => ({
  nombre: 'Fiesta de Prueba',
  estado: 'EnPreparacion',
  fechaHoraInicioEvento: '2026-11-20T21:00:00.000Z',
  fechaHoraFinEvento: '2026-11-22T02:00:00.000Z',
  capacidadMaxima: 200,
  cantidadRepartidores: 2,
  diasEvento: [
    { dia: 1, horaInicio: '2026-11-20T21:00:00.000Z', horaFin: '2026-11-21T03:00:00.000Z' },
    { dia: 2, horaInicio: '2026-11-21T15:00:00.000Z', horaFin: '2026-11-22T02:00:00.000Z' },
  ],
  ...overrides,
});

describe('validateEventoCreate', () => {
  it('accepts a complete event', () => {
    expect(validateEventoCreate(valid())).to.deep.equal([]);
  });

  it('accepts a wizard draft that only has the first step (no dates yet)', () => {
    expect(validateEventoCreate({ nombre: 'Borrador', estado: 'EnPreparacion1' })).to.deep.equal([]);
  });

  it('requires a non-blank name, even for drafts', () => {
    for (const nombre of [undefined, null, '', '   ']) {
      expect(validateEventoCreate(valid({ nombre }))).to.include('El nombre del evento es obligatorio');
      expect(validateEventoCreate({ nombre, estado: 'EnPreparacion1' })).to.include('El nombre del evento es obligatorio');
    }
  });

  it('requires start and end dates for non-draft events', () => {
    const errors = validateEventoCreate(valid({ fechaHoraInicioEvento: undefined, fechaHoraFinEvento: '' }));
    expect(errors).to.include('La fecha de inicio del evento es obligatoria');
    expect(errors).to.include('La fecha de fin del evento es obligatoria');
  });

  it('rejects an end that is not after the start', () => {
    const msg = 'La fecha de fin debe ser posterior a la fecha de inicio';
    expect(validateEventoCreate(valid({ fechaHoraFinEvento: '2026-11-20T21:00:00.000Z' }))).to.include(msg);
    expect(validateEventoCreate(valid({ fechaHoraFinEvento: '2026-11-19T21:00:00.000Z' }))).to.include(msg);
    expect(validateEventoCreate({ nombre: 'X', estado: 'EnPreparacion1', fechaHoraInicioEvento: '2026-11-20', fechaHoraFinEvento: '2026-11-19' })).to.include(msg);
  });

  it('rejects ambiguous date formats as missing', () => {
    expect(validateEventoCreate(valid({ fechaHoraInicioEvento: '20/11/2026' }))).to.include('La fecha de inicio del evento es obligatoria');
  });

  it('rejects negative, fractional or non numeric capacities', () => {
    for (const field of ['capacidadMaxima', 'cantidadRepartidores', 'cantidadPuestos']) {
      for (const bad of [-1, 1.5, 'abc']) {
        expect(validateEventoCreate(valid({ [field]: bad }))).to.include(`${field} debe ser un entero mayor o igual a 0`);
      }
    }
    expect(validateEventoCreate(valid({ capacidadMaxima: '0', cantidadPuestos: undefined }))).to.deep.equal([]);
  });

  it('validates every event day', () => {
    const bad = valid({ diasEvento: [{ dia: 1, horaInicio: 'x', horaFin: 'y' }, { dia: 2, horaInicio: '2026-11-21T10:00:00Z', horaFin: '2026-11-21T09:00:00Z' }] });
    const errors = validateEventoCreate(bad);
    expect(errors).to.include('El día 1 necesita horario de inicio y fin válidos');
    expect(errors).to.include('El día 2 debe terminar después de empezar');
  });

  it('tolerates a missing body and non array days', () => {
    expect(validateEventoCreate()).to.include('El nombre del evento es obligatorio');
    expect(validateEventoCreate(valid({ diasEvento: 'nope' }))).to.deep.equal([]);
  });
});

describe('wizard state progression (event creation flow)', () => {
  it('a new draft moves EnPreparacion1 -> EnPreparacion2 on the next step and never goes back', () => {
    expect(resolveEstadoOnUpdate('EnPreparacion1', undefined)).to.equal('EnPreparacion2');
    expect(resolveEstadoOnUpdate('EnPreparacion2', 'EnPreparacion1')).to.equal('EnPreparacion2');
    expect(resolveEstadoOnUpdate('EnPreparacion', 'EnPreparacion1')).to.equal('EnPreparacion');
  });
});
