import * as chai from 'chai';
import { describe, it, afterEach } from 'mocha';
import { generarCodigoRecuperacion } from '../util/codigoRecuperacion.js';

const expect = chai.expect;

describe('Password recovery code (no DB)', () => {
  const originalNow = Date.now;
  afterEach(() => { Date.now = originalNow; });

  it('is a 64-char hex string', () => {
    expect(generarCodigoRecuperacion()).to.match(/^[0-9a-f]{64}$/);
  });

  it('does not depend on the request time (two codes in the same millisecond differ)', () => {
    Date.now = () => 1731369600000;
    expect(generarCodigoRecuperacion()).to.not.equal(generarCodigoRecuperacion());
  });
});
