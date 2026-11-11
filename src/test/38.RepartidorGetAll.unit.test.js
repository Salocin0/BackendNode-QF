import * as chai from 'chai';
import { describe, it, afterEach } from 'mocha';
import { repartidorController } from '../controllers/repartidor.controller.js';
import { repartidorService } from '../services/repartidor.service.js';

const expect = chai.expect;
const makeRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
};

// GET /repartidor used to take `req` as `res`: res.status threw inside the catch and the unhandled rejection
// killed the whole API process.
describe('GET /repartidor (stubbed service, no DB)', () => {
  const original = repartidorService.getAll;
  afterEach(() => { repartidorService.getAll = original; });

  it('responds 200 with the couriers', async () => {
    repartidorService.getAll = async () => [{ id: 1 }];
    const res = makeRes();
    await repartidorController.getAllController({}, res);
    expect(res.statusCode).to.equal(200);
    expect(res.body.data).to.deep.equal([{ id: 1 }]);
  });

  it('responds 500 instead of throwing when the service fails', async () => {
    repartidorService.getAll = async () => { throw new Error('db down'); };
    const res = makeRes();
    await repartidorController.getAllController({}, res);
    expect(res.statusCode).to.equal(500);
  });
});
