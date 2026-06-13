// dataGenerator.js
import { faker } from '@faker-js/faker';
import { Usuario } from '../DAO/models/users.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Evento } from '../DAO/models/evento.model.js';
import { DiaEvento } from '../DAO/models/diaEvento.model.js';
import { Encargado } from '../DAO/models/encargado.model.js';
import { Puesto } from '../DAO/models/puesto.model.js';
import { Producto } from '../DAO/models/producto.model.js';
import { Asociacion } from '../DAO/models/asociacion.model.js';
import { Repartidor } from '../DAO/models/repartidor.model.js';
import { Pedido } from '../DAO/models/pedido.model.js';
import { DetallePedido } from '../DAO/models/detallePedido.model.js';
import { Sequelize } from 'sequelize';
import { Productor } from '../DAO/models/Productor.model.js';
import { ValoracionPuesto } from '../DAO/models/valoracionCarrito.model.js';

const provincias = ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Salta', 'Chaco', 'Entre Ríos', 'Misiones', 'San Juan'];
const localidades = ['La Plata', 'Córdoba', 'Rosario', 'Mendoza', 'San Miguel de Tucumán', 'Salta', 'Resistencia', 'Paraná', 'Posadas', 'San Juan'];
const nombres = [
  'Concierto de Rock', 'Feria de Ciencia', 'Festival Gastronómico',
  'Noche de Jazz', 'Exposición de Arte', 'Feria de Artesanías',
  'Festival de Cine', 'Maratón Musical'
];
const descripciones = [
  'Un evento emocionante lleno de música.',
  'Explora los avances científicos.',
  'Disfruta de una variedad de comidas y bebidas.',
  'Una noche mágica con los mejores músicos de jazz.',
  'Descubre obras de artistas locales e internacionales.',
  'Artesanías únicas hechas por artesanos de la región.',
  'Lo mejor del cine independiente en una sola pantalla.',
  'Una jornada musical ininterrumpida con bandas en vivo.'
];
const tiposEvento = ['Música', 'Ciencia', 'Gastronomía', 'Arte', 'Cine', 'Feria', 'Deportivo', 'Teatro'];
const tiposPago = ['Tarjeta', 'Efectivo', 'Transferencia', 'Tarjeta', 'Efectivo', 'Tarjeta', 'Transferencia', 'Efectivo'];
const tipoCocina = ['Comida Rápida', 'Cafetería', 'Restaurante Familiar', 'Food Truck', 'Pizzeria', 'Taco Stand', 'Pastelería', 'Heladería'];
const PRODUCTOR_SEED_RAZON_SOCIAL = 'Productor Seed Default';
// Función para generar usuarios y consumidores uno por uno

async function getOrCreateSeedProductor() {
  const [productor] = await Productor.findOrCreate({
    where: { razonSocial: PRODUCTOR_SEED_RAZON_SOCIAL },
    defaults: {
      cuit: faker.number.bigInt({ min: 10000000000, max: 99999999999 }),
      razonSocial: PRODUCTOR_SEED_RAZON_SOCIAL,
      estaValido: true,
      habilitado: true,
      condicionIva: 'Monotributista',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return productor;
}

// Helper: devolver un evento existente aleatorio o crear uno mínimo si no existen
async function pickRandomEventoIdOrCreate() {
  const eventos = await Evento.findAll({ attributes: ['id'] });
  if (eventos && eventos.length > 0) {
    return faker.helpers.arrayElement(eventos.map(e => e.id));
  }

  // No hay eventos: crear un evento "hoy" como fallback
  const productor = await getOrCreateSeedProductor();
  const ahora = new Date();
  const hoy10am = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 10, 0, 0);

  const ev = await Evento.create({
    nombre: 'Evento Seed Auto',
    descripcion: 'Evento creado automáticamente por el seeder',
    tipoEvento: 'Gastronomía',
    tipoPago: 'Tarjeta',
    cantidadPuestos: 3,
    conButaca: false,
    conRepartidor: true,
    tienePreventa: false,
    linkVentaEntradas: '',
    ubicacion: '',
    habilitado: true,
    localidad: faker.helpers.arrayElement(localidades),
    provincia: faker.helpers.arrayElement(provincias),
    img: '',
    estado: 'EnCurso',
    longitud: faker.location.longitude(),
    latitud: faker.location.latitude(),
    cantidadDiasEvento: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    productorId: productor.id,
  });

  // Crear día de evento para hoy
  await DiaEvento.create({
    nombre: 'Día automático',
    descripcion: 'Día creado automáticamente',
    fechaHoraInicioDiaEvento: hoy10am,
    fechaHoraFinDiaEvento: new Date(hoy10am.getTime() + 7 * 60 * 60 * 1000),
    tienePreventa: false,
    eventoId: ev.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return ev.id;
}

export async function generateUsers(count = 10) {
  for (let i = 0; i < count; i++) {
    try {
      const consumidor = await Consumidor.create({
        nombre: faker.person.fullName(),
        apellido: faker.person.lastName(),
        fechaNacimiento: faker.date.birthdate(),
        dni: faker.number.bigInt({ min: 10000000, max: 99999999 }),
        localidad: faker.helpers.arrayElement(localidades),
        provincia: faker.helpers.arrayElement(provincias),
        telefono: faker.number.bigInt({ min: 10000000000000, max: 999999999999999 }),
        habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const usuario = await Usuario.create({
        usuario: faker.person.firstName() + faker.person.lastName() + faker.person.middleName(),
        email: faker.internet.email(),
        emailValidado: true,
        contraseña: '$2b$10$r0eqwWy3mo9xWFo9t4NVFetBAt88AT5GbK2vMkcJWEHoYL.TPvjLK', // hashed password
        fechaAlta: new Date(),
        habilitado: true,
        tipoUsuario: 'consumidor',
        createdAt: new Date(),
        updatedAt: new Date(),
        consumidorId: consumidor.id,
      });

      // Create orders for the consumer
      const ordenesPorUsuario = faker.number.int({ min: 8, max: 12 });
      for (let j = 0; j < ordenesPorUsuario; j++) {
        // Fetch a random "puesto" (shop)
        const puesto = await Puesto.findOne({ order: Sequelize.literal('random()') });
        if (!puesto) {
          console.warn('No se encontró un puesto aleatorio, se omite este pedido');
          continue;
        }

        // Obtener un evento válido (si no existen, se crea uno mínimo)
        const eventoId = await pickRandomEventoIdOrCreate();

        // Fetch event days for the selected event
        const diasEvento = await DiaEvento.findAll({ where: { eventoId } });
        if (diasEvento.length === 0) {
          console.warn(`No se encontraron días para el evento ${eventoId}.`);
          continue; // Saltar al siguiente pedido si no hay días para el evento
        }

        // Elegir un día aleatorio de los días del evento
        const diaEvento = faker.helpers.arrayElement(diasEvento);

        // Generar una fecha aleatoria dentro del día
        const fechaInicio = new Date(diaEvento.fechaHoraInicioDiaEvento);
        const fechaFin = new Date(diaEvento.fechaHoraFinDiaEvento);

        const fechaPedido = new Date(faker.date.between({ from: fechaInicio, to: fechaFin }));

        // Calcular un desplazamiento aleatorio entre 10 y 25 minutos (en milisegundos)
        const minutosAdicionales = Math.floor(Math.random() * (25 - 10 + 1) + 10); // Aleatorio entre 10 y 25
        const fechaEntrega = new Date(fechaPedido.getTime() + minutosAdicionales * 60 * 1000);

        // Determinar el estado del pedido según la línea temporal
        const ahora = new Date();
        const esPedidoPasado = fechaEntrega < ahora;
        const esPedidoFuturo = fechaPedido > ahora;

        let estado;
        if (esPedidoPasado) {
          // Evento pasado → Entregado o Valorado (para estadísticas)
          estado = Math.random() < 0.35 ? 'Valorado' : 'Entregado';
        } else if (esPedidoFuturo) {
          // Evento futuro → preventa o pendiente
          estado = Math.random() < 0.7 ? 'Precomprado' : 'Pendiente';
        } else {
          // Evento activo → mezcla de estados del flujo activo
          const estadosActivos = ['Pendiente', 'Aceptado', 'EnPreparacion', 'EnCamino', 'Entregado'];
          estado = faker.helpers.arrayElement(estadosActivos);
        }

        // Crear el pedido
        const pedido = await Pedido.create({
          fecha: fechaPedido,
          consumidorId: consumidor.id,
          puestoId: puesto.id,
          eventoId: eventoId,
          estado,
          total: 0, // Placeholder for now
          createdAt: new Date(),
          updatedAt: new Date(),
          fechaEntrega: fechaEntrega,
        });

        let total = 0;

        // Create order details and calculate total
        for (let k = 0; k <= 5; k++) {
          // Fetch a random product
          const producto = await Producto.findOne({
            where: { puestoId: puesto.id }, // Filtra por el puesto específico
            order: Sequelize.literal('random()'), // Ordena aleatoriamente y obtiene uno
          });
          if (producto) {
            // Random quantity between 1 and 3
            const cantidad = faker.number.int({ min: 1, max: 3 });

            // Add to total (quantity * price)
            total += cantidad * producto.precio;

            // Create the detail for the order
            await DetallePedido.create({
              cantidad: cantidad,
              precio: producto.precio,
              productoId: producto.id,
              PedidoId: pedido.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }

        // Update the total amount for the order
        await pedido.update({ total });

        // If the order is "Valorado", create a rating
        if (estado === 'Valorado') {
          const calificacion = faker.number.int({ min: 1, max: 5 });
          const comentario = faker.lorem.sentence();

          await ValoracionPuesto.create({
            puntuacion: calificacion,
            puestoId: puesto.id,
            opinion: comentario,
            pedidoId: pedido.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          console.log(`Pedido ${j + 1} para Consumidor ${consumidor.id} creado con estado "Valorado" y una valoración de ${calificacion}.`);
        } else {
          console.log(`Pedido ${j + 1} para Consumidor ${consumidor.id} creado exitosamente con total ${total}.`);
        }
      }

      console.log(`Usuario ${i + 1} y Consumidor ${consumidor.id} creados exitosamente.`);
    } catch (error) {
      console.error(`Error creando usuario y consumidor en iteración ${i + 1}:`, error);
    }
  }
}

export async function generateEncargado(count) {
  for (let i = 0; i < count; i++) {
    try {
      const encargado = await Encargado.create({
        razonSocial: 'Puesto´s' + faker.person.firstName(),
        cuit: faker.number.bigInt({ min: 10000000000, max: 99999999999 }),
        estaValido: true,
        habilitado: true,
        condicionIva: 'Monotributista',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Primero crear puestos/productos, así usuarios y pedidos siempre encuentran datos válidos.
      for (let j = 0; j < 5; j++) {
        const puesto = await Puesto.create({
          nombreCarro: faker.lorem.word() + ' ' + faker.commerce.productName(), // Usar lorem.word en lugar de bsAdjective
          numeroCarro: faker.number.bigInt({ min: 1, max: 9999 }),
          tipoNegocio: tipoCocina[Math.floor(Math.random() * tipoCocina.length)],
          telefonoCarro: faker.number.bigInt({ min: 10000000000000, max: 999999999999999 }),
          estado: 'Creado',
          encargadoId: encargado.id,
          banner: 'baner',
        });
        for (let k = 0; k < 10; k++) {
          await Producto.create({
            nombre: faker.commerce.productName(),
            descripcion: faker.commerce.productDescription(),
            precio: faker.commerce.price(),
            estado: true,
            puestoId: puesto.id,
          });
        }
        // Asociaciones: usar eventos válidos
        const ev1 = await pickRandomEventoIdOrCreate();
        if (ev1) await Asociacion.create({ estado: 'Aceptada', eventoId: ev1, puestoId: puesto.id });
        const ev2 = await pickRandomEventoIdOrCreate();
        if (ev2) await Asociacion.create({ estado: 'Aceptada', eventoId: ev2, puestoId: puesto.id });
        const ev3 = await pickRandomEventoIdOrCreate();
        if (ev3) await Asociacion.create({ estado: 'Aceptada', eventoId: ev3, puestoId: puesto.id });
      }

      const consumidor = await Consumidor.create({
        nombre: faker.person.firstName(),
        apellido: faker.person.lastName(),
        fechaNacimiento: faker.date.birthdate(),
        dni: faker.number.bigInt({ min: 10000000, max: 99999999 }),
        localidad: faker.helpers.arrayElement(localidades),
        provincia: faker.helpers.arrayElement(provincias),
        telefono: faker.number.bigInt({ min: 10000000000000, max: 999999999999999 }),
        habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        encargadoId: encargado.id,
      });
      await Usuario.create({
        usuario: faker.person.firstName() + faker.person.lastName() + faker.person.middleName(),
        email: faker.internet.email(),
        emailValidado: true,
        contraseña: '$2b$10$r0eqwWy3mo9xWFo9t4NVFetBAt88AT5GbK2vMkcJWEHoYL.TPvjLK',
        fechaAlta: new Date(),
        habilitado: true,
        tipoUsuario: 'consumidor',
        createdAt: new Date(),
        updatedAt: new Date(),
        consumidorId: consumidor.id,
      });

      console.log(`puestos productos creados`);
    } catch (error) {
      console.error(`Error creando puestos y productos`, error);
    }
  }
}

export async function generateRepartidor(count) {
  for (let i = 0; i < count; i++) {
    try {
      const repartidor = await Repartidor.create({
        estaValido: true,
        habilitado: true,
      });
      const consumidor = await Consumidor.create({
        nombre: faker.person.firstName(),
        apellido: faker.person.lastName(),
        fechaNacimiento: faker.date.birthdate(),
        dni: faker.number.bigInt({ min: 10000000, max: 99999999 }),
        localidad: faker.helpers.arrayElement(localidades),
        provincia: faker.helpers.arrayElement(provincias),
        telefono: faker.number.bigInt({ min: 10000000000000, max: 999999999999999 }),
        habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        repartidorId: repartidor.id,
      });
      await Usuario.create({
        usuario: faker.person.firstName() + faker.person.lastName() + faker.person.middleName(),
        email: faker.internet.email(),
        emailValidado: true,
        contraseña: '$2b$10$r0eqwWy3mo9xWFo9t4NVFetBAt88AT5GbK2vMkcJWEHoYL.TPvjLK',
        fechaAlta: new Date(),
        habilitado: true,
        tipoUsuario: 'consumidor',
        createdAt: new Date(),
        updatedAt: new Date(),
        consumidorId: consumidor.id,
      });

      // Crear asociaciones solo con eventos válidos
      const evA = await pickRandomEventoIdOrCreate();
      if (evA) await Asociacion.create({ estado: 'Aceptada', eventoId: evA, repartidoreId: repartidor.id });
      const evB = await pickRandomEventoIdOrCreate();
      if (evB) await Asociacion.create({ estado: 'Aceptada', eventoId: evB, repartidoreId: repartidor.id });
      const evC = await pickRandomEventoIdOrCreate();
      if (evC) await Asociacion.create({ estado: 'Aceptada', eventoId: evC, repartidoreId: repartidor.id });

      console.log(`puestos productos creados`);
    } catch (error) {
      console.error(`Error creando puestos y productos`, error);
    }
  }
}

export async function generateEvents() {
  const ahora = new Date();
  const productor = await getOrCreateSeedProductor();

  // Configuración de cada evento: [estado, tipo fecha, tienePreventa]
  const configs = [
    // ── PASADOS (Finalizado) ──
    { estado: 'Finalizado', rangoDias: [-180, -90], tienePreventa: false, habilitado: true },
    { estado: 'Finalizado', rangoDias: [-90, -30],  tienePreventa: true,  habilitado: true },
    // ── ACTUALES (EnCurso) ──
    { estado: 'EnCurso',     rangoDias: [-2, 1],     tienePreventa: true,  habilitado: true },
    { estado: 'EnCurso',     rangoDias: [0, 2],      tienePreventa: false, habilitado: true },
    // ── FUTUROS ──
    { estado: 'Confirmado',  rangoDias: [7, 14],     tienePreventa: true,  habilitado: true },
    { estado: 'EnPreparacion', rangoDias: [21, 60],  tienePreventa: false, habilitado: true },
    // ── BORDES ──
    { estado: 'Cancelado',   rangoDias: [-60, -30],  tienePreventa: false, habilitado: false },
    { estado: 'Pausado',     rangoDias: [-3, 1],     tienePreventa: true,  habilitado: true },
  ];

  for (let i = 0; i < configs.length; i++) {
    try {
      const { estado, rangoDias, tienePreventa, habilitado } = configs[i];

      // Fecha base del evento dentro del rango en días desde hoy
      const diasOffset = faker.number.int({ min: rangoDias[0], max: rangoDias[1] });
      const fechaBase = new Date(ahora.getTime() + diasOffset * 24 * 60 * 60 * 1000);
      // Ajustar a las 10:00 AM para consistencia
      fechaBase.setHours(10, 0, 0, 0);

      const fechaInicioPreventa = tienePreventa
        ? new Date(fechaBase.getTime() - faker.number.int({ min: 7, max: 30 }) * 24 * 60 * 60 * 1000)
        : null;

      const evento = await Evento.create({
        nombre: nombres[i % nombres.length],
        descripcion: descripciones[i % descripciones.length],
        tipoEvento: tiposEvento[i % tiposEvento.length],
        tipoPago: tiposPago[i % tiposPago.length],
        cantidadPuestos: faker.number.int({ min: 4, max: 15 }),
        conButaca: faker.datatype.boolean(),
        conRepartidor: true,
        tienePreventa,
        fechaInicioPreventa,
        linkVentaEntradas: tienePreventa ? faker.internet.url() : '',
        ubicacion: faker.location.streetAddress(),
        habilitado,
        localidad: faker.helpers.arrayElement(localidades),
        provincia: faker.helpers.arrayElement(provincias),
        img: '',
        estado,
        longitud: faker.location.longitude(),
        latitud: faker.location.latitude(),
        cantidadDiasEvento: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        productorId: productor.id,
      });

      // Crear 3 días de evento escalonados
      for (let j = 0; j < 3; j++) {
        const fechaInicioDia = new Date(fechaBase.getTime() + j * 24 * 60 * 60 * 1000);
        const fechaFinDia = new Date(fechaInicioDia.getTime() + 7 * 60 * 60 * 1000); // +7 horas

        await DiaEvento.create({
          nombre: `Día ${j + 1} - ${faker.lorem.words(2)}`,
          descripcion: faker.lorem.sentence(),
          fechaHoraInicioDiaEvento: fechaInicioDia,
          fechaHoraFinDiaEvento: fechaFinDia,
          tienePreventa: faker.datatype.boolean(),
          eventoId: evento.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      console.log(`✅ Evento "${evento.nombre}" [${evento.estado}] creado (ID ${evento.id})`);
    } catch (error) {
      console.error(`Error creando evento ${i + 1}:`, error);
    }
  }
}

// Función principal para generar diferentes tipos de datos
export async function generateAllData() {
  try {
    console.log("✅ Generando datos de prueba...");
    await generateEvents();
    await generateEncargado(1);
    await generateRepartidor(1);
    await generateUsers(6);

    console.log("🎉 Datos generados exitosamente.");
    console.log("👤 Cantidad de usuarios en la base de datos:", await Usuario.count())
  } catch (error) {
    console.error("⚠️ Error al verificar usuarios o generar datos:", error);
  }
}
