// Migration #1: columns added to the Evento model after the first deploy.
// Idempotent: safe on databases where sync() already created them and on fresh ones.
const COLUMNS = ['capacidadMaxima', 'cantidadRepartidores'];

export async function up({ context: queryInterface, sequelize }) {
  if (sequelize.getDialect() !== 'postgres') return; // sqlite/dev DBs are created by sync()
  const transaction = queryInterface.options?.transaction;
  for (const name of COLUMNS) {
    await sequelize.query(`ALTER TABLE "eventos" ADD COLUMN IF NOT EXISTS "${name}" INTEGER`, { transaction });
  }
}

export async function down({ context: queryInterface, sequelize }) {
  if (sequelize.getDialect() !== 'postgres') return;
  for (const name of COLUMNS) {
    await sequelize.query(`ALTER TABLE "eventos" DROP COLUMN IF EXISTS "${name}"`);
  }
}
