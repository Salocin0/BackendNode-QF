import * as chai from 'chai';
import { describe, it } from 'mocha';
import { Usuario, CAMPOS_PRIVADOS_USUARIO } from '../DAO/models/users.model.js';

const expect = chai.expect;

describe('Usuario JSON never exposes secrets (no DB)', () => {
  const usuario = Usuario.build({
    id: 3, usuario: 'ana', email: 'ana@demo.com', contraseña: '$2b$10$hash', codigoRecuperacion: 'R1',
    codigoValidacion: 'V1', codigoHabilitacion: 'H1', tokenMobile: 'ExponentPushToken[x]', tokenWeb: 'fcm-x', tipoUsuario: 'consumidor',
  });

  it('res.json(usuario) drops password, codes and push tokens', () => {
    const json = JSON.parse(JSON.stringify(usuario));
    CAMPOS_PRIVADOS_USUARIO.forEach((campo) => expect(json).to.not.have.property(campo));
    expect(json).to.include({ id: 3, usuario: 'ana', email: 'ana@demo.com', tipoUsuario: 'consumidor' });
  });

  it('internal code can still read the secrets from the instance', () => {
    expect(usuario.contraseña).to.equal('$2b$10$hash');
    expect(usuario.tokenMobile).to.equal('ExponentPushToken[x]');
  });
});
