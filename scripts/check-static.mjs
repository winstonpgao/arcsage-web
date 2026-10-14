import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { resolve } from 'node:path'
const root = resolve(import.meta.dirname, '..')
const routes = ['/', '/about', '/contact', '/real-estate-ai-lead-qualification', '/zh/real-estate-ai-lead-qualification', '/guides/real-estate-ai-lead-qualification']
let checks = 0
for (const route of routes) {
 const file = route === '/' ? 'index.html' : route.slice(1) + '/index.html'
 const html = await readFile(resolve(root, 'dist', file), 'utf8')
 const body = html.split('<body>')[1].split('</body>')[0]
 assert.match(body, /<h1(?:\s[^>]*)?>/); checks++
 assert.equal((body.match(/<h1(?:\s[^>]*)?>/g)||[]).length, 1); checks++
 assert.ok(body.length > 3000); checks++
 assert.doesNotMatch(body, /style="[^"]*opacity:\s*0(?:[;"\s])/); checks++
 assert.match(html, /<link rel="canonical" href="https:\/\/arcsage\.com\.au\//); checks++
 assert.match(html, /<script id="site-identity" type="application\/ld\+json">/); checks++
 assert.match(body, /winston@arcsage\.com\.au/); checks++
 for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+|\/screenshots\/[^"?#]+|\/logo\.jpeg)"/g)) {
  await access(resolve(root, 'dist'+match[1])); checks++
 }
 if (route.startsWith('/zh/')) { assert.match(html, /<html lang="zh-CN">/); checks++ }
 if (route === '/contact') {
  assert.match(body, /data-ab-variant="A"/); checks++
  assert.doesNotMatch(body, /Message Sent/); checks++
  assert.match(body, /Opens your email application/); checks++
 }
}
const missing = await readFile(resolve(root,'dist/404.html'),'utf8')
assert.match(missing, /Page not found/); assert.match(missing, /content="noindex"/); assert.doesNotMatch(missing, /rel="canonical"/); checks += 3
const sitemap = await readFile(resolve(root,'dist/sitemap.xml'),'utf8')
assert.equal((sitemap.match(/<loc>/g)||[]).length, routes.length); assert.doesNotMatch(sitemap,/404/); checks += 2
assert.match(await readFile(resolve(root,'dist/robots.txt'),'utf8'),/Sitemap: https:\/\/arcsage.com.au\/sitemap.xml/); checks++
console.log(`${checks} built-page checks passed: readable routes, one H1, visible SSR content, identity metadata, real assets, honest contact, sitemap and not-found response`)
