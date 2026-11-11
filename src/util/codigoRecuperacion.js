import crypto from 'crypto';

/**
 * Password-recovery code. It must be unguessable: it is the only secret needed to set a new password.
 * (It used to be sha256(Date.now()), which anyone could reproduce knowing roughly when it was requested.)
 */
export const generarCodigoRecuperacion = () => crypto.randomBytes(32).toString('hex');
