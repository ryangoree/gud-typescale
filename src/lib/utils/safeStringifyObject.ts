/**
 * Tries to stringify an object using `JSON.stringify`, but falls back to `String(obj)` if it fails
 * (e.g. due to circular references).
 */
export function safeStringifyObject(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}
