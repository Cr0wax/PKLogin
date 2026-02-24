export function logEvent(event: string, details?: Record<string, unknown>): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level: 'info',
    event,
    ...(details ? { details } : {}),
  };

  console.log(JSON.stringify(payload));
}

export function logError(event: string, error: unknown, details?: Record<string, unknown>): void {
  const normalizedError = error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { message: String(error) };

  const payload = {
    timestamp: new Date().toISOString(),
    level: 'error',
    event,
    error: normalizedError,
    ...(details ? { details } : {}),
  };

  console.error(JSON.stringify(payload));
}
