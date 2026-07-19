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
import { Puesto } from '../DAO/models/puesto.model.js';
import { Producto } from '../DAO/models/producto.model.js';
import { Asociacion } from '../DAO/models/asociacion.model.js';
import { Pedido } from '../DAO/models/pedido.model.js';
import { DetallePedido } from '../DAO/models/detallePedido.model.js';
import { Asignacion } from '../DAO/models/asignacion.model.js';
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

  await DiaEvento.create({
    nombre: 'Fiesta del Cuarteto',
    descripcion: 'Jornada completa de la fiesta del cuarteto en Villa María.',
    fechaHoraInicioDiaEvento: inicioEvento,
    fechaHoraFinDiaEvento: finEvento,
    tienePreventa: false,
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

  const fechaEntregado = minutosAtras(60);
  const pedidoEntregado = await crearPedido({
    estado: EstadosPedido.Entregado,
    consumidorId: consumidoresRelleno[4].id,
    fecha: fechaEntregado,
  });
  await pedidoEntregado.update({
    fechaEntrega: new Date(fechaEntregado.getTime() + 10 * 60 * 1000),
    codigoEntrega: 'DEMO123',
  });

  console.log('✅ Pedidos demo creados\n');

  // Paso 7: resumen final
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
  console.log('🧾 Pedidos creados por estado:');
  console.log(`   - ${EstadosPedido.Pendiente}: 1 (Cliente1)`);
  console.log(`   - ${EstadosPedido.Aceptado}: 1 (Cliente2)`);
  console.log(`   - ${EstadosPedido.EnPreparacion}: 1 (Cliente3)`);
  console.log(`   - ${EstadosPedido.Listo}: 1 (Cliente4)`);
  console.log(`   - ${EstadosPedido.EnCamino}: 1 (Consumidor demo, con Asignacion a Repartidor)`);
  console.log(`   - ${EstadosPedido.Entregado}: 1 (Cliente5)`);
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
    pedidos: {
      [EstadosPedido.Pendiente]: 1,
      [EstadosPedido.Aceptado]: 1,
      [EstadosPedido.EnPreparacion]: 1,
      [EstadosPedido.Listo]: 1,
      [EstadosPedido.EnCamino]: 1,
      [EstadosPedido.Entregado]: 1,
    },
  };

  return resumen;
}
