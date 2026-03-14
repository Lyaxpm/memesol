export async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let err: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      err = e;
    }
  }
  throw err;
}
