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
import { EstadosEvento, EstadosAsociaciones, EstadosPedido } from '../enums/Estados.enums.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const MIME_BY_EXT = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

// Lee una imagen de src/public/images/<baseName>.<jpg|jpeg|png|webp> y la
// devuelve como data URI base64 (formato que espera el frontend en los
// campos img/banner). Si no encuentra el archivo, devuelve '' sin romper el seed.
function loadImageAsDataUri(baseName) {
  for (const ext of Object.keys(MIME_BY_EXT)) {
    const filePath = path.join(IMAGES_DIR, baseName + ext);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return `data:${MIME_BY_EXT[ext]};base64,${buffer.toString('base64')}`;
    }
  }
  console.warn(`⚠️  No se encontró imagen "${baseName}" en ${IMAGES_DIR} (.jpg/.jpeg/.png/.webp) — se deja sin imagen.`);
  return '';
}

// Ejecuta el seed de datos de demo completo: vacía todas las tablas y siembra
// un dataset fijo (4 usuarios por rol, evento "fiesta del cuarteto", puesto +
// productos, y pedidos en distintos estados).
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

  // Paso 2: un usuario por rol
  console.log('🔄 Creando usuarios demo (uno por rol)...');
  const hashed = createHashPW('123123123');

  // Productor
  const productor = await Productor.create({
    cuit: '20304050601',
    razonSocial: 'Productor Demo SRL',
    estaValido: true,
    habilitado: true,
    condicionIva: 'Monotributista',
  });
  const consumidorProductor = await Consumidor.create({
    nombre: 'Productor',
    apellido: 'Demo',
    fechaNacimiento: new Date(1985, 0, 1),
    dni: 30111221,
    localidad: 'Villa María',
    provincia: 'Córdoba',
    telefono: 3515551001,
    habilitado: true,
    productorId: productor.id,
  });
  const usuarioProductor = await Usuario.create({
    usuario: 'Productor',
    email: 'productor@demo.com',
    emailValidado: true,
    contraseña: hashed,
    fechaAlta: new Date(),
    habilitado: true,
    tipoUsuario: 'productor',
    consumidorId: consumidorProductor.id,
  });

  // Encargado
  const encargado = await Encargado.create({
    cuit: '20304050602',
    razonSocial: 'Puesto Cuarteto Demo',
    estaValido: true,
    habilitado: true,
    condicionIva: 'Monotributista',
  });
  const consumidorEncargado = await Consumidor.create({
    nombre: 'Encargado',
    apellido: 'Demo',
    fechaNacimiento: new Date(1988, 0, 1),
    dni: 30111222,
    localidad: 'Villa María',
    provincia: 'Córdoba',
    telefono: 3515551002,
    habilitado: true,
    encargadoId: encargado.id,
  });
  const usuarioEncargado = await Usuario.create({
    usuario: 'Encargado',
    email: 'encargado@demo.com',
    emailValidado: true,
    contraseña: hashed,
    fechaAlta: new Date(),
    habilitado: true,
    tipoUsuario: 'encargado',
    consumidorId: consumidorEncargado.id,
  });

  // Repartidor
  const repartidor = await Repartidor.create({
    estaValido: true,
    habilitado: true,
  });
  const consumidorRepartidor = await Consumidor.create({
    nombre: 'Repartidor',
    apellido: 'Demo',
    fechaNacimiento: new Date(1992, 0, 1),
    dni: 30111223,
    localidad: 'Villa María',
    provincia: 'Córdoba',
    telefono: 3515551003,
    habilitado: true,
    repartidorId: repartidor.id,
  });
  const usuarioRepartidor = await Usuario.create({
    usuario: 'Repartidor',
    email: 'repartidor@demo.com',
    emailValidado: true,
    contraseña: hashed,
    fechaAlta: new Date(),
    habilitado: true,
    tipoUsuario: 'repartidor',
    consumidorId: consumidorRepartidor.id,
  });

  // Consumidor
  const consumidorConsumidor = await Consumidor.create({
    nombre: 'Consumidor',
    apellido: 'Demo',
    fechaNacimiento: new Date(1995, 0, 1),
    dni: 30111224,
    localidad: 'Villa María',
    provincia: 'Córdoba',
    telefono: 3515551004,
    habilitado: true,
  });
  const usuarioConsumidor = await Usuario.create({
    usuario: 'Consumidor',
    email: 'consumidor@demo.com',
    emailValidado: true,
    contraseña: hashed,
    fechaAlta: new Date(),
    habilitado: true,
    tipoUsuario: 'consumidor',
    consumidorId: consumidorConsumidor.id,
  });

  console.log('✅ Usuarios demo creados (Productor, Encargado, Repartidor, Consumidor)\n');

  // Paso 3: evento "fiesta del cuarteto" en Villa María
  console.log('🔄 Creando evento demo...');
  const ahora = new Date();
  const inicioEvento = new Date(ahora);
  inicioEvento.setDate(ahora.getDate() - 7);
  inicioEvento.setHours(10, 0, 0, 0);
  const finEvento = new Date(ahora);
  finEvento.setMonth(ahora.getMonth() + 1);
  finEvento.setHours(23, 0, 0, 0);

  const evento = await Evento.create({
    nombre: 'fiesta del cuarteto',
    descripcion: 'La fiesta del cuarteto más grande de Villa María, con los mejores puestos de comida y bebida.',
    tipoEvento: 'Música',
    tipoPago: 'Efectivo',
    cantidadPuestos: '1',
    conButaca: false,
    conRepartidor: true,
    tienePreventa: false,
    linkVentaEntradas: '',
    ubicacion: 'Villa María, Córdoba',
    habilitado: true,
    localidad: 'Villa María',
    provincia: 'Córdoba',
    img: loadImageAsDataUri('evento-cuarteto'),
    estado: EstadosEvento.EnCurso,
    longitud: '-63.2304',
    latitud: '-32.4076',
    cantidadDiasEvento: String(Math.ceil((finEvento - inicioEvento) / 86400000)),
    fechaHoraInicio: inicioEvento,
    fechaHoraFin: finEvento,
    productorId: productor.id,
  });

  // Un DiaEvento por cada día desde el inicio (hace 7 días) hasta hoy inclusive.
  // Así las estadísticas "pedidos por día" y "productos vendidos por día"
  // muestran varios puntos en el gráfico en vez de un único bloque gigante.
  const diasEvento = [];
  for (let d = 0; ; d++) {
    const inicioDia = new Date(inicioEvento);
    inicioDia.setDate(inicioEvento.getDate() + d);
    inicioDia.setHours(10, 0, 0, 0);
    if (inicioDia > ahora) break;
    // El evento es de Villa María (ART, UTC-3), pero el proceso corre en UTC
    // (Railway). "23:59 hora Argentina" equivale a las 02:59 UTC del día
    // siguiente: si se usara setHours(23,59,...) directo, el día quedaría
    // "finalizado" (fechaFin < ahora) desde las 21:00 ART en adelante, y
    // filtrarFinalizados() del frontend ocultaría el evento aunque su
    // estado siga en EnCurso.
    const finDia = new Date(inicioDia);
    finDia.setDate(finDia.getDate() + 1);
    finDia.setHours(2, 59, 0, 0);
    const dia = await DiaEvento.create({
      nombre: `Fiesta del Cuarteto - Día ${d + 1}`,
      descripcion: 'Jornada de la fiesta del cuarteto en Villa María.',
      fechaHoraInicioDiaEvento: inicioDia,
      fechaHoraFinDiaEvento: finDia,
      tienePreventa: false,
      eventoId: evento.id,
    });
    diasEvento.push(dia);
  }

  // Sin esto, procesosAutomaticos.js explota al finalizar la asignación de un
  // repartidor (pedidoService.setDatosExtraPedido hace idPE.id sobre un array
  // vacío) y el pedido nunca queda con repartidorId asignado.
  const puntoEncuentro = await PuntoEncuentro.create({
    nombre: 'Entrada principal - Fiesta del Cuarteto',
    longitud: '-63.2304',
    latitud: '-32.4076',
    habilitado: true,
    eventoId: evento.id,
  });

  console.log('✅ Evento demo creado\n');

  // Paso 4: puesto del encargado + productos
  console.log('🔄 Creando puesto y productos demo...');
  const puestoImg = loadImageAsDataUri('puesto-cuarteto');
  const puesto = await Puesto.create({
    nombreCarro: 'Puesto Cuarteto',
    numeroCarro: 1,
    tipoNegocio: 'Food Truck',
    banner: puestoImg || '',
    img: puestoImg || null,
    telefonoCarro: '3535123456',
    estado: 'Creado',
    encargadoId: encargado.id,
  });

  const [choripan, cerveza, empanada, agua] = await Promise.all([
    Producto.create({
      nombre: 'Choripán',
      descripcion: 'Choripán casero con chimichurri.',
      precio: 3500,
      estado: true,
      img: loadImageAsDataUri('producto-choripan') || null,
      puestoId: puesto.id,
    }),
    Producto.create({
      nombre: 'Cerveza',
      descripcion: 'Cerveza artesanal 500ml.',
      precio: 2500,
      estado: true,
      img: loadImageAsDataUri('producto-cerveza') || null,
      puestoId: puesto.id,
    }),
    Producto.create({
      nombre: 'Empanada',
      descripcion: 'Empanada de carne cortada a cuchillo.',
      precio: 1200,
      estado: true,
      img: loadImageAsDataUri('producto-empanada') || null,
      puestoId: puesto.id,
    }),
    Producto.create({
      nombre: 'Agua',
      descripcion: 'Agua mineral 500ml.',
      precio: 1000,
      estado: true,
      img: loadImageAsDataUri('producto-agua') || null,
      puestoId: puesto.id,
    }),
  ]);
  const productos = [choripan, cerveza, empanada, agua];

  await Asociacion.create({
    estado: EstadosAsociaciones.Aceptada,
    eventoId: evento.id,
    puestoId: puesto.id,
  });

  // Dos puestos extra del mismo encargado, con sus productos, para que las
  // estadísticas por puesto (ranking del productor, filtros del encargado)
  // tengan varias series y no un único puesto.
  const puestoParrilla = await Puesto.create({
    nombreCarro: 'Parrilla Don Cuarteto',
    numeroCarro: 2,
    tipoNegocio: 'Food Truck',
    banner: '',
    img: null,
    telefonoCarro: '3535123457',
    estado: 'Creado',
    encargadoId: encargado.id,
  });
  const [bondiola, papas] = await Promise.all([
    Producto.create({
      nombre: 'Bondiola',
      descripcion: 'Sándwich de bondiola completo.',
      precio: 4500,
      estado: true,
      img: null,
      puestoId: puestoParrilla.id,
    }),
    Producto.create({
      nombre: 'Papas fritas',
      descripcion: 'Porción grande de papas fritas.',
      precio: 2000,
      estado: true,
      img: null,
      puestoId: puestoParrilla.id,
    }),
  ]);

  const puestoBebidas = await Puesto.create({
    nombreCarro: 'Barra de Tragos',
    numeroCarro: 3,
    tipoNegocio: 'Barra',
    banner: '',
    img: null,
    telefonoCarro: '3535123458',
    estado: 'Creado',
    encargadoId: encargado.id,
  });
  const [fernet, gaseosa] = await Promise.all([
    Producto.create({
      nombre: 'Fernet con cola',
      descripcion: 'Fernet con cola en vaso de litro.',
      precio: 3000,
      estado: true,
      img: null,
      puestoId: puestoBebidas.id,
    }),
    Producto.create({
      nombre: 'Gaseosa',
      descripcion: 'Gaseosa línea 500ml.',
      precio: 1500,
      estado: true,
      img: null,
      puestoId: puestoBebidas.id,
    }),
  ]);

  await Asociacion.create({
    estado: EstadosAsociaciones.Aceptada,
    eventoId: evento.id,
    puestoId: puestoParrilla.id,
  });
  await Asociacion.create({
    estado: EstadosAsociaciones.Aceptada,
    eventoId: evento.id,
    puestoId: puestoBebidas.id,
  });

  const puestosConProductos = [
    { puesto, productos },
    { puesto: puestoParrilla, productos: [bondiola, papas] },
    { puesto: puestoBebidas, productos: [fernet, gaseosa] },
  ];

  console.log('✅ Puesto y productos demo creados\n');

  // Paso 5: repartidor asociado al evento
  console.log('🔄 Asociando repartidor al evento...');
  await Asociacion.create({
    estado: EstadosAsociaciones.Aceptada,
    eventoId: evento.id,
    repartidoreId: repartidor.id,
  });
  console.log('✅ Repartidor asociado al evento\n');

  // Paso 6: pedidos en distintos estados
  console.log('🔄 Creando pedidos demo en distintos estados...');

  // 5 consumidores de relleno, cada uno con su propio usuario
  const consumidoresRelleno = [];
  for (let i = 1; i <= 5; i++) {
    const consumidorRelleno = await Consumidor.create({
      nombre: `Cliente${i}`,
      apellido: 'Demo',
      fechaNacimiento: new Date(1990, 0, i),
      dni: 30111224 + i,
      localidad: 'Villa María',
      provincia: 'Córdoba',
      telefono: 3515551004 + i,
      habilitado: true,
    });
    await Usuario.create({
      usuario: `Cliente${i}`,
      email: `cliente${i}@demo.com`,
      emailValidado: true,
      contraseña: hashed,
      fechaAlta: new Date(),
      habilitado: true,
      tipoUsuario: 'consumidor',
      consumidorId: consumidorRelleno.id,
    });
    consumidoresRelleno.push(consumidorRelleno);
  }

  const minutosAtras = (min) => new Date(ahora.getTime() - min * 60 * 1000);

  const crearPedido = async ({ estado, consumidorId, fecha }) => {
    const pedido = await Pedido.create({
      fecha,
      total: 0,
      estado,
      consumidorId,
      eventoId: evento.id,
      puestoId: puesto.id,
    });

    const cantidadDetalles = Math.floor(Math.random() * 3) + 1; // 1 a 3
    let total = 0;
    for (let i = 0; i < cantidadDetalles; i++) {
      const producto = productos[Math.floor(Math.random() * productos.length)];
      const cantidad = Math.floor(Math.random() * 3) + 1; // 1 a 3
      const precio = producto.precio;
      total += cantidad * precio;
      await DetallePedido.create({
        cantidad,
        precio,
        productoId: producto.id,
        PedidoId: pedido.id,
      });
    }

    await pedido.update({ total });
    return pedido;
  };

  const pedidoPendiente = await crearPedido({
    estado: EstadosPedido.Pendiente,
    consumidorId: consumidoresRelleno[0].id,
    fecha: minutosAtras(0),
  });

  const pedidoAceptado = await crearPedido({
    estado: EstadosPedido.Aceptado,
    consumidorId: consumidoresRelleno[1].id,
    fecha: minutosAtras(10),
  });

  const pedidoEnPreparacion = await crearPedido({
    estado: EstadosPedido.EnPreparacion,
    consumidorId: consumidoresRelleno[2].id,
    fecha: minutosAtras(20),
  });

  const pedidoListo = await crearPedido({
    estado: EstadosPedido.Listo,
    consumidorId: consumidoresRelleno[3].id,
    fecha: minutosAtras(30),
  });

  const pedidoEnCamino = await crearPedido({
    estado: EstadosPedido.EnCamino,
    consumidorId: consumidorConsumidor.id,
    fecha: minutosAtras(40),
  });
  await Asignacion.create({
    estado: 'Aceptado',
    repartidoreId: repartidor.id,
    PedidoId: pedidoEnCamino.id,
  });
  // Seteamos repartidorId/puntoEncuentroId/codigoEntrega directo: en la app real
  // los pone procesosAutomaticos.js en su siguiente ciclo (pedidoService.setDatosExtraPedido),
  // pero esa consulta solo mira asignaciones aceptadas en los últimos 45s
  // (ASIGNACION_WINDOW_SECONDS) y además exige repartidorId IS NULL — si lo
  // seteáramos solo a él, el pedido quedaría excluido de esa consulta y nunca
  // recibiría punto de encuentro ni código de entrega.
  await pedidoEnCamino.update({
    repartidorId: repartidor.id,
    puntoEncuentroId: puntoEncuentro.id,
    codigoEntrega: 'CUARTE',
  });

  const fechaEntregado = minutosAtras(60);
  const pedidoEntregado = await crearPedido({
    estado: EstadosPedido.Entregado,
    consumidorId: consumidoresRelleno[4].id,
    fecha: fechaEntregado,
  });
  await pedidoEntregado.update({
    fechaEntrega: new Date(fechaEntregado.getTime() + 10 * 60 * 1000),
    codigoEntrega: 'DEMO12',
  });

  console.log('✅ Pedidos demo creados\n');

  // Paso 6b: historial de pedidos para las estadísticas.
  // Genera pedidos Entregado/Valorado repartidos en todos los días del evento,
  // en los 3 puestos, con tiempos de entrega realistas, valoraciones de puesto
  // (alimenta las stats del Encargado y del Productor) y entregas hechas por el
  // Repartidor demo con sus valoraciones (alimenta las stats del Repartidor).
  console.log('🔄 Creando historial de pedidos para estadísticas...');

  const OPINIONES = [
    'Muy rico, volvería a pedir.',
    'Llegó rápido y caliente.',
    'Buena atención.',
    'Tardó un poco pero valió la pena.',
    'Excelente relación precio-calidad.',
    'Todo perfecto.',
  ];
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  let totalHistorial = 0;
  let entregadosPorRepartidor = 0;

  for (const dia of diasEvento) {
    const inicioDia = new Date(dia.fechaHoraInicioDiaEvento);
    for (const { puesto: p, productos: prods } of puestosConProductos) {
      // Entre 4 y 8 pedidos por puesto por día
      const cantidadPedidos = randomInt(4, 8);
      for (let i = 0; i < cantidadPedidos; i++) {
        // Hora del pedido: entre las 11:00 y las 22:30 del día
        const fechaPedido = new Date(inicioDia);
        fechaPedido.setHours(randomInt(11, 22), randomInt(0, 59), 0, 0);
        if (fechaPedido > ahora) continue; // no crear pedidos en el futuro

        const consumidorRandom = consumidoresRelleno[randomInt(0, consumidoresRelleno.length - 1)];
        const esValorado = Math.random() < 0.6; // 60% valorados, 40% solo entregados
        const conRepartidor = Math.random() < 0.5; // 50% entregados por el repartidor demo

        const pedido = await Pedido.create({
          fecha: fechaPedido,
          total: 0,
          estado: esValorado ? EstadosPedido.valorado : EstadosPedido.Entregado,
          consumidorId: consumidorRandom.id,
          eventoId: evento.id,
          puestoId: p.id,
        });

        let total = 0;
        const cantidadDetalles = randomInt(1, 3);
        for (let j = 0; j < cantidadDetalles; j++) {
          const producto = prods[randomInt(0, prods.length - 1)];
          const cantidad = randomInt(1, 3);
          total += cantidad * producto.precio;
          await DetallePedido.create({
            cantidad,
            precio: producto.precio,
            productoId: producto.id,
            PedidoId: pedido.id,
          });
        }

        // Tiempo de entrega: entre 8 y 35 minutos
        const fechaEntrega = new Date(fechaPedido.getTime() + randomInt(8, 35) * 60 * 1000);
        const updateData = {
          total,
          fechaEntrega,
          codigoEntrega: `H${String(totalHistorial).padStart(5, '0')}`,
        };

        if (conRepartidor) {
          updateData.repartidorId = repartidor.id;
          updateData.puntoEncuentroId = puntoEncuentro.id;
          await Asignacion.create({
            estado: 'Aceptado',
            repartidoreId: repartidor.id,
            PedidoId: pedido.id,
          });
          entregadosPorRepartidor++;
        }

        await pedido.update(updateData);

        if (esValorado) {
          await ValoracionPuesto.create({
            puntuacion: randomInt(3, 5),
            opinion: OPINIONES[randomInt(0, OPINIONES.length - 1)],
            puestoId: p.id,
            pedidoId: pedido.id,
          });
          if (conRepartidor) {
            await ValoracionRepartidor.create({
              puntuacion: randomInt(3, 5),
              opinion: OPINIONES[randomInt(0, OPINIONES.length - 1)],
              repartidorId: repartidor.id,
              pedidoId: pedido.id,
            });
          }
        }

        totalHistorial++;
      }
    }
  }

  console.log(`✅ Historial creado: ${totalHistorial} pedidos (${entregadosPorRepartidor} entregados por el Repartidor demo)\n`);

  // Paso 7: evento recién creado, sin asociaciones, para probar el flujo de
  // asociar puestos/repartidores desde cero (mismo Productor demo).
  console.log('🔄 Creando evento demo "recién creado" (sin asociaciones)...');
  const inicioEventoNuevo = new Date(ahora);
  inicioEventoNuevo.setDate(ahora.getDate() + 14);
  inicioEventoNuevo.setHours(10, 0, 0, 0);
  const finEventoNuevo = new Date(ahora);
  finEventoNuevo.setDate(ahora.getDate() + 15);
  finEventoNuevo.setHours(23, 0, 0, 0);

  const eventoNuevo = await Evento.create({
    nombre: 'Feria de Otoño',
    descripcion: 'Evento recién creado, todavía sin puestos ni repartidores asociados.',
    tipoEvento: 'Feria',
    tipoPago: 'Efectivo',
    cantidadPuestos: '1',
    conButaca: false,
    conRepartidor: true,
    tienePreventa: false,
    linkVentaEntradas: '',
    ubicacion: 'Villa María, Córdoba',
    habilitado: true,
    localidad: 'Villa María',
    provincia: 'Córdoba',
    img: loadImageAsDataUri('evento-cuarteto'),
    estado: 'EnPreparacion1',
    longitud: '-63.2304',
    latitud: '-32.4076',
    cantidadDiasEvento: String(Math.ceil((finEventoNuevo - inicioEventoNuevo) / 86400000)),
    fechaHoraInicio: inicioEventoNuevo,
    fechaHoraFin: finEventoNuevo,
    productorId: productor.id,
  });
  console.log(`✅ Evento "${eventoNuevo.nombre}" creado sin asociaciones (estado: ${eventoNuevo.estado})\n`);

  // Paso 7b: un evento por cada estado posible y por cada combinatoria
  // con/sin preventa, para poder probar cualquier pantalla que filtre por
  // estado o por preventa. "temporalidad" define cuándo arranca cada uno:
  //   - 'futuro': arranca semanas adelante y nunca "termina pronto" (no
  //     depende de cuándo se corra el seed para seguir siendo visible).
  //   - 'vivo': arrancó hace 2 días y se extiende 14 días a futuro, para
  //     que se vea "en vivo" sin caer en el bug de vencimiento que tenía
  //     "fiesta del cuarteto".
  //   - 'pasado': ya terminó hace semanas (solo tiene sentido para
  //     "Finalizado" — un evento finalizado no puede estar a futuro).
  // No se les pone imagen: solo existe la foto de "fiesta del cuarteto" en
  // src/public/images, y reusarla en 16 eventos distintos sería engañoso.
  console.log('🔄 Creando eventos demo por estado y combinatoria de preventa...');
  const eventosDemoDef = [
    {
      estado: 'EnPreparacion',
      temporalidad: 'futuro',
      nombre: 'Feria de Emprendedores de Villa María',
      descripcion: 'Feria de emprendedores locales en la Plaza San Martín.',
      tipoEvento: 'Feria',
      conPreventa: false,
    },
    {
      estado: 'EnPreparacion',
      temporalidad: 'futuro',
      nombre: 'Festival de Cerveza Artesanal Cordobesa',
      descripcion: 'Festival de cervecerías artesanales de la región.',
      tipoEvento: 'Gastronómico',
      conPreventa: true,
    },
    {
      estado: 'EnPreparacion1',
      temporalidad: 'futuro',
      nombre: 'Corso de Carnaval Villa María',
      descripcion: 'Corsos populares por Av. Sabattini.',
      tipoEvento: 'Cultural',
      conPreventa: false,
    },
    {
      estado: 'EnPreparacion1',
      temporalidad: 'futuro',
      nombre: 'Recital de Rock Nacional - Estadio Municipal',
      descripcion: 'Recital de bandas de rock nacional en el Estadio Municipal.',
      tipoEvento: 'Música',
      conPreventa: true,
    },
    {
      estado: 'EnPreparacion2',
      temporalidad: 'futuro',
      nombre: 'Exposición Rural de Villa María',
      descripcion: 'Muestra anual de la Sociedad Rural, con remate de hacienda.',
      tipoEvento: 'Exposición',
      conPreventa: false,
    },
    {
      estado: 'EnPreparacion2',
      temporalidad: 'futuro',
      nombre: 'Festival de Jazz de Verano',
      descripcion: 'Ciclo de jazz al aire libre en el Anfiteatro Municipal.',
      tipoEvento: 'Música',
      conPreventa: true,
    },
    {
      estado: 'Confirmado',
      temporalidad: 'futuro',
      nombre: 'Fiesta Patronal de San Martín',
      descripcion: 'Fiesta patronal del barrio San Martín, entrada libre y gratuita.',
      tipoEvento: 'Fiesta popular',
      conPreventa: false,
    },
    {
      estado: 'Confirmado',
      temporalidad: 'futuro',
      nombre: 'Cosquín Rock - Edición Villa María',
      descripcion: 'Edición confirmada del festival itinerante, entradas en preventa.',
      tipoEvento: 'Música',
      conPreventa: true,
    },
    {
      estado: 'EnCurso',
      temporalidad: 'vivo',
      nombre: 'Kermés Solidaria del Club Atlético',
      descripcion: 'Kermés a beneficio de las divisiones inferiores del club.',
      tipoEvento: 'Solidario',
      conPreventa: false,
    },
    {
      estado: 'EnCurso',
      temporalidad: 'vivo',
      nombre: 'Expo Gastronómica del Río Ctalamochita',
      descripcion: 'Muestra gastronómica a orillas del río Ctalamochita.',
      tipoEvento: 'Gastronómico',
      conPreventa: true,
    },
    {
      estado: 'Pausado',
      temporalidad: 'futuro',
      nombre: 'Festival de Doma y Folklore',
      descripcion: 'Festival tradicionalista pausado por pronóstico de lluvia.',
      tipoEvento: 'Cultural',
      conPreventa: false,
    },
    {
      estado: 'Pausado',
      temporalidad: 'futuro',
      nombre: 'Maratón Solidaria Nocturna',
      descripcion: 'Maratón solidaria pausada por reprogramación del circuito.',
      tipoEvento: 'Deportivo',
      conPreventa: true,
    },
    {
      estado: 'Cancelado',
      temporalidad: 'futuro',
      nombre: 'Verbena Popular Barrio Centro',
      descripcion: 'Verbena barrial cancelada por falta de permisos municipales.',
      tipoEvento: 'Fiesta popular',
      conPreventa: false,
    },
    {
      estado: 'Cancelado',
      temporalidad: 'futuro',
      nombre: 'Show de Fin de Año - Plaza Vélez Sarsfield',
      descripcion: 'Show de fin de año cancelado por el municipio.',
      tipoEvento: 'Música',
      conPreventa: true,
    },
    {
      estado: 'Finalizado',
      temporalidad: 'pasado',
      nombre: 'Fiesta de la Cosecha 2025',
      descripcion: 'Edición 2025 de la Fiesta de la Cosecha.',
      tipoEvento: 'Fiesta popular',
      conPreventa: false,
    },
    {
      estado: 'Finalizado',
      temporalidad: 'pasado',
      nombre: 'Aniversario de Villa María 2025',
      descripcion: 'Festejos por el aniversario de la ciudad, edición 2025.',
      tipoEvento: 'Fiesta popular',
      conPreventa: true,
    },
  ];

  let semanaOffset = 3;
  let semanaOffsetPasado = 10;
  const eventosPorEstado = [];
  for (const def of eventosDemoDef) {
    let inicioDemo;
    let finDemo;
    if (def.temporalidad === 'vivo') {
      inicioDemo = new Date(ahora);
      inicioDemo.setDate(ahora.getDate() - 2);
      inicioDemo.setHours(10, 0, 0, 0);
      finDemo = new Date(ahora);
      finDemo.setDate(ahora.getDate() + 14);
      finDemo.setHours(23, 0, 0, 0);
    } else if (def.temporalidad === 'pasado') {
      inicioDemo = new Date(ahora);
      inicioDemo.setDate(ahora.getDate() - semanaOffsetPasado * 7);
      inicioDemo.setHours(10, 0, 0, 0);
      finDemo = new Date(inicioDemo);
      finDemo.setDate(inicioDemo.getDate() + 2);
      finDemo.setHours(23, 0, 0, 0);
      semanaOffsetPasado += 1;
    } else {
      inicioDemo = new Date(ahora);
      inicioDemo.setDate(ahora.getDate() + semanaOffset * 7);
      inicioDemo.setHours(10, 0, 0, 0);
      finDemo = new Date(inicioDemo);
      finDemo.setDate(inicioDemo.getDate() + 2);
      finDemo.setHours(23, 0, 0, 0);
      semanaOffset += 1;
    }

    const eventoDemo = await Evento.create({
      nombre: def.nombre,
      descripcion: def.descripcion,
      tipoEvento: def.tipoEvento,
      tipoPago: 'Efectivo',
      cantidadPuestos: '1',
      conButaca: false,
      conRepartidor: true,
      tienePreventa: def.conPreventa,
      fechaInicioPreventa: def.conPreventa ? ahora : null,
      linkVentaEntradas: def.conPreventa ? 'https://entradas.demo/qf' : '',
      ubicacion: 'Villa María, Córdoba',
      habilitado: true,
      localidad: 'Villa María',
      provincia: 'Córdoba',
      img: '',
      estado: def.estado,
      longitud: '-63.2304',
      latitud: '-32.4076',
      cantidadDiasEvento: String(Math.ceil((finDemo - inicioDemo) / 86400000)),
      fechaHoraInicio: inicioDemo,
      fechaHoraFin: finDemo,
      productorId: productor.id,
    });

    await DiaEvento.create({
      nombre: `${eventoDemo.nombre} - Día 1`,
      descripcion: `Jornada de "${eventoDemo.nombre}".`,
      fechaHoraInicioDiaEvento: inicioDemo,
      fechaHoraFinDiaEvento: finDemo,
      tienePreventa: def.conPreventa,
      eventoId: eventoDemo.id,
    });

    eventosPorEstado.push({
      id: eventoDemo.id,
      nombre: eventoDemo.nombre,
      estado: def.estado,
      tienePreventa: def.conPreventa,
    });
  }
  console.log(`✅ ${eventosPorEstado.length} eventos demo creados (uno por combinación estado × preventa)\n`);

  // Paso 8: resumen final
  console.log('========================================');
  console.log('🎉 SEED DE DEMO COMPLETADO 🎉');
  console.log('========================================\n');
  console.log('👤 Credenciales de login (password para las 4: 123123123)');
  console.log(`   - Productor  -> usuario: Productor   | email: ${usuarioProductor.email}`);
  console.log(`   - Encargado  -> usuario: Encargado   | email: ${usuarioEncargado.email}`);
  console.log(`   - Repartidor -> usuario: Repartidor  | email: ${usuarioRepartidor.email}`);
  console.log(`   - Consumidor -> usuario: Consumidor  | email: ${usuarioConsumidor.email}\n`);
  console.log(`🎪 Evento: "${evento.nombre}"`);
  console.log(`   Inicio: ${inicioEvento.toString()}`);
  console.log(`   Fin:    ${finEvento.toString()}\n`);
  console.log(`🆕 Evento sin asociaciones: "${eventoNuevo.nombre}" (estado: ${eventoNuevo.estado})`);
  console.log(`   Inicio: ${inicioEventoNuevo.toString()}`);
  console.log(`   Fin:    ${finEventoNuevo.toString()}\n`);
  console.log(`🗂️  Eventos demo por estado × preventa: ${eventosPorEstado.length}\n`);
  console.log('🧾 Pedidos creados por estado:');
  console.log(`   - ${EstadosPedido.Pendiente}: 1 (Cliente1)`);
  console.log(`   - ${EstadosPedido.Aceptado}: 1 (Cliente2)`);
  console.log(`   - ${EstadosPedido.EnPreparacion}: 1 (Cliente3)`);
  console.log(`   - ${EstadosPedido.Listo}: 1 (Cliente4)`);
  console.log(`   - ${EstadosPedido.EnCamino}: 1 (Consumidor demo, con Asignacion a Repartidor)`);
  console.log(`   - ${EstadosPedido.Entregado}: 1 (Cliente5)`);
  console.log(`\n📊 Historial para estadísticas:`);
  console.log(`   - ${totalHistorial} pedidos Entregado/Valorado repartidos en ${diasEvento.length} días y 3 puestos`);
  console.log(`   - ${entregadosPorRepartidor} entregados por el Repartidor demo (con valoraciones)`);
  console.log('========================================');

  const resumen = {
    credenciales: {
      password: '123123123',
      productor: { usuario: usuarioProductor.usuario, email: usuarioProductor.email },
      encargado: { usuario: usuarioEncargado.usuario, email: usuarioEncargado.email },
      repartidor: { usuario: usuarioRepartidor.usuario, email: usuarioRepartidor.email },
      consumidor: { usuario: usuarioConsumidor.usuario, email: usuarioConsumidor.email },
    },
    evento: {
      nombre: evento.nombre,
      inicio: inicioEvento,
      fin: finEvento,
    },
    eventoSinAsociaciones: {
      nombre: eventoNuevo.nombre,
      estado: eventoNuevo.estado,
      inicio: inicioEventoNuevo,
      fin: finEventoNuevo,
    },
    eventosPorEstado,
    pedidos: {
      [EstadosPedido.Pendiente]: 1,
      [EstadosPedido.Aceptado]: 1,
      [EstadosPedido.EnPreparacion]: 1,
      [EstadosPedido.Listo]: 1,
      [EstadosPedido.EnCamino]: 1,
      [EstadosPedido.Entregado]: 1,
      historialEstadisticas: {
        totalPedidos: totalHistorial,
        entregadosPorRepartidorDemo: entregadosPorRepartidor,
        dias: diasEvento.length,
        puestos: puestosConProductos.length,
      },
    },
  };

  return resumen;
}
