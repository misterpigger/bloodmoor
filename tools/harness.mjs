// Headless test harness: serves the game from this repo, maps the CDN imports to node_modules, and exposes window.__game.
// Run from tools/:  npm install && npx playwright install chromium && node smoke.mjs
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const HERE=path.dirname(fileURLToPath(import.meta.url));
export const ROOT=path.resolve(HERE,'..');
const NM=path.join(HERE,'node_modules');
export async function boot({W=800,HH=450,query='',render=true}={}){
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM||undefined,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-features=BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights,LocalNetworkAccessChecks']});
  const page=await browser.newPage({viewport:{width:W,height:HH}});
  const logs=[];page.on('console',m=>{if(['error','warning'].includes(m.type())&&!m.text().includes('deprecated'))logs.push(m.type()+': '+m.text());});page.on('pageerror',e=>logs.push('PAGEERROR: '+e.message));
  await page.route('**/*',async route=>{const u=new URL(route.request().url());
    if(u.hostname==='127.0.0.1')return route.continue();
    if(u.host==='cdn.jsdelivr.net'){
      if(u.pathname.includes('rapier3d-compat@'))return route.fulfill({path:path.join(NM,'@dimforge/rapier3d-compat',u.pathname.split(/@[0-9.]+\//)[1]),contentType:'application/javascript'});
      if(u.pathname.includes('peerjs'))return route.fulfill({path:path.join(NM,'peerjs/dist/peerjs.min.js'),contentType:'application/javascript'});
      const f=path.join(NM,'three',u.pathname.replace(/^\/npm\/three@[0-9.]+\//,''));return fs.existsSync(f)?route.fulfill({path:f,contentType:'application/javascript'}):route.fulfill({status:404});}
    if(u.host.includes('fonts.'))return route.fulfill({status:200,body:'',contentType:'text/css'});
    if(u.host==='local.test'){if(u.pathname==='/')return route.fulfill({body:'<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(path.join(ROOT,'index.html'),'utf8')+'</body></html>',contentType:'text/html'});return route.fulfill({path:path.join(ROOT,decodeURIComponent(u.pathname))});}
    return route.abort();});
  await page.goto('http://local.test/'+query,{waitUntil:'domcontentloaded',timeout:200000});
  await page.waitForFunction(()=>window.__game&&window.__game.state==='attract',null,{timeout:200000});
  await page.evaluate(r=>{const g=window.__game;g.renderer.shadowMap.enabled=false;if(!r)g.composer.render=()=>{};},render);
  const tick=(n,dt=1/60)=>page.evaluate(([n,dt])=>{const g=window.__game;for(let i=0;i<n;i++)g.logic(dt);},[n,dt]);
  const shot=name=>page.screenshot({path:path.join(HERE,'shots',name+'.png'),timeout:300000});
  fs.mkdirSync(path.join(HERE,'shots'),{recursive:true});
  return {browser,page,logs,tick,shot};
}
