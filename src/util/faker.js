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
const nombres = ['Concierto de Rock', 'Feria de Ciencia', 'Festival Gastronómico'];
const descripciones = ['Un evento emocionante lleno de música.', 'Explora los avances científicos.', 'Disfruta de una variedad de comidas y bebidas.'];
const tiposEvento = ['Música', 'Ciencia', 'Gastronomía'];
const tiposPago = ['Tarjeta', 'Tarjeta', 'Tarjeta'];
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

  // No hay eventos: crear productor mínimo si hace falta
  const productor = await getOrCreateSeedProductor();

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
    estado: 'Finalizado',
    longitud: faker.location.longitude(),
    latitud: faker.location.latitude(),
    cantidadDiasEvento: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    productorId: productor.id,
  });

  // Crear al menos un día de evento para que otros seeders lo consuman
  await DiaEvento.create({
    nombre: 'Día automático',
    descripcion: 'Día creado automáticamente',
    fechaHoraInicioDiaEvento: new Date(),
    fechaHoraFinDiaEvento: new Date(Date.now() + 1000 * 60 * 60 * 3),
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
      for (let j = 0; j < 15; j++) {
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

        // Determinar el estado del pedido
        const estado = Math.random() < 0.35 ? 'Valorado' : 'Entregado'; // 35% de probabilidad de ser "Valorado"

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

export async function generateEvents(count) {
  const ahora = new Date();
  const haceUnAno = new Date(ahora.getFullYear() - 1, ahora.getMonth(), ahora.getDate());
  const haceUnMes = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());

  for (let i = 0; i < count; i++) {
    try {
      const fechaHoraInicio = faker.date.between({ from: haceUnAno, to: haceUnMes });
      const fechaHoraFin = [new Date(fechaHoraInicio.getTime() + 1000 * 60 * 60 * 24), fechaHoraInicio.getTime() + 1000 * 60 * 60 * 24 * 1, fechaHoraInicio.getTime() + 1000 * 60 * 60 * 24 * 2];

      const nombre = nombres[i % nombres.length];
      const descripcion = descripciones[i % descripciones.length];
      const tipoEvento = tiposEvento[i % tiposEvento.length];
      const tipoPago = tiposPago[i % tiposPago.length];
      const productor = await getOrCreateSeedProductor();
      // Crear el evento
      const evento = await Evento.create({
        nombre: nombre,
        descripcion: descripcion,
        tipoEvento: tipoEvento,
        tipoPago: tipoPago,
        cantidadPuestos: 6,
        conButaca: false,
        conRepartidor: true,
        tienePreventa: false,
        fechaInicioPreventa: null,
        linkVentaEntradas: faker.internet.url(),
        ubicacion: '',
        habilitado: true,
        localidad: faker.helpers.arrayElement(localidades),
        provincia: faker.helpers.arrayElement(provincias),
        img: '',
        estado: 'Finalizado',
        longitud: faker.location.longitude(),
        latitud: faker.location.latitude(),
        cantidadDiasEvento: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        productorId: productor.id,
      });

      // Crear días de evento
      for (let j = 0; j < 3; j++) {
        try {
          let fechaHoraInicioDia = fechaHoraInicio;
          if (j >= 1) {
            fechaHoraInicioDia = new Date(fechaHoraFin[j]);
          }

          const fechaHoraFinDia = new Date(fechaHoraInicioDia.getTime() + 1000 * 60 * 60 * 7); // 7 horas después para fechaHoraFinDia

          await DiaEvento.create({
            nombre: faker.lorem.words(2),
            descripcion: faker.lorem.sentence(),
            fechaHoraInicioDiaEvento: fechaHoraInicioDia,
            fechaHoraFinDiaEvento: fechaHoraFinDia,
            tienePreventa: faker.datatype.boolean(),
            eventoId: evento.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log(`Día Evento ${j + 1} para ${evento.id} creado exitosamente.`);
        } catch (error) {
          console.error(`Error creando día evento en iteración ${j + 1}:`, error);
        }
      }

      console.log(`Evento ${evento.id} creado exitosamente.`);
    } catch (error) {
      console.error(`Error creando evento y días de evento en iteración ${i + 1}:`, error);
    }
  }
}

// Función principal para generar diferentes tipos de datos (solo usuarios por ahora)
export async function generateAllData() {
  try {
    console.log("✅ Generando datos de prueba...");
    await generateEvents(3);
    await generateEncargado(1);
    await generateRepartidor(1);
    await generateUsers(10);

    console.log("🎉 Datos generados exitosamente.");
    console.log("👤 Cantidad de usuarios en la base de datos:", await Usuario.count())
  } catch (error) {
    console.error("⚠️ Error al verificar usuarios o generar datos:", error);
  }
}
