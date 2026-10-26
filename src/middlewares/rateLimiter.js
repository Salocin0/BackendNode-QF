// Minimal in-memory rate limiter for the chatbot endpoint.
// No external dependency: installing express-rate-limit would change package.json and
// therefore the Railway deploy, which we want to avoid for this change.
//
// Scope: one Node process. Railway runs a single replica for this service, so an
// in-memory counter is enough. If replicas are ever added, move the counter to Postgres.

const buckets = new Map();

// Drop expired buckets so the Map cannot grow without bound.
const sweep = (now) => {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

/**
 * Creates an Express middleware limiting each client to `max` requests per `windowMs`.
 * Responds 429 with a Retry-After header once the budget is spent.
 */
export const createRateLimiter = ({
  windowMs = 60_000,
  max = 20,
  keyGenerator = (req) => req.ip || req.socket?.remoteAddress || 'unknown',
  now = () => Date.now(),
} = {}) => {
  return (req, res, next) => {
    const currentTime = now();
    if (buckets.size > 1000) sweep(currentTime);

    const key = keyGenerator(req);
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= currentTime) {
      bucket = { count: 0, resetAt: currentTime + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - currentTime) / 1000));
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        status: 'error',
        msg: 'Demasiadas consultas seguidas. Esperá unos segundos y volvé a intentar.',
        data: {},
      });
    }

    return next();
  };
};

// Test helper: clears all counters between cases.
export const resetRateLimiter = () => buckets.clear();
