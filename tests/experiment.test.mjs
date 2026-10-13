import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createExperiment, experimentConfig, EXPERIMENT_ID } from '../v2/src/experiments/core.mjs'
const memory = () => { const values = new Map(); return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) } }
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
 const pending = JSON.parse(storage.getItem(`arcsage:events:${EXPERIMENT_ID}`))
 assert.equal(pending.length, 2)
 available = true; await controller.flush()
 assert.equal(JSON.parse(storage.getItem(`arcsage:events:${EXPERIMENT_ID}`)).length, 0)
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
