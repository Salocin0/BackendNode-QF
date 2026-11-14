import * as chai from 'chai';
import { describe, it, before, after } from 'mocha';
import {
  cuantil,
  percentilDe,
  lecturaPercentil,
  agregarUnidades,
  construirContextoComparativo,
  construirMetodologia,
  MIN_UNIDADES_REFERENCIA,
} from '../util/benchmarkEstadistico.js';

const expect = chai.expect;
process.env.DB_FORCE_SQLITE = 'true';

const fila = (eventoId, puestoId, extra = {}) => ({
  eventoId,
  puestoId,
  encargadoId: 7,
  tipoEvento: 'Recital',
  capacidadMaxima: 1000,
  pedidos: 100,
  recaudado: 100000,
  entrega: 20,
  entregas: 100,
  valoracion: 4,
  valoraciones: 50,
  ...extra,
});

describe('benchmarkEstadistico (benchmark interno del informe FoodyAnalyst)', () => {
  it('cuantil interpola linealmente y percentilDe usa mid-rank', () => {
    expect(cuantil([1, 2, 3, 4], 0.5)).to.equal(2.5);
    expect(cuantil([], 0.5)).to.equal(null);
    expect(percentilDe(3, [1, 2, 3, 4])).to.equal(63);
    expect(percentilDe(10, [1, 2, 3, 4])).to.equal(100);
    expect(percentilDe(5, [])).to.equal(null);
  });

  it('lecturaPercentil invierte la escala cuando menor es mejor', () => {
    expect(lecturaPercentil(90)).to.match(/^favorable/);
    expect(lecturaPercentil(90, true)).to.match(/^desfavorable/);
    expect(lecturaPercentil(50)).to.match(/rango habitual/);
    expect(lecturaPercentil(null)).to.equal('sin base comparativa');
  });

  it('agregarUnidades pondera valoración y entrega por su muestra', () => {
    const a = agregarUnidades([
      fila(1, 1, { valoracion: 5, valoraciones: 30, entrega: 10, entregas: 10 }),
      fila(1, 2, { valoracion: 3, valoraciones: 10, entrega: 30, entregas: 30 }),
    ]);
    expect(a.valoracion).to.equal(4.5);
    expect(a.entrega).to.equal(25);
    expect(a.ticketPromedio).to.equal(1000);
    expect(a.pedidosPorPuesto).to.equal(100);
  });

  it('encargado: compara contra otros puestos del evento y contra el histórico del mismo tipo de evento', () => {
    const filas = [
      fila(1, 1, { recaudado: 200000, entrega: 10 }),
      ...[2, 3, 4, 5, 6].map((p) => fila(1, p, { encargadoId: 99 })),
      ...[7, 8, 9, 10, 11].map((p) => fila(2, p, { encargadoId: 99 })),
    ];
    const ctx = construirContextoComparativo({ tipo: 'encargado', filas, idEvento: 1, idPuesto: 1, idEncargado: 7 });
    expect(ctx.comparaciones.map((c) => c.referencia)).to.deep.equal([
      'Otros puestos del mismo evento',
      'Puestos de otros eventos de QuickFood del mismo tipo de evento (Recital)',
    ]);
    const ticket = ctx.comparaciones[0].metricas.find((m) => m.metrica.startsWith('Ticket'));
    expect(ticket).to.include({ valor: 2000, percentil: 100, unidadesComparadas: 5 });
    expect(ticket.lectura).to.match(/^favorable/);
    const entrega = ctx.comparaciones[0].metricas.find((m) => m.metrica.startsWith('Tiempo'));
    expect(entrega.lectura).to.match(/^favorable/);
    expect(JSON.stringify(ctx)).to.not.match(/"(eventoId|puestoId|encargadoId)"/);
  });

  it('no califica cuando la referencia tiene menos unidades que el mínimo', () => {
    const filas = [fila(1, 1), fila(1, 2, { encargadoId: 99 })];
    const ctx = construirContextoComparativo({ tipo: 'encargado', filas, idEvento: 1, idPuesto: 1, idEncargado: 7 });
    const m = ctx.comparaciones[0].metricas[0];
    expect(m.percentil).to.equal(null);
    expect(m.lectura).to.contain(`< ${MIN_UNIDADES_REFERENCIA}`);
  });

  it('productor: compara el evento contra otros eventos y mide la concentración entre puestos', () => {
    const filas = [
      fila(1, 1, { recaudado: 300000 }),
      fila(1, 2, { recaudado: 100000 }),
      ...[2, 3, 4, 5, 6].map((e) => fila(e, 10 + e)),
    ];
    const ctx = construirContextoComparativo({ tipo: 'productor', filas, idEvento: 1 });
    expect(ctx.comparaciones[0].unidades).to.equal(5);
    expect(ctx.concentracion.participacionPuestoLider).to.equal('75%');
    expect(ctx.alcance.pedidosEntregados).to.equal(200);
  });

  it('advierte muestras chicas y la ausencia de referencia con "Todos los eventos"', () => {
    const ctx = construirContextoComparativo({
      tipo: 'productor',
      filas: [fila(1, 1, { pedidos: 10, valoraciones: 3 })],
      idEvento: 'Todos',
    });
    expect(ctx.comparaciones).to.have.length(0);
    expect(ctx.advertencias.join(' ')).to.contain('Muestra chica').and.contain('3 calificaciones');
  });

  it('construirMetodologia declara que no hay benchmarks externos cuando no se cargaron', () => {
    const ctx = construirContextoComparativo({ tipo: 'productor', filas: [fila(1, 1)], idEvento: 1 });
    const lineas = construirMetodologia({ contexto: ctx, distribucionEntrega: { n: 4, mediana: 12, p90: 30 }, benchmarksExternos: [], fechaCorte: '14/11/2026' });
    expect(lineas.join('\n')).to.contain('no se afirman comparaciones con el sector').and.contain('mediana 12 min, P90 30 min');
  });
});

describe('estadisticas.service consultas del benchmark (sequelize.query stubbeado)', () => {
  let estadisticasService;
  let sequelize;
  let originalQuery;
  let calls;

  before(async function () {
    this.timeout(120000);
    ({ sequelize } = await import('../util/connections.js'));
    ({ estadisticasService } = await import('../services/estadisticas.service.js'));
    originalQuery = sequelize.query;
    calls = [];
    sequelize.query = async (sql, options) => {
      calls.push({ sql, options });
      return [{ nombre: 'Cuartetazo Villa María 2026', n: 0 }];
    };
  });

  after(() => {
    sequelize.query = originalQuery;
  });

  it('getNombreFiltro devuelve el nombre real y no consulta para "Todos"', async () => {
    expect(await estadisticasService.getNombreFiltro('eventos', 'nombre', 1, 'Todos los eventos')).to.equal(
      'Cuartetazo Villa María 2026'
    );
    calls.length = 0;
    expect(await estadisticasService.getNombreFiltro('eventos', 'nombre', 'Todos', 'Todos los eventos')).to.equal(
      'Todos los eventos'
    );
    expect(calls).to.have.length(0);
  });

  it('getDistribucionEntrega filtra por evento, puesto y encargado solo cuando corresponde', async () => {
    calls.length = 0;
    await estadisticasService.getDistribucionEntrega({ idEvento: 1, idPuesto: 'Todos', idEncargado: 7 });
    const { sql, options } = calls[0];
    expect(sql).to.contain('"eventoId" = :idEvento').and.contain('"encargadoId" = :idEncargado');
    expect(sql).to.not.contain(':idPuesto');
    expect(sql).to.contain("estado IN ('Entregado', 'Valorado')");
    expect(options.replacements).to.deep.equal({ idEvento: 1, idEncargado: 7 });
  });

  it('getUnidadesComparables agrupa por evento y puesto y une valoraciones por pedido', async () => {
    calls.length = 0;
    await estadisticasService.getUnidadesComparables();
    const sql = calls[0].sql.replace(/\s+/g, ' ');
    expect(sql).to.contain('GROUP BY p."eventoId", p."puestoId"');
    expect(sql).to.contain('JOIN public."Pedidos" p ON p.id = v."pedidoId"');
  });

  it('envía al modelo las instrucciones de concentración y el contexto correspondiente', async () => {
    const { LLMChain } = await import('langchain/chains');
    const nombres = ['getNombreFiltro', 'getTotalRecaudadoEvento', 'getPromedioValoracionPuesto',
      'getTotalRecaudadoPorPuestoEnEvento', 'getUnidadesComparables', 'getDistribucionEntrega'];
    const originales = Object.fromEntries(nombres.map((nombre) => [nombre, estadisticasService[nombre]]));
    const callOriginal = LLMChain.prototype.call;
    let prompt;
    let contexto;
    let filas = [fila(1, 1)];

    try {
      estadisticasService.getNombreFiltro = async () => 'Evento';
      estadisticasService.getTotalRecaudadoEvento = async () => 100000;
      estadisticasService.getPromedioValoracionPuesto = async () => 4;
      estadisticasService.getTotalRecaudadoPorPuestoEnEvento = async () => [];
      estadisticasService.getUnidadesComparables = async () => filas;
      estadisticasService.getDistribucionEntrega = async () => ({ n: 0 });
      LLMChain.prototype.call = async function (variables) {
        prompt = await this.prompt.format(variables);
        contexto = JSON.parse(variables.contexto);
        return { text: 'Informe de prueba' };
      };

      await estadisticasService.getAnalisisLLM('productor', 1, 1, 'Todos');
      expect(contexto.alcance.puestos).to.equal(1);
      expect(contexto.concentracion).to.equal(null);
      expect(prompt).to.include('no hay otros puestos en el alcance para comparar');
      expect(prompt).to.include('No calcules ni estimes concentración por tu cuenta');
      expect(prompt).to.include('Si no está disponible por falta de datos, recaudación o por un error');

      filas = [fila(1, 1), fila(1, 2)];
      await estadisticasService.getAnalisisLLM('productor', 1, 1, 'Todos');
      expect(contexto.concentracion.puestos).to.equal(2);

      filas = [];
      await estadisticasService.getAnalisisLLM('productor', 1, 1, 'Todos');
      expect(contexto.concentracion).to.equal(null);
      expect(contexto.advertencias.join(' ')).to.include('No hay pedidos entregados');
    } finally {
      for (const nombre of nombres) estadisticasService[nombre] = originales[nombre];
      LLMChain.prototype.call = callOriginal;
    }
  });
});
