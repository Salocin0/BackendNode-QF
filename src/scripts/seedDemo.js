import { sequelize } from '../util/connections.js';
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
import { createHashPW } from '../util/bcrypt.js';
import { EstadosEvento, EstadosAsociaciones, EstadosPedido } from '../enums/Estados.enums.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedDemo() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    console.log('🔄 Sincronizando esquema (sin destruir datos existentes)...');
    await sequelize.sync();
    console.log('✅ Esquema sincronizado\n');

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
      img: '',
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
    const puesto = await Puesto.create({
      nombreCarro: 'Puesto Cuarteto',
      numeroCarro: 1,
      tipoNegocio: 'Food Truck',
      banner: '',
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
        puestoId: puesto.id,
      }),
      Producto.create({
        nombre: 'Cerveza',
        descripcion: 'Cerveza artesanal 500ml.',
        precio: 2500,
        estado: true,
        puestoId: puesto.id,
      }),
      Producto.create({
        nombre: 'Empanada',
        descripcion: 'Empanada de carne cortada a cuchillo.',
        precio: 1200,
        estado: true,
        puestoId: puesto.id,
      }),
      Producto.create({
        nombre: 'Agua',
        descripcion: 'Agua mineral 500ml.',
        precio: 1000,
        estado: true,
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
  } catch (error) {
    console.error('❌ Error al ejecutar el seed de demo:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedDemo();
