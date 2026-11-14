// Benchmark interno descriptivo para el informe de FoodyAnalyst.
// Todo lo que el LLM califica como "bueno/malo" tiene que salir de acá o de benchmarksExternos.

export const MIN_UNIDADES_REFERENCIA = 5;
export const MIN_MUESTRA = 30;
const P_FAVORABLE = 75;
const P_DESFAVORABLE = 25;

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
const redondear = (v, d = 2) => (v === null || !Number.isFinite(v) ? null : Math.round(v * 10 ** d) / 10 ** d);

export const cuantil = (valores, q) => {
  const xs = valores.filter(Number.isFinite).sort((a, b) => a - b);
  if (!xs.length) return null;
  const pos = (xs.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return xs[lo] + (xs[hi] - xs[lo]) * (pos - lo);
};

// Rango percentil con empates a mitad (mid-rank): % de la referencia por debajo del valor.
export const percentilDe = (valor, referencia) => {
  const xs = referencia.filter(Number.isFinite);
  if (!xs.length || !Number.isFinite(valor)) return null;
  const menores = xs.filter((x) => x < valor).length;
  const iguales = xs.filter((x) => x === valor).length;
  return Math.round(((menores + iguales / 2) / xs.length) * 100);
};

export const lecturaPercentil = (percentil, menorEsMejor = false) => {
  if (percentil === null) return 'sin base comparativa';
  const p = menorEsMejor ? 100 - percentil : percentil;
  if (p >= P_FAVORABLE) return 'favorable (cuartil superior de la referencia)';
  if (p <= P_DESFAVORABLE) return 'desfavorable (cuartil inferior de la referencia)';
  return 'dentro del rango habitual (entre P25 y P75)';
};

// Agrega filas puesto-evento en un único valor comparable (promedios ponderados por su muestra).
export const agregarUnidades = (filas) => {
  let pedidos = 0;
  let recaudado = 0;
  let valoraciones = 0;
  let sumaValoracion = 0;
  let entregas = 0;
  let sumaEntrega = 0;
  const puestos = new Set();
  const unidades = new Set();
  let capacidad = null;
  for (const f of filas) {
    const ped = num(f.pedidos) || 0;
    pedidos += ped;
    recaudado += num(f.recaudado) || 0;
    const nv = num(f.valoraciones) || 0;
    if (nv && num(f.valoracion) !== null) {
      valoraciones += nv;
      sumaValoracion += num(f.valoracion) * nv;
    }
    const ne = num(f.entregas) || 0;
    if (ne && num(f.entrega) !== null) {
      entregas += ne;
      sumaEntrega += num(f.entrega) * ne;
    }
    puestos.add(f.puestoId);
    unidades.add(`${f.eventoId}-${f.puestoId}`);
    if (num(f.capacidadMaxima)) capacidad = num(f.capacidadMaxima);
  }
  return {
    pedidos,
    recaudado,
    valoraciones,
    entregas,
    puestos: puestos.size,
    ticketPromedio: pedidos ? recaudado / pedidos : null,
    valoracion: valoraciones ? sumaValoracion / valoraciones : null,
    entrega: entregas ? sumaEntrega / entregas : null,
    pedidosPorPuesto: unidades.size ? pedidos / unidades.size : null,
    recaudadoPorPuesto: unidades.size ? recaudado / unidades.size : null,
    recaudadoPorPlaza: capacidad ? recaudado / capacidad : null,
  };
};

export const METRICAS = {
  ticketPromedio: { nombre: 'Ticket promedio por pedido ($)', menorEsMejor: false },
  valoracion: { nombre: 'Valoración promedio (1 a 5)', menorEsMejor: false },
  entrega: { nombre: 'Tiempo promedio de entrega (min)', menorEsMejor: true },
  pedidosPorPuesto: { nombre: 'Pedidos por puesto por evento', menorEsMejor: false },
  recaudadoPorPuesto: { nombre: 'Recaudación por puesto por evento ($)', menorEsMejor: false },
  recaudadoPorPlaza: { nombre: 'Recaudación por plaza de capacidad ($)', menorEsMejor: false },
};

export const compararContra = (actual, unidadesReferencia, claves) => {
  const metricas = [];
  for (const clave of claves) {
    const valor = actual[clave];
    if (valor === null || valor === undefined) continue;
    const ref = unidadesReferencia.map((u) => u[clave]).filter(Number.isFinite);
    const suficiente = ref.length >= MIN_UNIDADES_REFERENCIA;
    const percentil = suficiente ? percentilDe(valor, ref) : null;
    metricas.push({
      clave,
      metrica: METRICAS[clave].nombre,
      menorEsMejor: METRICAS[clave].menorEsMejor,
      valor: redondear(valor),
      referenciaMediana: redondear(cuantil(ref, 0.5)),
      referenciaP25: suficiente ? redondear(cuantil(ref, 0.25)) : null,
      referenciaP75: suficiente ? redondear(cuantil(ref, 0.75)) : null,
      referenciaMin: ref.length ? redondear(Math.min(...ref)) : null,
      referenciaMax: ref.length ? redondear(Math.max(...ref)) : null,
      unidadesComparadas: ref.length,
      percentil,
      lectura: suficiente ? lecturaPercentil(percentil, METRICAS[clave].menorEsMejor) : `sin base comparativa suficiente (n=${ref.length} < ${MIN_UNIDADES_REFERENCIA})`,
    });
  }
  return metricas;
};

const agruparPor = (filas, clave) => {
  const grupos = new Map();
  for (const f of filas) {
    const k = f[clave];
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(f);
  }
  return [...grupos.values()];
};

// Si hay suficientes unidades del mismo tipo de evento, se compara solo contra ellas.
const referenciaPorTipo = (unidades, tipoEvento, descripcion) => {
  const mismoTipo = tipoEvento ? unidades.filter((u) => u.tipoEvento === tipoEvento) : [];
  if (mismoTipo.length >= MIN_UNIDADES_REFERENCIA) {
    return { unidades: mismoTipo, descripcion: `${descripcion} del mismo tipo de evento (${tipoEvento})` };
  }
  return { unidades, descripcion };
};

const unidadPuesto = (filas) => ({ ...agregarUnidades(filas), tipoEvento: filas[0]?.tipoEvento });

/**
 * filas: una fila por (evento, puesto) con pedidos, recaudado, entrega, entregas, valoracion,
 *        valoraciones, encargadoId, tipoEvento, capacidadMaxima, eventoId, puestoId.
 */
export const construirContextoComparativo = ({ tipo, filas, idEvento, idPuesto, idEncargado }) => {
  const esTodos = (v) => v === undefined || v === null || v === 'Todos';
  const mismo = (a, b) => String(a) === String(b);
  const enAlcance = (f) =>
    (esTodos(idEvento) || mismo(f.eventoId, idEvento)) &&
    (esTodos(idPuesto) || mismo(f.puestoId, idPuesto)) &&
    (tipo !== 'encargado' || mismo(f.encargadoId, idEncargado));

  const alcance = filas.filter(enAlcance);
  const fuera = filas.filter((f) => !enAlcance(f));
  const actual = agregarUnidades(alcance);
  const tipoEvento = alcance[0]?.tipoEvento;
  const comparaciones = [];
  const advertencias = [];

  if (!alcance.length) {
    advertencias.push('No hay pedidos entregados en el alcance seleccionado; no es posible comparar.');
    return { alcance: actual, comparaciones, advertencias, concentracion: null };
  }

  if (tipo === 'encargado') {
    const clavesPuesto = ['ticketPromedio', 'valoracion', 'entrega', 'pedidosPorPuesto'];
    if (!esTodos(idEvento)) {
      const otrosDelEvento = fuera.filter((f) => mismo(f.eventoId, idEvento)).map((f) => unidadPuesto([f]));
      comparaciones.push({
        referencia: 'Otros puestos del mismo evento',
        unidades: otrosDelEvento.length,
        metricas: compararContra(actual, otrosDelEvento, clavesPuesto),
      });
    }
    const historico = fuera.filter((f) => esTodos(idEvento) || !mismo(f.eventoId, idEvento)).map((f) => unidadPuesto([f]));
    const ref = referenciaPorTipo(historico, tipoEvento, 'Puestos de otros eventos de QuickFood');
    comparaciones.push({
      referencia: ref.descripcion,
      unidades: ref.unidades.length,
      metricas: compararContra(actual, ref.unidades, clavesPuesto),
    });
  } else if (!esTodos(idEvento)) {
    const otrosEventos = agruparPor(fuera, 'eventoId').map((g) => ({ ...agregarUnidades(g), tipoEvento: g[0].tipoEvento }));
    const ref = referenciaPorTipo(otrosEventos, tipoEvento, 'Otros eventos de QuickFood');
    comparaciones.push({
      referencia: ref.descripcion,
      unidades: ref.unidades.length,
      metricas: compararContra(actual, ref.unidades, [
        'ticketPromedio',
        'valoracion',
        'entrega',
        'recaudadoPorPuesto',
        'recaudadoPorPlaza',
      ]),
    });
  } else {
    advertencias.push('Con "Todos los eventos" no hay un grupo de referencia externo al alcance; seleccioná un evento para obtener comparaciones.');
  }

  let concentracion = null;
  const porPuesto = agruparPor(alcance, 'puestoId').map((g) => agregarUnidades(g).recaudado).sort((a, b) => b - a);
  if (porPuesto.length > 1 && actual.recaudado > 0) {
    const media = actual.recaudado / porPuesto.length;
    const desvio = Math.sqrt(porPuesto.reduce((s, x) => s + (x - media) ** 2, 0) / (porPuesto.length - 1));
    concentracion = {
      puestos: porPuesto.length,
      participacionPuestoLider: `${redondear((porPuesto[0] / actual.recaudado) * 100, 1)}%`,
      participacionEquitativa: `${redondear(100 / porPuesto.length, 1)}%`,
      coeficienteVariacionRecaudacion: `${redondear((desvio / media) * 100, 1)}%`,
    };
  }

  if (actual.pedidos < MIN_MUESTRA) advertencias.push(`Muestra chica: ${actual.pedidos} pedidos entregados (< ${MIN_MUESTRA}).`);
  if (actual.valoraciones < MIN_MUESTRA) {
    advertencias.push(`Valoración basada en ${actual.valoraciones} calificaciones (< ${MIN_MUESTRA}); interpretar con cautela.`);
  }

  return {
    alcance: {
      pedidosEntregados: actual.pedidos,
      calificaciones: actual.valoraciones,
      entregasConTiempoMedido: actual.entregas,
      puestos: actual.puestos,
    },
    comparaciones,
    concentracion,
    advertencias,
  };
};

export const construirMetodologia = ({ contexto, distribucionEntrega, benchmarksExternos, fechaCorte }) => {
  const lineas = [
    `Datos: pedidos en estado Entregado o Valorado registrados en QuickFood hasta el ${fechaCorte}. Alcance analizado: ${contexto.alcance.pedidosEntregados ?? 0} pedidos, ${contexto.alcance.calificaciones ?? 0} calificaciones.`,
  ];
  if (distribucionEntrega?.n) {
    lineas.push(
      `Tiempo de entrega del alcance (n=${distribucionEntrega.n}): mediana ${redondear(num(distribucionEntrega.mediana), 1)} min, P90 ${redondear(num(distribucionEntrega.p90), 1)} min.`
    );
  }
  for (const c of contexto.comparaciones) {
    lineas.push(`Comparación interna: ${c.referencia} (n=${c.unidades} unidades).`);
  }
  if (contexto.comparaciones.length) {
    lineas.push(
      `Criterio: percentil del valor dentro de la referencia. Favorable >= P${P_FAVORABLE}, desfavorable <= P${P_DESFAVORABLE} (en tiempo de entrega, menor es mejor). Con menos de ${MIN_UNIDADES_REFERENCIA} unidades no se califica.`
    );
  }
  if (benchmarksExternos.length) {
    for (const b of benchmarksExternos) {
      lineas.push(`Referencia externa: ${b.fuente}, "${b.titulo}" (${b.anio}, ${b.region}). ${b.url}`);
    }
  } else {
    lineas.push('Referencias externas: no hay benchmarks externos cargados; no se afirman comparaciones con el sector.');
  }
  lineas.push(
    'Limitaciones: estadística descriptiva, no implica causalidad. La redacción la realiza un modelo de lenguaje (FoodyAnalyst) restringido a estos datos.'
  );
  return lineas;
};
