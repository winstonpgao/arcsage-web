import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { ExperimentProvider } from './experiments/ExperimentProvider'
export function renderRoute(url) {
 return renderToString(<React.StrictMode><StaticRouter location={url}><ExperimentProvider><App /></ExperimentProvider></StaticRouter></React.StrictMode>)
}
export { PUBLIC_ROUTES, pageMetadata } from './siteMetadata'
