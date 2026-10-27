import * as chai from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { requireAdminKey } from '../middlewares/adminKey.js';

const expect = chai.expect;

// Pure unit tests: fake req/res, no server and no DB.
const makeRes = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const makeReq = ({ headers = {}, query = {}, body = {} } = {}) => ({
  headers,
  query,
  body,
  get(name) {
    return headers[name.toLowerCase()];
  },
});

const run = (req) => {
  const res = makeRes();
  let called = false;
  requireAdminKey(req, res, () => {
    called = true;
  });
  return { res, called };
};

describe('requireAdminKey (unit, no server/DB required)', () => {
  const originalKey = process.env.ADMIN_KEY;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    delete process.env.ADMIN_KEY;
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    if (originalKey === undefined) delete process.env.ADMIN_KEY;
    else process.env.ADMIN_KEY = originalKey;
    process.env.NODE_ENV = originalEnv;
  });

  it('allows the request when no key is configured in development', () => {
    const { called, res } = run(makeReq());
    expect(called).to.equal(true);
    expect(res.statusCode).to.equal(200);
  });

  it('refuses with 503 when no key is configured in production', () => {
    process.env.NODE_ENV = 'production';
    const { called, res } = run(makeReq());
    expect(called).to.equal(false);
    expect(res.statusCode).to.equal(503);
    expect(res.body.status).to.equal('error');
  });

  it('accepts the key from the x-admin-key header', () => {
    process.env.ADMIN_KEY = 'secreto';
    const { called } = run(makeReq({ headers: { 'x-admin-key': 'secreto' } }));
    expect(called).to.equal(true);
  });

  it('accepts the key from the query string', () => {
    process.env.ADMIN_KEY = 'secreto';
    const { called } = run(makeReq({ query: { key: 'secreto' } }));
    expect(called).to.equal(true);
  });

  it('accepts the key from the body', () => {
    process.env.ADMIN_KEY = 'secreto';
    const { called } = run(makeReq({ body: { key: 'secreto' } }));
    expect(called).to.equal(true);
  });

  it('rejects a wrong key with 401', () => {
    process.env.ADMIN_KEY = 'secreto';
    const { called, res } = run(makeReq({ headers: { 'x-admin-key': 'otra-cosa' } }));
    expect(called).to.equal(false);
    expect(res.statusCode).to.equal(401);
  });

  it('rejects a missing key with 401', () => {
    process.env.ADMIN_KEY = 'secreto';
    const { called, res } = run(makeReq());
    expect(called).to.equal(false);
    expect(res.statusCode).to.equal(401);
  });
});
