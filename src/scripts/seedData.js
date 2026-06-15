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
import { generateAllData } from '../util/faker.js';
import { createHashPW } from '../util/bcrypt.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedData() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    console.log('🔄 Generando datos de prueba con Faker...');
    await generateAllData();

    // Actualizar todas las contraseñas al default '123123123'
    const hashed = createHashPW('123123123');
    await Usuario.update({ contraseña: hashed }, { where: {} });

    console.log('✅ Datos de prueba generados exitosamente.');
    console.log('   Usuarios creados con contraseña: 123123123');
  } catch (error) {
    console.error('❌ Error al generar datos:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedData();
