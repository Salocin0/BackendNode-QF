import * as chai from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { createRateLimiter, resetRateLimiter } from '../middlewares/rateLimiter.js';

const expect = chai.expect;

// Pure unit tests: a fake req/res pair, no server and no LLM call.
const makeRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    set(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

const makeReq = (ip = '10.0.0.1') => ({ ip, socket: { remoteAddress: ip } });

describe('rateLimiter (unit, no server/DB/LLM required)', () => {
  beforeEach(() => resetRateLimiter());

  it('lets requests through while under the limit', () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000 });
    for (let i = 0; i < 3; i++) {
      let called = false;
      const res = makeRes();
      limiter(makeReq(), res, () => {
        called = true;
      });
      expect(called, `request ${i + 1}`).to.equal(true);
      expect(res.statusCode).to.equal(200);
    }
  });

  it('responds 429 with Retry-After once the budget is spent', () => {
    const limiter = createRateLimiter({ max: 2, windowMs: 60_000 });
    const req = makeReq();

    limiter(req, makeRes(), () => {});
    limiter(req, makeRes(), () => {});

    let called = false;
    const res = makeRes();
    limiter(req, res, () => {
      called = true;
    });

    expect(called).to.equal(false);
    expect(res.statusCode).to.equal(429);
    expect(res.headers['Retry-After']).to.be.a('string');
    expect(res.body.status).to.equal('error');
  });

  it('tracks each client IP separately', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 });

    limiter(makeReq('1.1.1.1'), makeRes(), () => {});
    let secondClientCalled = false;
    limiter(makeReq('2.2.2.2'), makeRes(), () => {
      secondClientCalled = true;
    });

    expect(secondClientCalled).to.equal(true);
  });

  it('resets the budget after the window elapses', () => {
    let currentTime = 1_000_000;
    const limiter = createRateLimiter({
      max: 1,
      windowMs: 60_000,
      now: () => currentTime,
    });
    const req = makeReq();

    limiter(req, makeRes(), () => {});

    let blocked = false;
    limiter(req, makeRes(), () => {
      blocked = true;
    });
    expect(blocked).to.equal(false);

    currentTime += 60_001;

    let allowedAgain = false;
    limiter(req, makeRes(), () => {
      allowedAgain = true;
    });
    expect(allowedAgain).to.equal(true);
  });
});
