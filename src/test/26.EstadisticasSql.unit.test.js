import * as chai from 'chai';
import { describe, it, before, beforeEach, after } from 'mocha';

const expect = chai.expect;

// Never touch a real database from unit tests, whatever the local .env says.
process.env.DB_FORCE_SQLITE = 'true';

describe('estadisticas.service SQL (stubbed sequelize.query, no DB required)', () => {
  let estadisticasService;
  let sequelize;
  let consumidorService;
  let originalQuery;
  let originalGetOne;
  let calls;
  let nextResult;

  before(async function () {
    this.timeout(120000); // langchain/models make the first import slow
    ({ sequelize } = await import('../util/connections.js'));
    ({ estadisticasService } = await import('../services/estadisticas.service.js'));
    ({ consumidorService } = await import('../services/consumidor.service.js'));
    originalQuery = sequelize.query;
    originalGetOne = consumidorService.getOne;
  });

  beforeEach(() => {
    calls = [];
    nextResult = [{ totalrecaudado: 100 }];
    sequelize.query = async (sql, options) => {
      calls.push({ sql, options });
      return nextResult;
    };
    consumidorService.getOne = async () => ({ id: 1, encargadoId: 7 });
  });

  after(() => {
    sequelize.query = originalQuery;
    consumidorService.getOne = originalGetOne;
  });

  const normalized = (sql) => sql.replace(/\s+/g, ' ');

  it('getTotalRecaudadoEvento (specific event) filters by event AND collected states, grouped correctly', async () => {
    const total = await estadisticasService.getTotalRecaudadoEvento(10);
    const { sql, options } = calls[0];
    expect(normalized(sql)).to.contain(`"eventoId" = :eventoId AND estado IN ('Entregado', 'Valorado')`);
    expect(sql).to.not.match(/estado\s*=\s*'Entregado'\s+or/i);
    expect(options.replacements).to.deep.equal({ eventoId: 10 });
    expect(total).to.equal(100);
  });

  it("getTotalRecaudadoEvento('Todos') has no event filter but keeps the collected-state filter", async () => {
    await estadisticasService.getTotalRecaudadoEvento('Todos');
    expect(normalized(calls[0].sql)).to.contain(`WHERE estado IN ('Entregado', 'Valorado')`);
    expect(calls[0].sql).to.not.contain('"eventoId" = :eventoId');
  });

  it('getTotalRecaudadoPorPuestoEvento (specific event) applies the event filter to every sub-query', async () => {
    nextResult = [];
    await estadisticasService.getTotalRecaudadoPorPuestoEnEvento(10);
    const sql = normalized(calls[0].sql);
    const filters = sql.match(/"eventoId" = :eventoId AND estado IN \('Entregado', 'Valorado'\)/g) || [];
    expect(filters).to.have.length(2);
    expect(calls[0].options.replacements.eventoId).to.equal(10);
  });

  it('getTotalRecaudadoPuestoEvento only sums Entregado/Valorado for every Todos/specific combination', async () => {
    const combos = [
      ['Todos', 'Todos', {}],
      ['Todos', 5, { idEvento: 5 }],
      [3, 'Todos', { idPuesto: 3 }],
      [3, 5, { idPuesto: 3, idEvento: 5 }],
    ];
    for (const [idPuesto, idEvento, extra] of combos) {
      calls.length = 0;
      await estadisticasService.getTotalRecaudadoPuestoEvento(1, idPuesto, idEvento);
      const { sql, options } = calls[0];
      expect(normalized(sql), `${idPuesto}/${idEvento}`).to.contain(`estado IN ('Entregado', 'Valorado')`);
      expect(options.replacements).to.deep.equal({ idEncargado: 7, ...extra });
    }
  });

  it('getEstadisticasRepartidor counts Valorado as delivered', async () => {
    consumidorService.getOne = async () => ({ repartidorId: 4 });
    nextResult = [{ eventos_participados: 1, pedidos_entregados: 60 }];
    const result = await estadisticasService.getEstadisticasRepartidor(1);
    expect(normalized(calls[0].sql)).to.contain(`estado IN ('Entregado', 'Valorado')`);
    expect(calls[0].options.replacements).to.deep.equal({ repartidorid: 4 });
    expect(result.pedidos_entregados).to.equal(60);
  });
});
