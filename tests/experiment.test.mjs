import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createExperiment, experimentConfig, EXPERIMENT_ID } from '../v2/src/experiments/core.mjs'
import { sendEvent } from '../v2/src/experiments/transport.mjs'
const memory = () => { const values = new Map(); return { get length() { return values.size }, key: i => [...values.keys()][i] ?? null,
 getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) } }
const journal = storage => Array.from({ length: storage.length }, (_, i) => storage.key(i))
 .filter(k => k.startsWith(`arcsage:event:${EXPERIMENT_ID}:`)).map(k => JSON.parse(storage.getItem(k)))
const cryptoFor = byte => ({ randomUUID, getRandomValues: a => { a[0] = byte; return a } })
const enabled = experimentConfig({ VITE_AB_ENABLED: 'true', VITE_EXPERIMENT_ENDPOINT: 'http://127.0.0.1:8788/events' })
test('measurement defaults off and cannot activate without an endpoint', () => {
 assert.equal(experimentConfig().enabled, false)
 assert.equal(experimentConfig({ VITE_AB_ENABLED: 'true' }).enabled, false)
 assert.equal(experimentConfig({ VITE_AB_ENABLED: 'true', VITE_EXPERIMENT_ENDPOINT: 'http://public.example/events' }).enabled, false)
 assert.equal(experimentConfig({ VITE_AB_ENABLED: 'true', VITE_EXPERIMENT_ENDPOINT: 'https://user:secret@example.org/events' }).enabled, false)
})
test('enabled endpoint permits HTTPS or local HTTP without credentials/query', () => {
 assert.equal(enabled.enabled, true)
 assert.equal(experimentConfig({ VITE_AB_ENABLED: 'true', VITE_EXPERIMENT_ENDPOINT: 'https://events.example.org/events' }).enabled, true)
 assert.equal(experimentConfig({ VITE_AB_ENABLED: 'true', VITE_EXPERIMENT_ENDPOINT: 'https://events.example.org/events?token=secret' }).enabled, false)
})
test('cryptographic allocation covers both variants and persists the same visitor', () => {
 const storage = memory()
 const a = createExperiment({ config: enabled, storage, crypto: cryptoFor(0), transport: async () => true })
 const stable = createExperiment({ config: enabled, storage, crypto: cryptoFor(1), transport: async () => true })
 const b = createExperiment({ config: enabled, storage: memory(), crypto: cryptoFor(1), transport: async () => true })
 assert.equal(a.variant, 'A'); assert.equal(stable.variant, 'A'); assert.equal(b.variant, 'B')
})
test('storage failure excludes the visitor rather than changing assignment every visit', () => {
 const controller = createExperiment({ config: enabled, storage: { getItem() { throw Error('blocked') } }, crypto: cryptoFor(1), transport: async () => true })
 assert.equal(controller.active, false); assert.equal(controller.variant, 'A')
})
test('control remains untracked when experiment is off', async () => {
 let calls = 0
 const controller = createExperiment({ config: experimentConfig(), storage: memory(), crypto: cryptoFor(1), transport: async () => { calls++; return true } })
 await controller.track('exposure'); await controller.track('contact_intent')
 assert.equal(calls, 0)
})
test('exposure precedes contact intent and payload omits query/PII', async () => {
 const events = []
 const controller = createExperiment({ config: enabled, storage: memory(), crypto: cryptoFor(1), transport: async (_, e) => { events.push({ ...e }); return true } })
 await controller.track('contact_intent', '/contact?email=private@example.org')
 assert.deepEqual(events.map(e => e.event_name), ['exposure', 'contact_intent'])
 assert.equal(events[1].path, '/contact')
 assert.deepEqual(Object.keys(events[1]).sort(), ['event_id','event_name','experiment_id','occurred_at','path','variant','visitor_id'])
})
test('failed network retains exact IDs and order for retry', async () => {
 let available = false; const attempts = []
 const storage = memory()
 const controller = createExperiment({ config: enabled, storage, crypto: cryptoFor(0), transport: async (_, e) => { attempts.push({ ...e }); return available } })
 await controller.track('exposure'); await controller.track('contact_intent')
 const pending = journal(storage)
 assert.equal(pending.length, 2)
 available = true; await controller.flush()
 assert.equal(journal(storage).length, 0)
 assert.equal(attempts.at(-2).event_id, pending[0].event_id)
 assert.equal(attempts.at(-1).event_id, pending[1].event_id)
})
test('unknown events never enter the queue', async () => {
 let calls = 0
 const controller = createExperiment({ config: enabled, storage: memory(), crypto: cryptoFor(0), transport: async () => { calls++; return true } })
 assert.equal(await controller.track('purchase'), false); assert.equal(calls, 0)
})
test('duplicate effect exposures do not inflate browser event emission', async () => {
 const events = []
 const controller = createExperiment({ config: enabled, storage: memory(), crypto: cryptoFor(0), transport: async (_, e) => { events.push(e); return true } })
 await controller.track('exposure'); await controller.track('exposure')
 assert.equal(events.length, 1)
})
test('two offline tabs preserve every pending event and a reload drains them', async () => {
 const storage = memory(); const args = { config: enabled, storage, crypto: cryptoFor(0), transport: async () => false }
 const a = createExperiment(args); const b = createExperiment(args)
 await a.track('contact_intent'); const firstIDs = journal(storage).map(e => e.event_id)
 await b.track('exposure')
 assert.equal(journal(storage).length, 3)
 assert.ok(firstIDs.every(id => journal(storage).some(e => e.event_id === id)))
 const delivered = []; const reloaded = createExperiment({ ...args, transport: async (_, e) => { delivered.push(e); return true } })
 await reloaded.flush()
 assert.equal(journal(storage).length, 0); assert.equal(delivered.length, 3)
 assert.ok(firstIDs.every(id => delivered.some(e => e.event_id === id)))
 assert.equal(delivered[0].event_name, 'exposure')
})
test('empty initialization flush and immediate exposure cannot strand the event', async () => {
 const storage = memory(); const delivered = []
 const controller = createExperiment({ config: enabled, storage, crypto: cryptoFor(0), transport: async (_, e) => { delivered.push(e); return true } })
 const init = controller.flush(); const emission = controller.track('exposure')
 await Promise.all([init, emission])
 assert.equal(delivered.length, 1); assert.equal(journal(storage).length, 0)
})
test('acknowledging an event cannot delete a second tab append during delivery', async () => {
 const storage = memory(); let release; let deliveryStarted
 const started = new Promise(r => { deliveryStarted = r }); const paused = new Promise(r => { release = r }); let first = true
 const delivered = []; const a = createExperiment({ config: enabled, storage, crypto: cryptoFor(0), transport: async (_, e) => {
   if (first) { first = false; deliveryStarted(); await paused } delivered.push(e); return true
 } })
 const b = createExperiment({ config: enabled, storage, crypto: cryptoFor(0), transport: async () => false })
 const flush = a.track('exposure'); await started; await b.track('contact_intent')
 const ids = journal(storage).map(e => e.event_id); assert.equal(ids.length, 3)
 release(); await flush
 assert.equal(journal(storage).length, 0); assert.ok(ids.every(id => delivered.some(e => e.event_id === id)))
})
test('journal limit retains all old unacknowledged IDs instead of trimming them', async () => {
 const storage = memory(); const controller = createExperiment({ config: enabled, storage, crypto: cryptoFor(0), transport: async () => false })
 await controller.track('exposure'); for (let n = 0; n < 49; n++) await controller.track('contact_intent')
 const ids = journal(storage).map(e => e.event_id); await controller.track('contact_intent')
 assert.equal(journal(storage).length, 50); assert.deepEqual(journal(storage).map(e => e.event_id), ids)
})
test('transport requires a collector acknowledgment, including for duplicate retries', async () => {
 for (const status of [200, 201]) {
  const response = new Response(JSON.stringify({ accepted: true, duplicate: status === 200, attribution_status: 'valid_exposure' }),
   { status, headers: { 'Content-Type': 'application/json' } })
  assert.equal(await sendEvent(enabled.endpoint, {}, async () => response), true)
 }
})
test('health responses, HTML fallbacks, malformed JSON and other 2xx do not acknowledge an event', async () => {
 const cases = [
  new Response('{"status":"ok"}', { headers: { 'Content-Type': 'application/json' } }),
  new Response('<html>fallback</html>', { headers: { 'Content-Type': 'text/html' } }),
  new Response('bad-json', { headers: { 'Content-Type': 'application/json' } }),
  new Response('{"accepted":false}', { headers: { 'Content-Type': 'application/json' } }),
  new Response(null, { status: 204 }), new Response('unavailable', { status: 503 })
 ]
 for (const response of cases) assert.equal(await sendEvent(enabled.endpoint, {}, async () => response), false)
})
