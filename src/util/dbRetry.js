function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableDbError(error) {
  const message = String(error?.message || '').toLowerCase();
  const parentMessage = String(error?.parent?.message || '').toLowerCase();
  const code = String(error?.original?.code || error?.parent?.code || error?.code || '').toUpperCase();

  if (code === 'ECONNRESET' || code === '57P03') {
    return true;
  }

  const retryableFragments = [
    'database system is starting up',
    'the database system is starting up',
    'terminating connection',
    'connection terminated unexpectedly',
    'read econnreset',
    'could not connect to server',
    'connection refused',
    'sequelizeconnectionerror',
    'timeout',
  ];

  return retryableFragments.some((fragment) => message.includes(fragment) || parentMessage.includes(fragment));
}

export async function withDbRetry(operationName, operation, options = {}) {
  const attempts = Number(options.attempts || process.env.DB_RETRY_ATTEMPTS || 12);
  const baseDelayMs = Number(options.baseDelayMs || process.env.DB_RETRY_DELAY_MS || 2000);

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const retryable = isRetryableDbError(error);
      if (!retryable || attempt === attempts) {
        throw error;
      }
      console.warn(
        `Error transitorio en DB al ${operationName}. Reintento ${attempt}/${attempts} en ${baseDelayMs}ms:`,
        error.message || error
      );
      await sleep(baseDelayMs);
    }
  }

  throw lastError;
}
