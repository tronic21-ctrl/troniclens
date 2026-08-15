export async function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 8000) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(ms) });
}