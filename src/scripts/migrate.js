import { sequelize } from '../util/connections.js';
import { createMigrator, runMigrations } from '../util/migrator.js';

const command = process.argv[2] || 'up';
try {
  if (command === 'up') {
    await runMigrations(sequelize);
  } else if (command === 'down') {
    const reverted = await createMigrator(sequelize).down();
    console.log('Revertidas:', reverted.map((m) => m.name).join(', ') || 'ninguna');
  } else if (command === 'status') {
    const migrator = createMigrator(sequelize);
    const executed = (await migrator.executed()).map((m) => m.name);
    const pending = (await migrator.pending()).map((m) => m.name);
    console.log('Ejecutadas:', executed.join(', ') || '-');
    console.log('Pendientes:', pending.join(', ') || '-');
  } else {
    throw new Error(`Comando desconocido: ${command}`);
  }
  await sequelize.close();
} catch (error) {
  console.error(error);
  process.exit(1);
}
