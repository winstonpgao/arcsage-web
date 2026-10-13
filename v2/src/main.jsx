import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ExperimentProvider } from './experiments/ExperimentProvider'
import './styles.css'
import './geo-pages.css'
const node = document.getElementById('root')
const tree = <React.StrictMode><BrowserRouter><ExperimentProvider><App /></ExperimentProvider></BrowserRouter></React.StrictMode>
if (node.hasChildNodes()) hydrateRoot(node, tree)
else createRoot(node).render(tree)
