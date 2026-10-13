import { build } from 'vite'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = resolve(import.meta.dirname, '..')
await build({ configFile: resolve(root, 'vite.config.js'), publicDir: false,
 build: { ssr: resolve(root, 'v2/src/server.jsx'), outDir: resolve(root, '.ssr'), emptyOutDir: true } })
const { renderRoute, PUBLIC_ROUTES, pageMetadata } = await import(pathToFileURL(resolve(root, '.ssr/server.js')))
const shell = await readFile(resolve(root, 'dist/index.html'), 'utf8')
const escape = s => String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')
for (const url of [...PUBLIC_ROUTES, '/404']) {
 const meta = pageMetadata(url)
 let html = shell.replace('<div id="root"></div>', `<div id="root">${renderRoute(url)}</div>`)
 if (html === shell) throw Error('Missing HTML app insertion point')
 html = html.replace(/<html lang="[^"]*">/, `<html lang="${meta.language}">`)
 html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(meta.title)}</title>`)
 html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(meta.description)}">`)
 html = html.replace('</head>', `<meta name="robots" content="${meta.robots}">${meta.canonical ? `<link rel="canonical" href="${escape(meta.canonical)}">` : ''}${meta.schema ? `<script id="site-identity" type="application/ld+json">${JSON.stringify(meta.schema).replaceAll('<','\\u003c')}</script>` : ''}</head>`)
 const target = url === '/' ? resolve(root, 'dist/index.html') : url === '/404' ? resolve(root, 'dist/404.html') : resolve(root, 'dist'+url+'/index.html')
 await mkdir(resolve(target, '..'), { recursive: true }); await writeFile(target, html)
}
const origin = pageMetadata('/').canonical.replace(/\/$/, '')
await writeFile(resolve(root, 'dist/sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+PUBLIC_ROUTES.map(route=>`<url><loc>${escape(pageMetadata(route).canonical)}</loc></url>`).join('')+'</urlset>\n')
await writeFile(resolve(root, 'dist/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`)
await rm(resolve(root, '.ssr'), { recursive: true, force: true })
console.log(`Prerendered ${PUBLIC_ROUTES.length} public routes and an actual not-found page`)
