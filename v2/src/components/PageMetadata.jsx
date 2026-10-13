import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { pageMetadata } from '../siteMetadata'
export default function PageMetadata() {
 const { pathname } = useLocation()
 useEffect(() => {
  const meta = pageMetadata(pathname)
  document.title = meta.title; document.documentElement.lang = meta.language
  const setMeta = (name, content) => {
   let node = document.querySelector(`meta[name="${name}"]`)
   if (!node) { node = document.createElement('meta'); node.name = name; document.head.append(node) }
   node.content = content
  }
  setMeta('description', meta.description); setMeta('robots', meta.robots)
  let canonical = document.querySelector('link[rel="canonical"]')
  if (meta.canonical) {
   if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) }
   canonical.href = meta.canonical
  } else { canonical?.remove() }
  let schema = document.getElementById('site-identity')
  if (meta.schema) {
   if (!schema) { schema = document.createElement('script'); schema.id = 'site-identity'; schema.type = 'application/ld+json'; document.head.append(schema) }
   schema.textContent = JSON.stringify(meta.schema)
  } else { schema?.remove() }
 }, [pathname])
 return null
}
