// Static, noindex research references. Both arms share actual text, assets and SEO.
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const spec=JSON.parse(await readFile(resolve(root,'experiments/public-reference-v1/spec.json'),'utf8'));
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const assets=(await readdir(resolve(root,'dist/assets'))).filter(x=>x.endsWith('.css')).sort();
if(!assets.length)throw Error('Shared built stylesheet missing');
const head=`<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,follow"><title>${esc(spec.shared_title)}</title><meta name="description" content="${esc(spec.shared_description)}">${assets.map(x=>`<link rel="stylesheet" href="/assets/${esc(x)}">`).join('')}`;
const style=`<style>.reference-body{max-width:840px;margin:auto;padding:52px 24px 70px}.reference-body p{color:var(--text-secondary);line-height:1.85;margin:0 0 24px}.reference-body h2{font-size:1.35rem;line-height:1.45;margin:38px 0 14px;color:var(--text)}.reference-links{border-top:1px solid var(--border);padding-top:24px;display:flex;gap:18px;flex-wrap:wrap}.reference-links a{color:var(--primary);text-decoration:underline}.reference-edition{font-size:.82rem;color:var(--text-secondary);margin-top:28px}.reference-header{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:18px 24px}.reference-logo{display:flex;align-items:center;gap:12px;font-size:1.35rem;font-weight:700}.reference-logo img{width:36px;height:36px;border-radius:9px}.reference-header nav{display:flex;gap:20px;font-size:.92rem}@media(max-width:480px){.reference-header nav{gap:12px}.reference-body{padding-top:32px}.geo-hero{padding-top:36px;padding-bottom:40px}}</style>`;
const header=`<header><div class="container reference-header"><a class="reference-logo" href="/"><img src="/logo.jpeg" alt=""><span>ArcSage</span></a><nav aria-label="Main"><a href="/about/">About</a><a href="/contact/">Contact</a></nav></div></header>`;
const lead=`<section class="geo-hero"><div class="container"><h1>${esc(spec.shared_h1)}</h1><p class="geo-lead">${esc(spec.shared_intro)}</p></div></section>`;
const links=`<nav class="reference-links" aria-label="Source evidence">${spec.shared_evidence_links.map(x=>`<a href="${esc(x.url)}">${esc(x.label)}</a>`).join('')}</nav>`;
for(const [arm,details]of Object.entries(spec.arms)){
 const body=arm==='A'?`<p>${spec.blocks.map(x=>esc(x.question)+' '+esc(x.answer)).join(' ')}</p>`:spec.blocks.map(x=>`<section><h2>${esc(x.question)}</h2>
<p>${esc(x.answer)}</p>
</section>
`).join('');
 const html=`<!doctype html><html lang="en"><head>${head}${style}</head><body>${header}<main class="geo-page">${lead}<div class="reference-body"><article id="reference-facts">${body}</article>
${links}<footer class="reference-edition">Reference edition: ${esc(details.edition)}</footer></div></main></body></html>\n`;
 const dir=resolve(root,'dist'+details.path);await mkdir(dir,{recursive:true});await writeFile(resolve(dir,'index.html'),html);
}
console.log('Generated two fact-matched public reference editions; both noindex and excluded from sitemap.');
