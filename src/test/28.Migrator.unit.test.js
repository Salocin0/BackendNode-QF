import * as chai from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { runMigrations, migrationsEnabled, MIGRATIONS_LOCK_KEY } from '../util/migrator.js';
import { up as up1 } from '../migrations/20261006000000-add-evento-capacity-columns.js';

const expect = chai.expect;
const silent = { info() {}, warn() {}, error() {}, debug() {} };

// In-memory sequelize double: the storage table is a Set; queries and tx outcomes are recorded.
const fakeSequelize = () => {
  const log = { queries: [], commits: 0, rollbacks: 0 };
  const executed = new Set();
  const makeTx = () => ({
    commit: async () => {
      log.commits++;
    },
    rollback: async () => {
      log.rollbacks++;
    },
  });
  const model = {
    sync: async () => {},
    findAll: async () => [...executed].map((name) => ({ name })),
    create: async ({ name }) => {
      executed.add(name);
    },
    destroy: async ({ where }) => {
      executed.delete(where.name);
    },
  };
  return {
    log,
    executed,
    getDialect: () => 'postgres',
    getQueryInterface: () => ({}),
    transaction: async () => makeTx(),
    query: async (sql, opts) => {
      log.queries.push({ sql, opts });
      return [[], 0];
    },
    constructor: { DataTypes: { STRING: 'STRING' } },
    dialect: { name: 'postgres' },
    isDefined: () => false,
    define: () => model,
    model: () => model,
  };
};

const makeDir = (names) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'mig-'));
  for (const n of names) writeFileSync(path.join(dir, n), '// stub');
  return dir;
};

describe('runMigrations (unit, stubbed sequelize)', () => {
  let order;
  let modules;
  beforeEach(() => {
    order = [];
    modules = {};
  });
  const loader = (file) => modules[path.basename(file)];
  const mig = (name, fail = false) => ({
    up: async () => {
      order.push(name);
      if (fail) throw new Error('boom');
    },
    down: async () => {},
  });
  const opts = (dir, env = {}) => ({ migrationsDir: dir, loadMigration: loader, logger: silent, env });

  it('executes pending migrations in timestamp order and requests the advisory lock', async () => {
    const dir = makeDir(['20260102000000-b.js', '20260101000000-a.js']);
    modules = { '20260101000000-a.js': mig('a'), '20260102000000-b.js': mig('b') };
    const db = fakeSequelize();
    const names = await runMigrations(db, opts(dir));
    expect(names).to.deep.equal(['20260101000000-a.js', '20260102000000-b.js']);
    expect(order).to.deep.equal(['a', 'b']);
    expect(db.log.queries.some((q) => /lock_timeout/.test(q.sql))).to.equal(true);
    const lock = db.log.queries.find((q) => /pg_advisory_xact_lock/.test(q.sql));
    expect(lock.opts.replacements.key).to.equal(MIGRATIONS_LOCK_KEY);
  });

  it('skips migrations that were already executed', async () => {
    const dir = makeDir(['20260101000000-a.js', '20260102000000-b.js']);
    modules = { '20260101000000-a.js': mig('a'), '20260102000000-b.js': mig('b') };
    const db = fakeSequelize();
    db.executed.add('20260101000000-a.js');
    await runMigrations(db, opts(dir));
    expect(order).to.deep.equal(['b']);
  });

  it('a failing migration rolls back, aborts the run and flags the error as fatal', async () => {
    const dir = makeDir(['20260101000000-a.js', '20260102000000-b.js', '20260103000000-c.js']);
    modules = {
      '20260101000000-a.js': mig('a'),
      '20260102000000-b.js': mig('b', true),
      '20260103000000-c.js': mig('c'),
    };
    const db = fakeSequelize();
    let error;
    try {
      await runMigrations(db, opts(dir));
    } catch (e) {
      error = e;
    }
    expect(error).to.be.an('error');
    expect(error.isMigrationFailure).to.equal(true);
    expect(order).to.deep.equal(['a', 'b']);
    expect(db.executed.has('20260102000000-b.js')).to.equal(false);
    expect(db.log.rollbacks).to.be.greaterThan(1);
  });

  it('RUN_MIGRATIONS=false skips everything (no queries, no lock)', async () => {
    const dir = makeDir(['20260101000000-a.js']);
    modules = { '20260101000000-a.js': mig('a') };
    const db = fakeSequelize();
    const names = await runMigrations(db, opts(dir, { RUN_MIGRATIONS: 'false' }));
    expect(names).to.deep.equal([]);
    expect(order).to.deep.equal([]);
    expect(db.log.queries).to.have.length(0);
    expect(migrationsEnabled({})).to.equal(true);
    expect(migrationsEnabled({ RUN_MIGRATIONS: 'FALSE' })).to.equal(false);
  });
});

describe('migration #1 add-evento-capacity-columns', () => {
  it('is idempotent SQL (ADD COLUMN IF NOT EXISTS) inside the given transaction', async () => {
    const queries = [];
    const sequelize = { getDialect: () => 'postgres', query: async (sql, o) => queries.push({ sql, o }) };
    const tx = { id: 1 };
    await up1({ context: { options: { transaction: tx } }, sequelize });
    expect(queries.map((q) => q.sql)).to.deep.equal([
      'ALTER TABLE "eventos" ADD COLUMN IF NOT EXISTS "capacidadMaxima" INTEGER',
      'ALTER TABLE "eventos" ADD COLUMN IF NOT EXISTS "cantidadRepartidores" INTEGER',
    ]);
    expect(queries.every((q) => q.o.transaction === tx)).to.equal(true);
  });

  it('is a no-op outside PostgreSQL', async () => {
    const queries = [];
    await up1({ context: {}, sequelize: { getDialect: () => 'sqlite', query: async (s) => queries.push(s) } });
    expect(queries).to.have.length(0);
  });
});

describe('migration #2 chatbot-ayuda (data migration)', () => {
  it('creates its own table and inserts idempotently (ON CONFLICT DO NOTHING), only into chatbot_ayuda', async () => {
    const { up, AYUDA } = await import('../migrations/20261006010000-chatbot-ayuda.js');
    const queries = [];
    const sequelize = { getDialect: () => 'postgres', query: async (sql, o) => queries.push({ sql, o }) };
    await up({ context: { options: { transaction: 'tx' } }, sequelize });
    expect(queries[0].sql).to.match(/CREATE TABLE IF NOT EXISTS chatbot_ayuda/);
    const inserts = queries.slice(1);
    expect(inserts).to.have.length(AYUDA.length);
    expect(inserts.every((q) => /INSERT INTO chatbot_ayuda/.test(q.sql) && /ON CONFLICT \(tema\) DO NOTHING/.test(q.sql))).to.equal(true);
    expect(queries.every((q) => q.o.transaction === 'tx')).to.equal(true);
    for (const topic of ['pedido', 'registro', 'pago', 'codigo-entrega', 'roles']) {
      expect(AYUDA.map((a) => a.tema)).to.include(topic);
    }
  });
});
