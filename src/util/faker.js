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

const provincias = ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Salta', 'Chaco', 'Entre Ríos', 'Misiones', 'San Juan'];
const localidades = ['La Plata', 'Córdoba', 'Rosario', 'Mendoza', 'San Miguel de Tucumán', 'Salta', 'Resistencia', 'Paraná', 'Posadas', 'San Juan'];
const nombres = ['Concierto de Rock', 'Feria de Ciencia', 'Festival Gastronómico'];
const descripciones = ['Un evento emocionante lleno de música.', 'Explora los avances científicos.', 'Disfruta de una variedad de comidas y bebidas.'];
const tiposEvento = ['Música', 'Ciencia', 'Gastronomía'];
const tiposPago = ['Tarjeta', 'Tarjeta', 'Tarjeta'];
const tipoCocina = ['Comida Rápida', 'Cafetería', 'Restaurante Familiar', 'Food Truck', 'Pizzeria', 'Taco Stand', 'Pastelería', 'Heladería'];
// Función para generar usuarios y consumidores uno por uno
export async function generateUsers(count = 100) {
  for (let i = 0; i < count; i++) {
    try {
      const consumidor = await Consumidor.create({
        nombre: faker.name.firstName(),
        apellido: faker.name.lastName(),
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
        usuario: faker.name.firstName() + faker.name.lastName() + faker.name.middleName(),
        email: faker.internet.email(),
        emailValidado: true,
        contraseña: '$2b$10$icYmS6HeA3KGP7jP6ZbXZ.PhckTo63o1xSxReMhTl63LVs/5BcA/.', // hashed password
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
        
        // Random event ID from [6, 7, 8]
        const eventoId = faker.helpers.arrayElement([6, 7, 8]);

        // Create the order with estado "Entregado"
        const pedido = await Pedido.create({
          fecha: new Date(),
          consumidorId: consumidor.id,
          puestoId: puesto.id,
          eventoId: eventoId,
          estado: "Entregado",
          total: 0, // Placeholder for now
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        let total = 0;

        // Create order details and calculate total
        for (let k = 0; k < 5; k++) {
          // Fetch a random product
          const producto = await Producto.findOne({ order: Sequelize.literal('random()') });

          // Random quantity between 1 and 3
          const cantidad = faker.number.int({ min: 1, max: 3 });

          // Add to total (quantity * price)
          total += cantidad * producto.precio;

          // Create the detail for the order
          await DetallePedido.create({
            cantidad: cantidad,
            precio: producto.precio,
            productoId: producto.id,
            pedidoId: pedido.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        // Update the total amount for the order
        await pedido.update({ total });

        console.log(`Pedido ${j + 1} for Consumidor ${consumidor.id} created successfully with total ${total}.`);
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
        razonSocial: 'Puesto´s' + faker.name.firstName(),
        cuit: faker.number.bigInt({ min: 10000000000, max: 99999999999 }),
        estaValido: true,
        habilitado: true,
        condicionIva: 'Monotributista',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const consumidor = await Consumidor.create({
        nombre: faker.name.firstName(),
        apellido: faker.name.lastName(),
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
        usuario: faker.name.firstName() + faker.name.lastName() + faker.name.middleName(),
        email: faker.internet.email(),
        emailValidado: true,
        contraseña: '$2b$10$icYmS6HeA3KGP7jP6ZbXZ.PhckTo63o1xSxReMhTl63LVs/5BcA/.',
        fechaAlta: new Date(),
        habilitado: true,
        tipoUsuario: 'consumidor',
        createdAt: new Date(),
        updatedAt: new Date(),
        consumidorId: consumidor.id,
      });
      for (let j = 0; j < 6; j++) {
        const puesto = await Puesto.create({
          nombreCarro: faker.lorem.word() + ' ' + faker.commerce.productName(), // Usar lorem.word en lugar de bsAdjective
          numeroCarro: faker.number.bigInt({ min: 1, max: 9999 }),
          tipoNegocio: tipoCocina[Math.floor(Math.random() * tipoCocina.length)],
          telefonoCarro: faker.number.bigInt({ min: 10000000000000, max: 999999999999999 }),
          estado: 'Creado',
          encargadoId: 1,
          banner: 'baner',
        });
        for (let k = 0; k < 10; k++) {
          await Producto.create({
            nombre: faker.commerce.productName(),
            descripcion: faker.commerce.productDescription(),
            precio: faker.commerce.price(),
            estado: true,
            puesto: puesto.id,
          });
        }
        Asociacion.create({
          estado: 'Aceptada',
          eventoId: 6,
          puesto: puesto.id,
        });
        Asociacion.create({
          estado: 'Aceptada',
          eventoId: 7,
          puesto: puesto.id,
        });
        Asociacion.create({
          estado: 'Aceptada',
          eventoId: 8,
          puesto: puesto.id,
        });
      }
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
        nombre: faker.name.firstName(),
        apellido: faker.name.lastName(),
        fechaNacimiento: faker.date.birthdate(),
        dni: faker.number.bigInt({ min: 10000000, max: 99999999 }),
        localidad: faker.helpers.arrayElement(localidades),
        provincia: faker.helpers.arrayElement(provincias),
        telefono: faker.number.bigInt({ min: 10000000000000, max: 999999999999999 }),
        habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        encargadoId: repartidor.id,
      });
      await Usuario.create({
        usuario: faker.name.firstName() + faker.name.lastName() + faker.name.middleName(),
        email: faker.internet.email(),
        emailValidado: true,
        contraseña: '$2b$10$icYmS6HeA3KGP7jP6ZbXZ.PhckTo63o1xSxReMhTl63LVs/5BcA/.',
        fechaAlta: new Date(),
        habilitado: true,
        tipoUsuario: 'consumidor',
        createdAt: new Date(),
        updatedAt: new Date(),
        consumidorId: consumidor.id,
      });

      Asociacion.create({
        estado: 'Aceptada',
        eventoId: 6,
        puesto: repartidor.id,
      });
      Asociacion.create({
        estado: 'Aceptada',
        eventoId: 7,
        puesto: repartidor.id,
      });
      Asociacion.create({
        estado: 'Aceptada',
        eventoId: 8,
        puesto: repartidor.id,
      });
      Asociacion.create({
        estado: 'Aceptada',
        eventoId: 6,
        puesto: 1,
      });
      Asociacion.create({
        estado: 'Aceptada',
        eventoId: 7,
        puesto: 1,
      });
      Asociacion.create({
        estado: 'Aceptada',
        eventoId: 8,
        puesto: 1,
      });

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
        longitud: faker.address.longitude(),
        latitud: faker.address.latitude(),
        cantidadDiasEvento: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        productorId: 1,
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
  await generateEvents(3); //crear 3 eventos para el producto 1 de tematica distinta //crear 3 dias de evento para cada uno con duracion de 6 horas
  await generateEncargado(1); //crear un encargado de puesto //crear 6 puestos para distintos 3 para el EP 1 y 3 para el EP 2 //crear 10 productos (comida/bebida) para cada puesto con la tematica correspondiente  //crear 6 asociaciones para los puestos a los eventos
  await generateRepartidor(1); //crear un repartidor //crear 2 asociaciones para el repartidor 1 y 2 a los 3 eventos

  await generateUsers(100); //crear 100 consumidores distintos
  //crear 5 compras por consumidor a puestos distintos, horas distintas, a lo largo del evento y con cantidades distintas //crear para los pedidos que aproximadamente 1 de cada 5 se califiquen
}
