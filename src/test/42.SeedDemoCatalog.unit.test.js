import { expect } from 'chai';
import { EVENTOS_ACTIVOS, PERSONAS_DATOS } from '../util/seedDemoCatalog.js';
import { repartidoresAsociados } from '../util/seedDemoData.js';

const seSuperponen = (a, b) => a.diaInicio <= b.diaFin && b.diaInicio <= a.diaFin;

describe('Catálogo del seed de demo', () => {
  it('no repite un puesto en dos eventos que ocurren al mismo tiempo', () => {
    for (let i = 0; i < EVENTOS_ACTIVOS.length; i++) {
      for (let j = i + 1; j < EVENTOS_ACTIVOS.length; j++) {
        const a = EVENTOS_ACTIVOS[i];
        const b = EVENTOS_ACTIVOS[j];
        if (!seSuperponen(a, b)) continue;
        const compartidos = a.puestos.filter((p) => b.puestos.includes(p));
        expect(compartidos, `${a.nombre} y ${b.nombre}`).to.deep.equal([]);
      }
    }
  });

  it('mantiene en el evento principal los puestos de los pedidos en curso', () => {
    expect(EVENTOS_ACTIVOS[0].puestos).to.include.members(['don-choripan', 'fuego-lento-parrilla', 'la-birra-barra']);
  });

  it('define un repartidor y un consumidor de datos distintos de los demo', () => {
    expect(PERSONAS_DATOS.repartidor).to.have.all.keys('nombre', 'apellido');
    expect(PERSONAS_DATOS.consumidor).to.have.all.keys('nombre', 'apellido');
  });
});

describe('Repartidores asociados a cada evento del seed', () => {
  const demo = { id: 1 };
  const datos = { id: 2 };
  const extras = [{ id: 3 }, { id: 4 }];

  it('en eventos habilitados para pedir asocia solo al repartidor demo', () => {
    expect(repartidoresAsociados('demo', { demo, datos, extras })).to.deep.equal([demo]);
  });

  it('en eventos finalizados asocia al demo, al de datos y a los extra', () => {
    expect(repartidoresAsociados('extra', { demo, datos, extras })).to.deep.equal([demo, datos, ...extras]);
  });
});
