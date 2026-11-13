import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './connections.js';
import '../DAO/models/asignacion.model.js';
import '../DAO/models/asociacion.model.js';
import '../DAO/models/carrito.model.js';
import '../DAO/models/consumidor.model.js';
import '../DAO/models/detallePedido.model.js';
import '../DAO/models/diaEvento.model.js';
import '../DAO/models/encargado.model.js';
import '../DAO/models/evento.model.js';
import '../DAO/models/itemCarrito.js';
import '../DAO/models/notificaciones.model.js';
import '../DAO/models/pedido.model.js';
import '../DAO/models/producto.model.js';
import '../DAO/models/Productor.model.js';
import '../DAO/models/puesto.model.js';
import '../DAO/models/puntoEncuentro.model.js';
import '../DAO/models/repartidor.model.js';
import '../DAO/models/Restriccion.model.js';
import '../DAO/models/RTARestriccion.model.js';
import '../DAO/models/users.model.js';
import '../DAO/models/valoracionCarrito.model.js';
import '../DAO/models/valoracionRepartidor.model.js';
import { Usuario } from '../DAO/models/users.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Productor } from '../DAO/models/Productor.model.js';
import { Encargado } from '../DAO/models/encargado.model.js';
import { Repartidor } from '../DAO/models/repartidor.model.js';
import { Evento } from '../DAO/models/evento.model.js';
import { DiaEvento } from '../DAO/models/diaEvento.model.js';
import { PuntoEncuentro } from '../DAO/models/puntoEncuentro.model.js';
import { Puesto } from '../DAO/models/puesto.model.js';
import { Producto } from '../DAO/models/producto.model.js';
import { Asociacion } from '../DAO/models/asociacion.model.js';
import { Pedido } from '../DAO/models/pedido.model.js';
import { DetallePedido } from '../DAO/models/detallePedido.model.js';
import { Asignacion } from '../DAO/models/asignacion.model.js';
import { ValoracionPuesto } from '../DAO/models/valoracionCarrito.model.js';
import { ValoracionRepartidor } from '../DAO/models/valoracionRepartidor.model.js';
import { createHashPW } from './bcrypt.js';
import { EstadosAsociaciones, EstadosPedido } from '../enums/Estados.enums.js';
import {
  slug, NOMBRES, APELLIDOS, PERSONAS_DEMO, PERSONAS_DATOS, ENCARGADOS_EXTRA, REPARTIDORES_EXTRA, PUESTOS, EVENTOS_ACTIVOS,
  EVENTOS_POR_ESTADO, OPINIONES_GENERICAS, OPINIONES_REPARTIDOR, crearRng, intensidad, placeholderSvg,
} from './seedDemoCatalog.js';
import { COMISION_SERVICIO } from '../controllers/pedidoCreate.handler.js';

// Repartidores associated to a seeded event. Events that accept orders only get
// the demo Repartidor, so every order placed during the demo reaches that user;
// finished events also get the data Repartidor and the extras.
export const repartidoresAsociados = (tipo, { demo, datos, extras }) =>
  tipo === 'demo' ? [demo] : [demo, datos, ...extras];

// Historical deliveries go to the data Repartidor (and the extras on finished
// events), never to the demo Repartidor, so the demo user starts clean.
const repartidoresHistorial = (tipo, { datos, extras }) => (tipo === 'demo' ? [datos] : [datos, ...extras]);

const conComision = (subtotal) => Math.round(subtotal * (1 + COMISION_SERVICIO) * 100) / 100;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const MIME_BY_EXT = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

// Lee una imagen de src/public/images/<baseName>.<jpg|jpeg|png|webp> y la
// devuelve como data URI base64 (formato que espera el frontend en los
// campos img/banner). Si no existe devuelve '' y el caller usa un placeholder.
function loadImageAsDataUri(baseName, { silent = false } = {}) {
  for (const ext of Object.keys(MIME_BY_EXT)) {
    const filePath = path.join(IMAGES_DIR, baseName + ext);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return `data:${MIME_BY_EXT[ext]};base64,${buffer.toString('base64')}`;
    }
  }
  if (!silent) console.warn(`⚠️  No se encontró imagen "${baseName}" en ${IMAGES_DIR}.`);
  return '';
}

// Ejecuta el seed de datos de demo completo: vacía todas las tablas y siembra
// 4 usuarios por rol (más encargados, repartidores y consumidores con nombres
// reales), 10 puestos con su carta, eventos vivos y finalizados con miles de
// pedidos históricos (olas de compra por hora y por día, valoraciones), pedidos
// en curso en cada estado y eventos en todos los estados posibles.
// Los datos viven en seedDemoCatalog.js.
//
// A propósito NO hace sequelize.authenticate(), sequelize.close() ni
// process.exit(): esta función corre dentro del mismo proceso Node que el
// resto de la app Express (server 24/7) y también desde el script CLI
// standalone, así que la conexión y el ciclo de vida del proceso son
// responsabilidad de cada caller, no de esta función.
export async function runSeedDemo() {
  console.log('🔄 Sincronizando esquema (sin destruir datos existentes)...');
  await sequelize.sync();
  console.log('✅ Esquema sincronizado\n');

  // Paso 0: asegurar que exista la función de asignación de repartidores.
  // Solo se crea al correr Datos_DB.sql (npm run seed) — si esta base nunca
  // corrió ese script, procesosAutomaticos.js falla en silencio al llamarla
  // (catch que devuelve -2) y ningún pedido "En Camino" le llega a un
  // repartidor. CREATE OR REPLACE es idempotente, seguro de repetir siempre.
  const dialect = sequelize.getDialect ? sequelize.getDialect() : (sequelize.options && sequelize.options.dialect) || 'postgres';
  if (dialect === 'postgres') {
    console.log('🔄 Asegurando función seleccionar_repartidor_por_evento...');
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION seleccionar_repartidor_por_evento(evento_id INTEGER, pedido_id INTEGER)
      RETURNS INTEGER AS $$
      DECLARE
          repartidor_seleccionado INTEGER;
          total_asignaciones_pendientes INTEGER;
          total_repartidores_sin_estrellas INTEGER;
          total_asignaciones INTEGER;
      BEGIN
          -- 1. Verificar si todos los repartidores asociados al evento están libres y no tienen entregas pendientes
          SELECT COUNT(*) INTO total_asignaciones_pendientes
          FROM "Asignacions" a
          JOIN "Asociacions" asi ON a."repartidoreId" = asi."repartidoreId"
          WHERE a.estado = 'Pendiente'
            AND asi."eventoId" = evento_id
            AND a."PedidoId" != pedido_id;

          IF total_asignaciones_pendientes = 0 THEN
              SELECT r.id INTO repartidor_seleccionado
              FROM "repartidores" r
              JOIN "Asociacions" asi ON r.id = asi."repartidoreId"
              WHERE asi."eventoId" = evento_id
                AND r.id NOT IN (
                    SELECT a."repartidoreId"
                    FROM "Asignacions" a
                    WHERE a."PedidoId" = pedido_id
                )
              ORDER BY RANDOM()
              LIMIT 1;

              IF FOUND THEN
                  RETURN repartidor_seleccionado;
              ELSE
                  RETURN -1;
              END IF;
          END IF;

          -- 2. Caso 1: Repartidores sin estrellas y sin pedidos asociados al evento
          SELECT COUNT(*) INTO total_repartidores_sin_estrellas
          FROM "repartidores" r
          JOIN "Asociacions" asi ON r.id = asi."repartidoreId"
          LEFT JOIN "valoracionRepartidors" vr ON r.id = vr."repartidorId"
          WHERE vr."repartidorId" IS NULL
            AND asi."eventoId" = evento_id
            AND r.id NOT IN (
                SELECT a."repartidoreId"
                FROM "Asignacions" a
                WHERE a."PedidoId" = pedido_id
            );

          SELECT COUNT(*) INTO total_asignaciones
          FROM "Asignacions" a
          JOIN "Asociacions" asi ON a."repartidoreId" = asi."repartidoreId"
          WHERE asi."eventoId" = evento_id
            AND a."PedidoId" != pedido_id;

          IF total_repartidores_sin_estrellas > 0 AND total_asignaciones = 0 THEN
              SELECT r.id INTO repartidor_seleccionado
              FROM "repartidores" r
              JOIN "Asociacions" asi ON r.id = asi."repartidoreId"
              WHERE NOT EXISTS (
                  SELECT 1
                  FROM "valoracionRepartidors" vr
                  WHERE r.id = vr."repartidorId"
              )
              AND asi."eventoId" = evento_id
              AND r.id NOT IN (
                  SELECT a."repartidoreId"
                  FROM "Asignacions" a
                  WHERE a."PedidoId" = pedido_id
              )
              ORDER BY RANDOM()
              LIMIT 1;

              IF FOUND THEN
                  RETURN repartidor_seleccionado;
              ELSE
                  RETURN -1;
              END IF;
          END IF;

          -- 3. Caso 2: Repartidores con estrellas y otros sin, asociados al evento
          SELECT r.id INTO repartidor_seleccionado
          FROM "repartidores" r
          JOIN "Asociacions" asi ON r.id = asi."repartidoreId"
          WHERE NOT EXISTS (
              SELECT 1
              FROM "valoracionRepartidors" vr
              WHERE r.id = vr."repartidorId"
          )
          AND asi."eventoId" = evento_id
          AND r.id NOT IN (
              SELECT a."repartidoreId"
              FROM "Asignacions" a
              WHERE a."PedidoId" = pedido_id
          )
          ORDER BY (
              SELECT COUNT(*)
              FROM "Asignacions" a2
              WHERE a2."repartidoreId" = r.id AND a2."PedidoId" = pedido_id
          )
          LIMIT 1;

          IF FOUND THEN
              RETURN repartidor_seleccionado;
          ELSE
              RETURN -1;
          END IF;

          -- 4. Caso 3: Todos los repartidores con estrellas, asociados al evento
          SELECT r.id INTO repartidor_seleccionado
          FROM "repartidores" r
          JOIN "Asociacions" asi ON r.id = asi."repartidoreId"
          JOIN "valoracionRepartidors" vr ON r.id = vr."repartidorId"
          WHERE asi."eventoId" = evento_id
          AND r.id NOT IN (
              SELECT a."repartidoreId"
              FROM "Asignacions" a
              WHERE a."PedidoId" = pedido_id
          )
          ORDER BY vr.puntuacion DESC
          LIMIT 1;

          IF FOUND THEN
              RETURN repartidor_seleccionado;
          ELSE
              RETURN -1;
          END IF;

          -- 5. Caso 4: Mismo puntaje, asociados al evento
          SELECT r.id INTO repartidor_seleccionado
          FROM (
              SELECT r.id, AVG(vr.puntuacion) / COUNT(*) as ratio
              FROM "repartidores" r
              JOIN "Asociacions" asi ON r.id = asi."repartidoreId"
              JOIN "valoracionRepartidors" vr ON r.id = vr."repartidorId"
              WHERE asi."eventoId" = evento_id
              AND r.id NOT IN (
                  SELECT a."repartidoreId"
                  FROM "Asignacions" a
                  WHERE a."PedidoId" = pedido_id
              )
              GROUP BY r.id
              HAVING COUNT(*) > 0
          ) t
          WHERE ratio = (
              SELECT MAX(ratio)
              FROM (
                  SELECT AVG(vr.puntuacion) / COUNT(*) as ratio
                  FROM "repartidores" r
                  JOIN "Asociacions" asi ON r.id = asi."repartidoreId"
                  JOIN "valoracionRepartidors" vr ON r.id = vr."repartidorId"
                  WHERE asi."eventoId" = evento_id
                  AND r.id NOT IN (
                      SELECT a."repartidoreId"
                      FROM "Asignacions" a
                      WHERE a."PedidoId" = pedido_id
                  )
                  GROUP BY r.id
              ) sub
          )
          ORDER BY RANDOM()
          LIMIT 1;

          IF FOUND THEN
              RETURN repartidor_seleccionado;
          ELSE
              RETURN -1;
          END IF;

      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Función seleccionar_repartidor_por_evento asegurada\n');
  }

  // Paso 1: vaciar la base
  console.log('🔄 Vaciando tablas existentes...');
  try {
    for (const model of Object.values(sequelize.models)) {
      await model.truncate({ cascade: true, restartIdentity: true });
    }
    console.log('✅ Tablas vaciadas\n');
  } catch (error) {
    console.error('❌ Error al vaciar las tablas:', error);
    throw error;
  }

  const rng = crearRng();
  const hashed = createHashPW('123123123');
  const ahora = new Date();

  // Fechas en hora de Argentina (ART, UTC-3) aunque el proceso corra en UTC
  // (Railway): "base" es la medianoche ART de hoy, y artDate(d, h) devuelve el
  // instante de la hora h (decimal, puede pasar de 24) del día hoy+d.
  const ART_MS = 3 * 3600 * 1000;
  const DIA_MS = 86400000;
  const hoyArt = new Date(ahora.getTime() - ART_MS);
  const baseArt = Date.UTC(hoyArt.getUTCFullYear(), hoyArt.getUTCMonth(), hoyArt.getUTCDate());
  const artDate = (offsetDias, hora) => new Date(baseArt + offsetDias * DIA_MS + hora * 3600000 + ART_MS);
  const diaSemanaArt = (offsetDias) => new Date(baseArt + offsetDias * DIA_MS).getUTCDay();

  // Cada día de evento va de las 10:00 a las 03:00 ART del día siguiente. Los
  // pedidos hechos en vivo durante la demo caen dentro de esa ventana y entran
  // en las estadísticas por día y por hora.
  const HORA_INICIO_DIA = 10;
  const HORA_FIN_DIA = 27;

  const imagenesCache = new Map();
  const imagen = (imgKey, texto, ancho, alto) => {
    const clave = `${imgKey}|${texto}`;
    if (!imagenesCache.has(clave)) {
      imagenesCache.set(clave, loadImageAsDataUri(imgKey, { silent: true }) || placeholderSvg(texto, ancho, alto));
    }
    return imagenesCache.get(clave);
  };

  const bulk = async (model, filas, tamano = 500) => {
    const creadas = [];
    for (let i = 0; i < filas.length; i += tamano) {
      creadas.push(...(await model.bulkCreate(filas.slice(i, i + tamano), { returning: true })));
    }
    return creadas;
  };

  // Paso 2: personas. Un usuario por rol con credenciales fijas, más
  // encargados, repartidores y consumidores con nombres reales.
  console.log('🔄 Creando usuarios...');
  let contadorDni = 30111220;
  let contadorTel = 3535410000;
  const crearPersona = async ({ nombre, apellido, tipoUsuario, usuario, email, nacimiento, vinculo = {} }) => {
    const consumidor = await Consumidor.create({
      nombre,
      apellido,
      fechaNacimiento: nacimiento,
      dni: ++contadorDni,
      localidad: 'Villa María',
      provincia: 'Córdoba',
      telefono: ++contadorTel,
      habilitado: true,
      ...vinculo,
    });
    const user = await Usuario.create({
      usuario,
      email,
      emailValidado: true,
      contraseña: hashed,
      fechaAlta: ahora,
      habilitado: true,
      tipoUsuario,
      consumidorId: consumidor.id,
    });
    return { consumidor, user };
  };
  const slugUsuario = (nombre, apellido) => `${slug(nombre)}.${slug(apellido)}`;

  const pd = PERSONAS_DEMO;
  const productor = await Productor.create({ cuit: '20304050601', razonSocial: pd.productor.razonSocial, estaValido: true, habilitado: true, condicionIva: 'Monotributista' });
  const { user: usuarioProductor } = await crearPersona({ ...pd.productor, tipoUsuario: 'productor', usuario: 'Productor', email: 'productor@demo.com', nacimiento: new Date(1985, 2, 14), vinculo: { productorId: productor.id } });

  const crearEncargado = async (persona, usuario, email) => {
    const encargado = await Encargado.create({ cuit: `2030405${String(++contadorDni).slice(-4)}`, razonSocial: persona.razonSocial, estaValido: true, habilitado: true, condicionIva: 'Monotributista' });
    const { user } = await crearPersona({ ...persona, tipoUsuario: 'encargado', usuario, email, nacimiento: new Date(1986, 5, 3), vinculo: { encargadoId: encargado.id } });
    return { encargado, user };
  };
  const { encargado: encargadoDemo, user: usuarioEncargado } = await crearEncargado(pd.encargado, 'Encargado', 'encargado@demo.com');
  const encargadosExtra = [];
  for (const e of ENCARGADOS_EXTRA) {
    encargadosExtra.push((await crearEncargado(e, slugUsuario(e.nombre, e.apellido), `${slugUsuario(e.nombre, e.apellido)}@demo.com`)).encargado);
  }

  const crearRepartidor = async (persona, usuario, email) => {
    const repartidor = await Repartidor.create({ estaValido: true, habilitado: true });
    const { user } = await crearPersona({ ...persona, tipoUsuario: 'repartidor', usuario, email, nacimiento: new Date(1993, 8, 21), vinculo: { repartidorId: repartidor.id } });
    return { repartidor, user };
  };
  const { repartidor: repartidorDemo, user: usuarioRepartidor } = await crearRepartidor(pd.repartidor, 'Repartidor', 'repartidor@demo.com');
  const { repartidor: repartidorDatos, user: usuarioRepartidorDatos } = await crearRepartidor(PERSONAS_DATOS.repartidor, 'RepartidorDatos', 'repartidor.datos@demo.com');
  const repartidoresExtra = [];
  for (const r of REPARTIDORES_EXTRA) {
    repartidoresExtra.push((await crearRepartidor(r, slugUsuario(r.nombre, r.apellido), `${slugUsuario(r.nombre, r.apellido)}@demo.com`)).repartidor);
  }
  const repartidoresSeed = { demo: repartidorDemo, datos: repartidorDatos, extras: repartidoresExtra };

  const { user: usuarioConsumidor } = await crearPersona({ ...pd.consumidor, tipoUsuario: 'consumidor', usuario: 'Consumidor', email: 'consumidor@demo.com', nacimiento: new Date(1995, 0, 18) });
  const { consumidor: consumidorDatos, user: usuarioConsumidorDatos } = await crearPersona({ ...PERSONAS_DATOS.consumidor, tipoUsuario: 'consumidor', usuario: 'ConsumidorDatos', email: 'consumidor.datos@demo.com', nacimiento: new Date(1994, 6, 9) });

  // Consumidores de relleno: se insertan en bloque (son muchos).
  const CANTIDAD_CONSUMIDORES = 48;
  const filasConsumidor = [];
  const datosUsuario = [];
  for (let i = 0; i < CANTIDAD_CONSUMIDORES; i++) {
    const nombre = NOMBRES[i % NOMBRES.length];
    const apellido = APELLIDOS[(i * 7 + 3) % APELLIDOS.length];
    filasConsumidor.push({
      nombre,
      apellido,
      fechaNacimiento: new Date(1980 + (i % 24), i % 12, 1 + (i % 27)),
      dni: ++contadorDni,
      localidad: i % 5 === 0 ? 'Villa Nueva' : 'Villa María',
      provincia: 'Córdoba',
      telefono: ++contadorTel,
      habilitado: true,
    });
    datosUsuario.push(`${slugUsuario(nombre, apellido)}${i + 1}`);
  }
  const consumidoresRelleno = await bulk(Consumidor, filasConsumidor);
  await bulk(
    Usuario,
    consumidoresRelleno.map((c, i) => ({
      usuario: datosUsuario[i],
      email: `${datosUsuario[i]}@demo.com`,
      emailValidado: true,
      contraseña: hashed,
      fechaAlta: ahora,
      habilitado: true,
      tipoUsuario: 'consumidor',
      consumidorId: c.id,
    }))
  );
  // The data Consumidor buys more often than the rest (its history looks rich);
  // the demo Consumidor has no history at all.
  const pesoConsumidor = new Map([[consumidorDatos.id, 4]]);
  consumidoresRelleno.forEach((c, i) => pesoConsumidor.set(c.id, i % 6 === 0 ? 3 : 1));
  const todosConsumidores = [consumidorDatos, ...consumidoresRelleno];
  console.log(`✅ Usuarios creados (4 demo + 2 de datos + ${ENCARGADOS_EXTRA.length} encargados, ${REPARTIDORES_EXTRA.length} repartidores y ${CANTIDAD_CONSUMIDORES} consumidores)\n`);

  // Paso 3: puestos ("carritos") con sus productos
  console.log('🔄 Creando puestos y productos...');
  const puestosPorKey = new Map();
  let numeroCarro = 0;
  for (const def of PUESTOS) {
    const dueño = def.dueño === 'demo' ? encargadoDemo : encargadosExtra[def.dueño];
    const img = imagen(def.imgKey || `puesto-${def.key}`, def.nombre, 1200, 675);
    const puesto = await Puesto.create({
      nombreCarro: def.nombre,
      numeroCarro: ++numeroCarro,
      tipoNegocio: def.tipoNegocio,
      banner: img,
      img,
      telefonoCarro: `3535${String(400000 + numeroCarro * 1731).slice(-6)}`,
      estado: 'Creado',
      encargadoId: dueño.id,
    });
    const productos = await bulk(
      Producto,
      def.productos.map((p) => ({
        nombre: p.nombre,
        descripcion: p.descripcion,
        aderezos: p.aderezos,
        precio: p.precio,
        estado: true,
        img: imagen(p.imgKey || `producto-${slug(p.nombre)}`, p.nombre, 600, 400),
        puestoId: puesto.id,
      }))
    );
    puestosPorKey.set(def.key, {
      def,
      puesto,
      productos: productos.map((prod, i) => ({ prod, peso: def.productos[i].peso })),
    });
  }
  console.log(`✅ ${puestosPorKey.size} puestos creados con su carta\n`);

  // Paso 4: eventos con actividad (vivos y finalizados), con días, puestos,
  // repartidores asociados y punto de encuentro.
  console.log('🔄 Creando eventos con actividad...');
  const crearDias = async (evento, nombreBase, desde, hasta, tienePreventa, bandas = []) => {
    const dias = [];
    for (let d = desde; d <= hasta; d++) {
      const banda = bandas.length ? bandas[(d - desde) % bandas.length] : null;
      dias.push(
        await DiaEvento.create({
          nombre: `${nombreBase} - Día ${d - desde + 1}`,
          descripcion: banda ? `Jornada ${d - desde + 1}. Show central: ${banda}.` : `Jornada ${d - desde + 1} de "${nombreBase}".`,
          fechaHoraInicioDiaEvento: artDate(d, HORA_INICIO_DIA),
          fechaHoraFinDiaEvento: artDate(d, HORA_FIN_DIA - 0.017),
          tienePreventa,
          eventoId: evento.id,
        })
      );
      dias[dias.length - 1].offset = d;
    }
    return dias;
  };
  const crearEvento = async (campos, desde, hasta) => {
    const inicio = artDate(desde, HORA_INICIO_DIA);
    const fin = artDate(hasta, HORA_FIN_DIA - 0.017);
    return Evento.create({
      conButaca: false,
      conRepartidor: true,
      tienePreventa: false,
      linkVentaEntradas: '',
      habilitado: true,
      localidad: 'Villa María',
      provincia: 'Córdoba',
      tipoPago: 'Efectivo',
      ...campos,
      cantidadDiasEvento: String(hasta - desde + 1),
      fechaHoraInicio: inicio,
      fechaHoraFin: fin,
      productorId: productor.id,
    });
  };
  const asociarPuestos = async (evento, keys) => {
    for (const key of keys) {
      await Asociacion.create({ estado: EstadosAsociaciones.Aceptada, eventoId: evento.id, puestoId: puestosPorKey.get(key).puesto.id });
    }
  };
  const asociarRepartidores = async (evento, repartidores) => {
    for (const r of repartidores) {
      await Asociacion.create({ estado: EstadosAsociaciones.Aceptada, eventoId: evento.id, repartidoreId: r.id });
    }
  };
  // procesosAutomaticos usa puntoEncuentroService.getAllInEvent(...)[0] para cerrar
  // la asignación; sin un punto de encuentro el pedido se queda "EnCamino" sin
  // repartidor ni código de entrega.
  const crearPuntoEncuentro = (evento, latitud, longitud) =>
    PuntoEncuentro.create({ nombre: `Entrada principal - ${evento.nombre}`, longitud, latitud, habilitado: true, eventoId: evento.id });

  const activos = [];
  for (const def of EVENTOS_ACTIVOS) {
    const evento = await crearEvento(
      {
        nombre: def.nombre,
        descripcion: def.descripcion,
        tipoEvento: def.tipoEvento,
        tipoPago: def.tipoPago,
        cantidadPuestos: String(def.puestos.length),
        capacidadMaxima: def.pedidosPorDia * 40,
        cantidadRepartidores: repartidoresAsociados(def.repartidores, repartidoresSeed).length,
        ubicacion: def.ubicacion,
        img: imagen(def.imgKey, def.nombre, 1200, 675),
        estado: def.estado,
        longitud: def.longitud,
        latitud: def.latitud,
      },
      def.diaInicio,
      def.diaFin
    );
    const dias = await crearDias(evento, def.nombre, def.diaInicio, def.diaFin, false, def.bandas);
    await asociarPuestos(evento, def.puestos);
    // En los eventos vivos solo está asociado el Repartidor demo: la función de
    // asignación elige al azar entre los asociados al evento, y así el pedido
    // que se haga en la demo siempre le llega a ese usuario.
    await asociarRepartidores(evento, repartidoresAsociados(def.repartidores, repartidoresSeed));
    const punto = await crearPuntoEncuentro(evento, def.latitud, def.longitud);
    activos.push({ def, evento, dias, punto });
  }
  console.log(`✅ ${activos.length} eventos con actividad creados\n`);

  // Paso 5: historial de ventas con olas de compra.
  console.log('🔄 Generando historial de ventas...');
  const pedidosHist = [];
  const meta = [];
  const codigoAleatorio = () => {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let r = '';
    for (let i = 0; i < 6; i++) r += caracteres[rng.int(0, caracteres.length - 1)];
    return r;
  };
  const puntuacion = (media) => Math.max(1, Math.min(5, Math.round(media + rng.gauss() * 0.7)));
  const OPINION_BAJA = ['Demoró más de lo esperado.', 'Llegó tibio.', 'Mucha espera.'];

  for (const { def, evento, dias, punto } of activos) {
    const puestosEvento = def.puestos.map((k) => puestosPorKey.get(k));
    const slots = [];
    for (let h = 12; h < HORA_FIN_DIA - 0.25; h += 0.25) slots.push(h);
    const sumaIntensidad = slots.reduce((s, h) => s + intensidad(def.curva, h), 0);
    const maxIntensidad = Math.max(...slots.map((h) => intensidad(def.curva, h)));
    const repartidoresEvento = repartidoresHistorial(def.repartidores, repartidoresSeed);

    dias.forEach((dia, idx) => {
      const offset = dia.offset;
      if (artDate(offset, 12) > ahora) return; // días futuros: sin ventas
      const dow = diaSemanaArt(offset);
      const factorDia = ([5, 6].includes(dow) ? 1.35 : dow === 0 ? 1.1 : 0.8) * (0.85 + 0.3 * (idx / Math.max(1, dias.length - 1)));
      for (const h of slots) {
        const lambda = (def.pedidosPorDia * factorDia * intensidad(def.curva, h)) / sumaIntensidad;
        const cantidad = rng.poisson(lambda);
        for (let n = 0; n < cantidad; n++) {
          const fecha = new Date(artDate(offset, h).getTime() + rng.int(0, 14 * 60 + 59) * 1000);
          if (fecha > new Date(ahora.getTime() - 2 * 60 * 1000)) continue;

          const { def: defPuesto, puesto, productos } = rng.weighted(puestosEvento, (p) => p.def.popularidad);
          const consumidor = rng.weighted(todosConsumidores, (c) => pesoConsumidor.get(c.id) || 1);
          const cantidadItems = rng.weighted([1, 2, 3, 4], (k) => [0.35, 0.38, 0.2, 0.07][k - 1]);
          const disponibles = [...productos];
          const detalles = [];
          let total = 0;
          for (let k = 0; k < cantidadItems && disponibles.length; k++) {
            const elegido = rng.weighted(disponibles, (p) => p.peso);
            disponibles.splice(disponibles.indexOf(elegido), 1);
            const cant = rng.weighted([1, 2, 3], (v) => [0.6, 0.3, 0.1][v - 1]);
            total += cant * elegido.prod.precio;
            detalles.push({ cantidad: cant, precio: elegido.prod.precio, productoId: elegido.prod.id });
          }

          const r = rng.rnd();
          const estado = r < 0.03 ? EstadosPedido.Cancelado : r < 0.62 ? EstadosPedido.Entregado : EstadosPedido.valorado;
          const conRepartidor = estado !== EstadosPedido.Cancelado && rng.rnd() < (def.repartidores === 'demo' ? 0.28 : 0.55);
          const repartidor = conRepartidor ? rng.pick(repartidoresEvento) : null;
          // Tiempo de entrega: base de cocina + demora por saturación en los picos + traslado.
          const saturacion = intensidad(def.curva, h) / maxIntensidad;
          const minutos = Math.max(6, Math.min(48, Math.round(8 + Math.abs(rng.gauss()) * 3 + saturacion * rng.int(4, 16) + (conRepartidor ? 6 : 0))));

          pedidosHist.push({
            fecha,
            total: conComision(total),
            estado,
            consumidorId: consumidor.id,
            eventoId: evento.id,
            puestoId: puesto.id,
            fechaEntrega: estado === EstadosPedido.Cancelado ? null : new Date(fecha.getTime() + minutos * 60 * 1000),
            codigoEntrega: estado === EstadosPedido.Cancelado ? null : codigoAleatorio(),
            repartidorId: repartidor ? repartidor.id : null,
            puntoEncuentroId: repartidor ? punto.id : null,
          });
          meta.push({ detalles, defPuesto, repartidor, estado });
        }
      }
    });
  }

  const pedidosCreados = await bulk(Pedido, pedidosHist, 400);
  const filasDetalle = [];
  const filasAsignacion = [];
  const filasValPuesto = [];
  const filasValRepartidor = [];
  pedidosCreados.forEach((pedido, i) => {
    const { detalles, defPuesto, repartidor, estado } = meta[i];
    for (const d of detalles) filasDetalle.push({ ...d, PedidoId: pedido.id });
    if (repartidor) filasAsignacion.push({ estado: 'Aceptado', repartidoreId: repartidor.id, PedidoId: pedido.id });
    if (estado === EstadosPedido.valorado) {
      const nota = puntuacion(defPuesto.rating);
      filasValPuesto.push({
        puntuacion: nota,
        opinion: nota <= 3 ? rng.pick(OPINION_BAJA) : rng.pick([...defPuesto.opiniones, ...OPINIONES_GENERICAS]),
        puestoId: pedido.puestoId,
        pedidoId: pedido.id,
      });
      if (repartidor) {
        const notaRep = puntuacion(4.6);
        filasValRepartidor.push({
          puntuacion: notaRep,
          opinion: notaRep <= 3 ? rng.pick(OPINION_BAJA) : rng.pick(OPINIONES_REPARTIDOR),
          repartidorId: repartidor.id,
          pedidoId: pedido.id,
        });
      }
    }
  });
  await bulk(DetallePedido, filasDetalle, 1000);
  await bulk(Asignacion, filasAsignacion, 1000);
  await bulk(ValoracionPuesto, filasValPuesto, 1000);
  await bulk(ValoracionRepartidor, filasValRepartidor, 1000);
  const entregadosPorRepartidorDatos = pedidosHist.filter((p) => p.repartidorId === repartidorDatos.id).length;
  console.log(`✅ Historial: ${pedidosCreados.length} pedidos, ${filasDetalle.length} ítems, ${filasValPuesto.length} valoraciones de puesto\n`);

  // Paso 6: pedidos "en curso" en el evento principal, uno por cada estado del
  // flujo, para que el Encargado y el Repartidor vean actividad al entrar.
  console.log('🔄 Creando pedidos en curso...');
  const principal = activos[0];
  const minutosAtras = (min) => new Date(ahora.getTime() - min * 60 * 1000);
  const crearPedidoEnCurso = async ({ estado, keyPuesto, consumidor, minutos, items }) => {
    const { puesto, productos } = puestosPorKey.get(keyPuesto);
    const lineas = items.map(([idx, cant]) => ({ cantidad: cant, precio: productos[idx].prod.precio, productoId: productos[idx].prod.id }));
    const pedido = await Pedido.create({
      fecha: minutosAtras(minutos),
      total: conComision(lineas.reduce((s, l) => s + l.cantidad * l.precio, 0)),
      estado,
      consumidorId: consumidor.id,
      eventoId: principal.evento.id,
      puestoId: puesto.id,
    });
    for (const l of lineas) await DetallePedido.create({ ...l, PedidoId: pedido.id });
    return pedido;
  };
  const sinDemo = consumidoresRelleno;
  await crearPedidoEnCurso({ estado: EstadosPedido.Pendiente, keyPuesto: 'fuego-lento-parrilla', consumidor: sinDemo[1], minutos: 1, items: [[0, 1], [2, 1]] });
  await crearPedidoEnCurso({ estado: EstadosPedido.Aceptado, keyPuesto: 'don-choripan', consumidor: sinDemo[8], minutos: 6, items: [[0, 2], [4, 2]] });
  await crearPedidoEnCurso({ estado: EstadosPedido.EnPreparacion, keyPuesto: 'la-birra-barra', consumidor: sinDemo[15], minutos: 11, items: [[0, 2], [1, 1]] });
  await crearPedidoEnCurso({ estado: EstadosPedido.Listo, keyPuesto: 'don-choripan', consumidor: sinDemo[22], minutos: 16, items: [[1, 1], [3, 1], [4, 1]] });
  const pedidoEnCamino = await crearPedidoEnCurso({ estado: EstadosPedido.EnCamino, keyPuesto: 'fuego-lento-parrilla', consumidor: consumidorDatos, minutos: 22, items: [[1, 1], [2, 1], [4, 2]] });
  await Asignacion.create({ estado: 'Aceptado', repartidoreId: repartidorDemo.id, PedidoId: pedidoEnCamino.id });
  // Se setean repartidorId/puntoEncuentroId/codigoEntrega directo: en la app real
  // los pone procesosAutomaticos.js, pero solo mira asignaciones recientes con
  // repartidorId NULL.
  await pedidoEnCamino.update({ repartidorId: repartidorDemo.id, puntoEncuentroId: principal.punto.id, codigoEntrega: 'CUARTE' });
  console.log('✅ Pedidos en curso creados\n');

  // Paso 7: eventos para probar filtros por estado y por preventa.
  console.log('🔄 Creando eventos por estado y preventa...');
  const eventosPorEstado = [];
  let semana = 3;
  for (const def of EVENTOS_POR_ESTADO) {
    const desde = semana * 7;
    semana += 1;
    const evento = await crearEvento(
      {
        nombre: def.nombre,
        descripcion: def.descripcion,
        tipoEvento: def.tipoEvento,
        cantidadPuestos: '1',
        tienePreventa: def.conPreventa,
        fechaInicioPreventa: def.conPreventa ? ahora : null,
        linkVentaEntradas: def.conPreventa ? 'https://entradas.demo/qf' : '',
        ubicacion: 'Villa María, Córdoba',
        img: imagen(def.imgKey, def.nombre, 1200, 675),
        estado: def.estado,
        longitud: '-63.2304',
        latitud: '-32.4076',
      },
      desde,
      desde + 1
    );
    await crearDias(evento, def.nombre, desde, desde + 1, def.conPreventa);
    if (def.conPuestos) {
      await asociarPuestos(evento, ['don-choripan', 'fuego-lento-parrilla', 'la-birra-barra']);
      await asociarRepartidores(evento, [repartidorDemo]);
      await crearPuntoEncuentro(evento, '-32.4076', '-63.2304');
    }
    eventosPorEstado.push({ id: evento.id, nombre: evento.nombre, estado: def.estado, tienePreventa: def.conPreventa });
  }
  console.log(`✅ ${eventosPorEstado.length} eventos por estado creados\n`);

  // Paso 8: resumen final
  const resumenActivos = activos.map(({ def, evento, dias }) => ({
    id: evento.id,
    nombre: evento.nombre,
    estado: def.estado,
    dias: dias.length,
    puestos: def.puestos.length,
  }));
  console.log('========================================');
  console.log('🎉 SEED DE DEMO COMPLETADO 🎉');
  console.log('========================================\n');
  console.log('👤 Credenciales de login (password para las 4: 123123123)');
  console.log(`   - Productor  -> usuario: Productor   | email: ${usuarioProductor.email}`);
  console.log(`   - Encargado  -> usuario: Encargado   | email: ${usuarioEncargado.email}`);
  console.log(`   - Repartidor -> usuario: Repartidor  | email: ${usuarioRepartidor.email}`);
  console.log(`   - Consumidor -> usuario: Consumidor  | email: ${usuarioConsumidor.email}`);
  console.log(`   - Datos      -> usuarios: RepartidorDatos (${usuarioRepartidorDatos.email}), ConsumidorDatos (${usuarioConsumidorDatos.email})\n`);
  for (const a of resumenActivos) console.log(`🎪 ${a.nombre} (${a.estado}): ${a.dias} días, ${a.puestos} puestos`);
  console.log(`\n📊 Historial: ${pedidosCreados.length} pedidos (${entregadosPorRepartidorDatos} entregados por el Repartidor de datos)`);
  console.log('========================================');

  const sinAsociaciones = eventosPorEstado.find((e) => e.estado === 'EnPreparacion1' && e.nombre === 'Feria de Otoño');
  return {
    credenciales: {
      password: '123123123',
      productor: { usuario: usuarioProductor.usuario, email: usuarioProductor.email },
      encargado: { usuario: usuarioEncargado.usuario, email: usuarioEncargado.email },
      repartidor: { usuario: usuarioRepartidor.usuario, email: usuarioRepartidor.email },
      consumidor: { usuario: usuarioConsumidor.usuario, email: usuarioConsumidor.email },
      repartidorDatos: { usuario: usuarioRepartidorDatos.usuario, email: usuarioRepartidorDatos.email },
      consumidorDatos: { usuario: usuarioConsumidorDatos.usuario, email: usuarioConsumidorDatos.email },
    },
    eventosActivos: resumenActivos,
    evento: { nombre: principal.evento.nombre, inicio: principal.evento.fechaHoraInicio, fin: principal.evento.fechaHoraFin },
    eventoSinAsociaciones: sinAsociaciones || null,
    eventosPorEstado,
    pedidos: {
      enCurso: { [EstadosPedido.Pendiente]: 1, [EstadosPedido.Aceptado]: 1, [EstadosPedido.EnPreparacion]: 1, [EstadosPedido.Listo]: 1, [EstadosPedido.EnCamino]: 1 },
      historialEstadisticas: {
        totalPedidos: pedidosCreados.length,
        entregadosPorRepartidorDatos,
        eventos: activos.length,
        puestos: puestosPorKey.size,
      },
    },
  };
}
