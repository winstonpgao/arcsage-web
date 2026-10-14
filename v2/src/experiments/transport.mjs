// A 2xx response alone does not prove that the event reached durable storage.
export async function sendEvent(endpoint, event, fetcher = globalThis.fetch) {
  const response = await fetcher(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event), credentials: 'omit', keepalive: true, cache: 'no-store' });
  if (![200, 201].includes(response.status) || !response.headers.get('content-type')?.toLowerCase().includes('application/json')) return false;
  try {
    const receipt = await response.json();
    return receipt?.accepted === true && typeof receipt.duplicate === 'boolean' && typeof receipt.attribution_status === 'string';
  } catch { return false; }
}
