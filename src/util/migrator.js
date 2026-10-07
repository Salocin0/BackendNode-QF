import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SequelizeStorage, Umzug } from 'umzug';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_MIGRATIONS_DIR = path.resolve(here, '../migrations');
// Arbitrary constant key shared by every replica of this app.
export const MIGRATIONS_LOCK_KEY = 727001;
export const LOCK_TIMEOUT = '30s';

export const migrationsEnabled = (env = process.env) => String(env.RUN_MIGRATIONS ?? 'true').toLowerCase() !== 'false';

/**
 * Builds an Umzug instance. Every migration runs inside its own transaction; the transaction is
 * passed to up()/down() as `context.options.transaction` and `transaction` for raw queries.
 */
export function createMigrator(sequelize, { migrationsDir = DEFAULT_MIGRATIONS_DIR, loadMigration, logger = console } = {}) {
  const load = loadMigration || ((file) => import(pathToFileURL(file).href));
  const files = readdirSync(migrationsDir).filter((f) => /^\d{14}-.+\.js$/.test(f)).sort();

  return new Umzug({
    migrations: files.map((file) => {
      const filepath = path.join(migrationsDir, file);
      const run = (direction) => async () => {
        const mod = await load(filepath);
        const transaction = await sequelize.transaction();
        try {
          const context = { options: { transaction } };
          await mod[direction]({ context, sequelize, transaction });
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      };
      return { name: file, up: run('up'), down: run('down') };
    }),
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, tableName: 'migrations_log', modelName: 'migrations_log' }),
    logger,
  });
}

/**
 * Runs pending migrations at boot. Serialized across replicas with a transaction-scoped
 * Postgres advisory lock (pg_advisory_xact_lock, bounded by lock_timeout). Throws on failure.
 */
export async function runMigrations(sequelize, options = {}) {
  const { env = process.env, logger = console } = options;
  if (!migrationsEnabled(env)) {
    logger.info?.('RUN_MIGRATIONS=false: migraciones omitidas');
    return [];
  }
  const isPg = sequelize.getDialect() === 'postgres';
  const lockTx = isPg ? await sequelize.transaction() : null;
  try {
    if (isPg) {
      await sequelize.query(`SET LOCAL lock_timeout = '${LOCK_TIMEOUT}'`, { transaction: lockTx });
      await sequelize.query('SELECT pg_advisory_xact_lock(:key)', {
        replacements: { key: MIGRATIONS_LOCK_KEY },
        transaction: lockTx,
      });
    }
    const migrator = createMigrator(sequelize, options);
    const executed = await migrator.up();
    logger.info?.(`Migraciones ejecutadas: ${executed.map((m) => m.name).join(', ') || 'ninguna pendiente'}`);
    return executed.map((m) => m.name);
  } catch (error) {
    logger.error?.('ERROR: falló una migración; se aborta el arranque:', error?.message || error);
    error.isMigrationFailure = true; // lets the boot loop exit instead of retrying forever
    throw error;
  } finally {
    if (lockTx) await lockTx.rollback(); // releases the advisory lock
  }
}
