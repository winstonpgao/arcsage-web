// Check the experimental treatment's actual built invariants, not model outcomes.
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const spec=JSON.parse(await readFile(resolve(root,'experiments/public-reference-v1/spec.json'),'utf8'));
const unescape=s=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"');
const normalize=s=>unescape(s.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
const expected=spec.blocks.map(x=>x.question+' '+x.answer).join(' ').replace(/\s+/g,' ').trim();
const sitemap=await readFile(resolve(root,'dist/sitemap.xml'),'utf8');let headA;let checks=0;
for(const [arm,value]of Object.entries(spec.arms)){
 const html=await readFile(resolve(root,'dist'+value.path,'index.html'),'utf8');
 const article=html.match(/<article id="reference-facts">([\s\S]*?)<\/article>/)?.[1];
 assert.ok(article);checks++;
 assert.equal(normalize(article),expected);checks++;
 assert.equal((html.match(/<h1>/g)||[]).length,1);checks++;
 assert.equal((article.match(/<h2>/g)||[]).length,arm==='A'?0:spec.blocks.length);checks++;
 assert.match(html,/<meta name="robots" content="noindex,follow">/);checks++;
 assert.doesNotMatch(html,/<script|rel="canonical"/);checks++;
 assert.ok(!sitemap.includes(value.path));checks++;
 assert.ok(html.includes('Reference edition: '+value.edition));checks++;
 for(const link of spec.shared_evidence_links){assert.ok(html.includes('href="'+link.url+'"'));checks++;}
 const head=html.match(/<head>([\s\S]*?)<\/head>/)?.[1];if(headA===undefined)headA=head;else{assert.equal(head,headA);checks++;}
 for(const m of html.matchAll(/(?:href|src)="(\/assets\/[^"?#]+|\/logo\.jpeg)"/g)){await access(resolve(root,'dist'+m[1]));checks++;}
}
console.log(checks+' public-reference invariants passed: identical facts/head/assets, intended grouping only, static noindex pages outside sitemap.');
