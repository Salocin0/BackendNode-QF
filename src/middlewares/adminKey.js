// Simple shared-secret guard for the maintenance endpoints (/seed, /seed/demo,
// /resetear/db, /admin/reset-db). These wipe or rewrite the whole database, so they
// must not be reachable by anyone who happens to know the URL.
//
// The secret comes from ADMIN_KEY. If it is not set, the endpoints stay open in
// development (so local work is not blocked) but are refused in production, which
// fails safe instead of silently exposing a destructive route.
//
// Accepted forms:
//   - Header  x-admin-key: <secret>
//   - Query   ?key=<secret>
//   - Body    { "key": "<secret>" }   (POST only)

const readProvidedKey = (req) => {
  const fromHeader = req.get?.('x-admin-key') || req.headers?.['x-admin-key'];
  if (fromHeader) return String(fromHeader);
  if (req.query?.key) return String(req.query.key);
  if (req.body?.key) return String(req.body.key);
  return '';
};

const isProduction = () =>
  ['production', 'prod'].includes(String(process.env.NODE_ENV || '').toLowerCase());

/**
 * Express middleware. Returns 401 when the key is missing or wrong, and 503 when
 * no key is configured in production.
 */
export const requireAdminKey = (req, res, next) => {
  const expected = process.env.ADMIN_KEY;

  if (!expected) {
    if (isProduction()) {
      return res.status(503).json({
        status: 'error',
        msg: 'ADMIN_KEY no está configurada: los endpoints de mantenimiento están deshabilitados.',
        data: {},
      });
    }
    // Sin clave configurada en desarrollo: se permite, para no frenar el trabajo local.
    return next();
  }

  const provided = readProvidedKey(req);
  if (!provided || provided !== expected) {
    return res.status(401).json({
      status: 'error',
      msg: 'Clave de administrador inválida o ausente.',
      data: {},
    });
  }

  return next();
};

export { readProvidedKey };
