import { sequelize } from '../util/connections.js';
import { runSeedDemo } from '../util/seedDemoData.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    // runSeedDemo() ya imprime el resumen final completo (credenciales, evento,
    // pedidos) por consola a medida que siembra los datos, así que no lo
    // repetimos acá — solo dejamos disponible el objeto por si algún caller
    // futuro del script lo necesita.
    await runSeedDemo();
  } catch (error) {
    console.error('❌ Error al ejecutar el seed de demo:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
