import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {randomBytes,randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const checkout=fileURLToPath(new URL('..',import.meta.url));
const out=process.env.QA_OUTPUT || join(tmpdir(),'arcsage-source-qa');await mkdir(out,{recursive:true});
const temp=await mkdtemp(join(tmpdir(),'arcsage-ab-qa-'));const token=randomBytes(32).toString('hex');
const env={...process.env,DB_PATH:temp+'/events.sqlite3',ALLOWED_ORIGINS:'http://127.0.0.1:8000',ALLOWED_PATHS:'/contact',PORT:'8767',BIND_HOST:'127.0.0.1',REPORT_ENABLED:'1',REPORT_TOKEN:token};
let collector;const startCollector=()=>{collector=spawn('python3',[checkout+'/experiments/collector/collector.py'],{env,stdio:'ignore'});};
startCollector();const site=spawn('python3',['-m','http.server','8000','--bind','127.0.0.1','--directory',checkout+'/dist'],{stdio:'ignore'});
const chrome=spawn(process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+temp+'/chrome','about:blank'],{stdio:'ignore'});
const sockets=[];const checks=[];const errors=[];const delay=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(name,ok)=>{if(!ok)throw Error(name);checks.push({name,passed:true});};
async function waitFetch(url){for(let n=0;n<100;n++){try{const r=await fetch(url);if(r.ok)return;}catch{}await delay(100);}throw Error('Service did not start: '+url);}
async function connect(url){const ws=new WebSocket(url);sockets.push(ws);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value||a.description||'').join(' '));if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}});return (method,params={})=>new Promise((resolve,reject)=>{const seq=++id;pending.set(seq,{resolve,reject});ws.send(JSON.stringify({id:seq,method,params}));});}
async function pageClient(port,variant){const page=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();const call=await connect(page.webSocketDebuggerUrl);await call('Page.enable');await call('Runtime.enable');const assignment={experiment_id:'arcsage-contact-cta-v1',variant,visitor_id:randomUUID(),assigned_at:new Date().toISOString()};await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('arcsage:assignment:arcsage-contact-cta-v1',${JSON.stringify(JSON.stringify(assignment))});`});const evalJS=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};const wait=async expression=>{for(let n=0;n<100;n++){if(await evalJS("Boolean("+expression+")"))return;await delay(100);}throw Error('Browser condition timed out: '+expression);};return {call,evalJS,wait};}
const getReport=async()=>{const r=await fetch('http://127.0.0.1:8767/report',{headers:{Authorization:'Bearer '+token}});if(!r.ok)throw Error('Report request failed');return r.json();};
try{
 await waitFetch('http://127.0.0.1:8000/');await waitFetch('http://127.0.0.1:8767/health');
 const empty=await getReport();assert('empty store has no invented conversion rate',empty.variants.A.exposed_visitors===0&&empty.variants.A.intent_rate===null);
 let port;for(let n=0;n<100;n++){try{port=(await readFile(temp+'/chrome/DevToolsActivePort','utf8')).split('\n')[0];break;}catch{}await delay(100);}if(!port)throw Error('Browser unavailable');
 for(const route of ['/','/about/','/contact/','/real-estate-ai-lead-qualification/','/zh/real-estate-ai-lead-qualification/','/guides/real-estate-ai-lead-qualification/']){const r=await fetch('http://127.0.0.1:8000'+route);const html=await r.text();assert('HTTP200 and server-readable body '+route,r.status===200&&/<h1[ >]/.test(html));}
 const a=await pageClient(port,'A');await a.call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await a.call('Page.navigate',{url:'http://127.0.0.1:8000/contact/'});await a.call('Page.bringToFront');await a.wait('document.querySelector("[data-experiment-ready]")?.getAttribute("data-experiment-ready") === "true"');
 assert('A displays control wording',await a.evalJS('document.querySelector("[data-testid=contact-cta]").textContent === "Email us"'));
 assert('contact no fake success form',await a.evalJS('!document.querySelector("form") && !document.body.textContent.includes("Message Sent")'));
 let png=await a.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out+'/contact-A.png',Buffer.from(png.data,'base64'));
 // Intercept the default mailto navigation in QA. The normal React click handler still runs; no email is opened or sent.
 await a.evalJS('document.addEventListener("click",e=>{if(e.target.closest("a[href^=mailto]"))e.preventDefault();},true);document.querySelector("[data-testid=contact-cta]").click()');
 const b=await pageClient(port,'B');await b.call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await b.call('Page.navigate',{url:'http://127.0.0.1:8000/contact/'});await b.call('Page.bringToFront');await b.wait('document.querySelector("[data-experiment-ready]")?.getAttribute("data-experiment-ready") === "true"');
 assert('B displays treatment wording',await b.evalJS('document.querySelector("[data-testid=contact-cta]").textContent === "Discuss lead qualification"'));
 await b.call('Page.reload');await b.wait('document.querySelector("[data-experiment-ready]")?.getAttribute("data-experiment-ready") === "true"');assert('B assignment survives reload',await b.evalJS('document.querySelector("[data-ab-variant]").getAttribute("data-ab-variant") === "B"'));
 png=await b.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out+'/contact-B.png',Buffer.from(png.data,'base64'));
 let report;for(let n=0;n<100;n++){report=await getReport();if(report.variants.A.exposed_visitors===1&&report.variants.A.intent_visitors===1&&report.variants.B.exposed_visitors===1)break;await delay(100);}
 assert('browser events persist as unique A/B visitors',report.variants.A.exposed_visitors===1&&report.variants.B.exposed_visitors===1);
 assert('intent attributed only to clicked A visitor',report.variants.A.intent_visitors===1&&report.variants.B.intent_visitors===0);
 assert('no attribution conflicts in QA',report.quality.invalid_attribution_events===0&&report.quality.conflicted_visitors===0);
 await b.call('Page.navigate',{url:'http://127.0.0.1:8000/real-estate-ai-lead-qualification/'});await b.wait('document.readyState==="complete" && document.querySelector(".geo-page h1")');await delay(250);
 assert('English service inherits real navigation and screenshots',await b.evalJS('!!document.querySelector(".nav") && Array.from(document.images).some(i=>i.src.includes("screenshots/"))'));
 assert('desktop no horizontal overflow',await b.evalJS('document.documentElement.scrollWidth <= window.innerWidth'));
 png=await b.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out+'/service-desktop.png',Buffer.from(png.data,'base64'));
 await b.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await delay(200);assert('mobile service has no horizontal overflow',await b.evalJS('document.documentElement.scrollWidth <= window.innerWidth'));
 png=await b.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out+'/service-mobile.png',Buffer.from(png.data,'base64'));
 await b.evalJS('document.querySelector(".nav__toggle").click()');assert('mobile menu opens',await b.evalJS('document.querySelector(".nav__links").classList.contains("nav__links--open")'));
 await b.call('Page.navigate',{url:'http://127.0.0.1:8000/zh/real-estate-ai-lead-qualification/'});await b.wait('document.documentElement.lang==="zh-CN" && document.querySelector(".geo-page h1")');assert('Chinese page has localized metadata',await b.evalJS('document.title.includes("房地产")'));
 assert('Chinese mobile has no horizontal overflow',await b.evalJS('document.documentElement.scrollWidth <= window.innerWidth'));
 png=await b.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out+'/service-zh-mobile.png',Buffer.from(png.data,'base64'));
 await b.call('Page.navigate',{url:'http://127.0.0.1:8000/guides/real-estate-ai-lead-qualification/'});await b.wait('document.readyState==="complete" && document.querySelector(".geo-page h1")');assert('guide serves a real buyer checklist',await b.evalJS('document.querySelectorAll(".geo-page h2").length >= 4'));
 for(const [name,route] of [['home','/'],['about','/about/']]) {
  for(const [size,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
   await b.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:size==='mobile'});
   await b.call('Page.navigate',{url:'http://127.0.0.1:8000'+route});await b.wait('document.readyState==="complete" && document.querySelector("h1")');await delay(300);
   assert(name+' '+size+' has one visible heading and no overflow',await b.evalJS('document.querySelectorAll("h1").length===1 && document.documentElement.scrollWidth<=innerWidth && getComputedStyle(document.querySelector("h1")).opacity!=="0"'));
   png=await b.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out+'/'+name+'-'+size+'.png',Buffer.from(png.data,'base64'));
  }
 }
 assert('no hydration or browser JS errors',errors.length===0);
 await new Promise(r=>{collector.once('exit',r);collector.kill('SIGTERM');});startCollector();await waitFetch('http://127.0.0.1:8767/health');const restarted=await getReport();assert('counts survive collector process restart',JSON.stringify(restarted.variants)===JSON.stringify(report.variants));
 // Verify startup retry on a route that does not itself record contact events.
 await new Promise(r=>{collector.once('exit',r);collector.kill('SIGTERM');});
 await a.call('Page.bringToFront');await a.evalJS('document.querySelector("[data-testid=contact-cta]").click()');await delay(300);
 assert('failed delivery remains in browser journal',await a.evalJS('Object.keys(localStorage).some(k=>k.startsWith("arcsage:event:"))'));
 startCollector();await waitFetch('http://127.0.0.1:8767/health');
 await a.call('Page.navigate',{url:'http://127.0.0.1:8000/guides/real-estate-ai-lead-qualification/'});
 await a.wait('document.readyState==="complete" && !Object.keys(localStorage).some(k=>k.startsWith("arcsage:event:"))');
 const recovered=await getReport();assert('reload to guide retries retained events without new contact interaction',recovered.quality.persisted_events>restarted.quality.persisted_events&&recovered.quality.invalid_attribution_events===0);
 assert('no browser errors after retry recovery',errors.length===0);
 await writeFile(out+'/integration-test-report.json',JSON.stringify({scope:'automated QA visitors only; not customer A/B outcomes',empty_store:empty,after_browser_interaction:report,after_restart:restarted,after_retry_recovery:recovered},null,2));
 await writeFile(out+'/browser-checks.json',JSON.stringify({checked_at_utc:new Date().toISOString(),scope:'actual source integration and isolated local telemetry; no public visitors or mail delivery',build_configuration:'VITE_AB_ENABLED=true; endpoint localhost only',checks,errors},null,2));
 console.log(checks.length+' source browser/transport/persistence checks passed; screenshots and QA-only report saved.');
}catch(e){console.error(e.message);process.exitCode=1;await writeFile(out+'/browser-failure.json',JSON.stringify({checks,errors,failure:e.message},null,2));}
finally{for(const s of sockets)s.close();chrome.kill('SIGTERM');collector?.kill('SIGTERM');site.kill('SIGTERM');}
