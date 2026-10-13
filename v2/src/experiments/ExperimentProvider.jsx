import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createExperiment, experimentConfig } from './core.mjs'

const Context = createContext({ active: false, variant: 'A', ready: false, track: async () => false })
export function ExperimentProvider({ children }) {
  const controller = useRef(null)
  const [state, setState] = useState({ active: false, variant: 'A', ready: false })
  useEffect(() => {
    let storage
    try { storage = window.localStorage } catch { storage = null }
    const experiment = createExperiment({
      config: experimentConfig(import.meta.env), storage, crypto: window.crypto,
      transport: async (endpoint, event) => {
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event), credentials: 'omit', keepalive: true, cache: 'no-store' })
        return response.ok
      },
    })
    controller.current = experiment
    setState({ active: experiment.active, variant: experiment.variant, ready: true })
    const retry = () => { void experiment.flush() }
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [])
  const value = { ...state, track: (name, path) => controller.current?.track(name, path) || Promise.resolve(false) }
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export const useExperiment = () => useContext(Context)
