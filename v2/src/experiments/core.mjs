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
  const eventPrefix = `arcsage:event:${config.id}:`;
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
  // One key per event makes concurrent tab writes independent. Never replace a shared queue.
  const pending = new Map();
  const acknowledged = new Set();
  const validEvent = e => e?.experiment_id === config.id && e.visitor_id === assignment.visitor_id &&
    e.variant === assignment.variant && UUID.test(e.event_id || '') && allowedEvents.has(e.event_name);
  const readPending = () => {
    try {
      const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(k => k?.startsWith(eventPrefix));
      for (const key of keys) {
        try {
          const event = JSON.parse(storage.getItem(key));
          if (validEvent(event) && key === eventPrefix + event.event_id && !acknowledged.has(event.event_id)) pending.set(event.event_id, event);
        } catch { /* Ignore invalid journal entries without deleting another tab's data. */ }
      }
    } catch { /* Retain this controller's memory if storage becomes unavailable. */ }
    return [...pending.values()].sort((a, b) => a.occurred_at.localeCompare(b.occurred_at) ||
      (a.event_name === b.event_name ? a.event_id.localeCompare(b.event_id) : a.event_name === 'exposure' ? -1 : 1));
  };
  const persistEvent = event => {
    pending.set(event.event_id, event);
    try { storage.setItem(eventPrefix + event.event_id, JSON.stringify(event)); } catch { /* Remains in this tab's memory. */ }
  };
  let inFlight;
  const flush = () => {
    if (inFlight) return inFlight;
    inFlight = Promise.resolve().then(async () => {
      let sent = false;
      while (true) {
        const event = readPending()[0];
        if (!event) break;
        let ok = false;
        try { ok = await transport(config.endpoint, event); } catch { break; }
        if (!ok) break;
        pending.delete(event.event_id); acknowledged.add(event.event_id);
        try { storage.removeItem(eventPrefix + event.event_id); } catch { /* A future reload may safely retry this ID. */ }
        sent = true;
      }
      return sent;
    }).finally(() => { inFlight = undefined; });
    return inFlight;
  };
  let exposureRecorded = readPending().some(e => e.event_name === 'exposure');
  const track = (eventName, path = '/contact') => {
    if (!allowedEvents.has(eventName)) return Promise.resolve(false);
    if (eventName === 'exposure' && exposureRecorded) return flush();
    const needsExposure = eventName === 'contact_intent' && !exposureRecorded;
    // At capacity, refuse new events instead of deleting unacknowledged older events.
    if (readPending().length + (needsExposure ? 2 : 1) > 50) return flush();
    if (needsExposure) {
      persistEvent({ experiment_id: config.id, variant: assignment.variant, visitor_id: assignment.visitor_id,
        event_id: crypto.randomUUID(), event_name: 'exposure', occurred_at: now().toISOString(), path: '/contact' });
      exposureRecorded = true;
    }
    const safePath = typeof path === 'string' && path.startsWith('/') ? path.split(/[?#]/)[0].slice(0, 200) : '/contact';
    persistEvent({ experiment_id: config.id, variant: assignment.variant, visitor_id: assignment.visitor_id,
      event_id: crypto.randomUUID(), event_name: eventName, occurred_at: now().toISOString(), path: safePath });
    if (eventName === 'exposure') exposureRecorded = true;
    // An append during the previous drain's completion must get its own drain.
    return inFlight ? inFlight.then(async sent => (await flush()) || sent) : flush();
  };
  return { active: true, variant: assignment.variant, reason: 'enabled', track, flush };
}
