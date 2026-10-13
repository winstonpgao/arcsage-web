export const EXPERIMENT_ID = 'arcsage-contact-cta-v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedEvents = new Set(['exposure', 'contact_intent']);

export function experimentConfig(env = {}) {
  const requested = env.VITE_AB_ENABLED === 'true';
  const endpoint = String(env.VITE_EXPERIMENT_ENDPOINT || '').trim();
  let validEndpoint = false;
  try {
    const u = new URL(endpoint);
    validEndpoint = !u.username && !u.password && !u.search && !u.hash &&
      (u.protocol === 'https:' || (u.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname)));
  } catch { /* No endpoint means measurement is inactive. */ }
  return { id: EXPERIMENT_ID, enabled: requested && validEndpoint, endpoint: validEndpoint ? endpoint : '',
    reason: !requested ? 'disabled' : !validEndpoint ? 'missing_or_invalid_endpoint' : 'enabled' };
}

export function createExperiment({ config, storage, crypto, transport, now = () => new Date() }) {
  const off = reason => ({ active: false, variant: 'A', reason, track: async () => false, flush: async () => false });
  if (!config.enabled) return off(config.reason || 'disabled');
  if (!storage || !crypto?.randomUUID || !crypto?.getRandomValues) return off('assignment_unavailable');
  const assignmentKey = `arcsage:assignment:${config.id}`;
  const queueKey = `arcsage:events:${config.id}`;
  let assignment;
  try {
    const saved = JSON.parse(storage.getItem(assignmentKey) || 'null');
    if (saved?.experiment_id === config.id && UUID.test(saved.visitor_id || '') && ['A', 'B'].includes(saved.variant)) {
      assignment = saved;
    } else {
      const byte = crypto.getRandomValues(new Uint8Array(1))[0];
      assignment = { experiment_id: config.id, visitor_id: crypto.randomUUID(), variant: byte % 2 === 0 ? 'A' : 'B', assigned_at: now().toISOString() };
      storage.setItem(assignmentKey, JSON.stringify(assignment));
    }
  } catch { return off('storage_unavailable'); }
  let queue = [];
  try {
    const saved = JSON.parse(storage.getItem(queueKey) || '[]');
    if (Array.isArray(saved)) queue = saved.filter(e => e?.experiment_id === config.id && e.visitor_id === assignment.visitor_id &&
      e.variant === assignment.variant && UUID.test(e.event_id || '') && allowedEvents.has(e.event_name)).slice(-50);
  } catch { /* Corrupted queue is not treated as measured traffic. */ }
  let inFlight;
  const persist = () => { try { storage.setItem(queueKey, JSON.stringify(queue)); } catch { /* Queue remains in memory. */ } };
  const flush = () => {
    if (inFlight) return inFlight;
    inFlight = (async () => {
      let sent = false;
      while (queue.length) {
        let ok = false;
        try { ok = await transport(config.endpoint, queue[0]); } catch { break; }
        if (!ok) break;
        queue.shift(); persist(); sent = true;
      }
      return sent;
    })().finally(() => { inFlight = undefined; });
    return inFlight;
  };
  let exposureRecorded = queue.some(e => e.event_name === 'exposure');
  const track = (eventName, path = '/contact') => {
    if (!allowedEvents.has(eventName)) return Promise.resolve(false);
    if (eventName === 'exposure' && exposureRecorded) return flush();
    if (eventName === 'contact_intent' && !exposureRecorded) {
      queue.push({ ...assignment, event_id: crypto.randomUUID(), event_name: 'exposure', occurred_at: now().toISOString(), path: '/contact' });
      delete queue.at(-1).assigned_at;
      exposureRecorded = true;
    }
    const safePath = typeof path === 'string' && path.startsWith('/') ? path.split(/[?#]/)[0].slice(0, 200) : '/contact';
    queue.push({ experiment_id: config.id, variant: assignment.variant, visitor_id: assignment.visitor_id,
      event_id: crypto.randomUUID(), event_name: eventName, occurred_at: now().toISOString(), path: safePath });
    if (eventName === 'exposure') exposureRecorded = true;
    // Preserve the exposure at the front when trimming so an intent never loses its attribution prerequisite.
    if (queue.length > 50) queue.splice(1, queue.length - 50);
    persist(); return flush();
  };
  return { active: true, variant: assignment.variant, reason: 'enabled', track, flush };
}
