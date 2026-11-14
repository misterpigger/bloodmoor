// scratch harness: serves the repo, maps CDN imports to node_modules, exposes window.__game and frame stepping
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const HERE=path.dirname(fileURLToPath(import.meta.url));
export const ROOT=process.env.BM_ROOT||new URL('../..',import.meta.url).pathname.replace(/\/$/,'');const INDEX=process.env.INDEX||ROOT+'/index.html';
const NM=fs.existsSync(path.join(HERE,'node_modules'))?path.join(HERE,'node_modules'):path.join(HERE,'..','node_modules');
export async function boot({W=800,HH=450,query='',render=true,manual=true,dsf=1,touch=false,ua=null}={}){
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required','--js-flags=--max-old-space-size=3500','--disable-features=BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights,LocalNetworkAccessChecks']});
  const ctx=await browser.newContext({viewport:{width:W,height:HH},deviceScaleFactor:dsf,hasTouch:touch,isMobile:touch,...(ua?{userAgent:ua}:{})});
  const page=await ctx.newPage();
  if(manual)await page.addInitScript(()=>{window.__manual=true;});
  if(process.env.SEED)await page.addInitScript((sd)=>{let a=+sd;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};},process.env.SEED);
  if(process.env.NOAUDIO)await page.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});
  if(process.env.GFX)await page.addInitScript(v=>{try{localStorage.setItem('bloodmoor-gfx',v);}catch(e){}},process.env.GFX);
  const logs=[];page.on('console',m=>{if(['error','warning'].includes(m.type())&&!m.text().includes('deprecated')&&!m.text().includes('GPU stall'))logs.push(m.type()+': '+m.text().slice(0,600));if(process.env.CLOG&&m.type()==='log')console.log('LOG',m.text().slice(0,400));});page.on('pageerror',e=>logs.push('PAGEERROR: '+e.message+'\n'+(e.stack||'').split('\n').slice(0,4).join('\n')));
  await page.route('**/*',async route=>{const u=new URL(route.request().url());
    if(u.hostname==='127.0.0.1')return route.continue();
    if(u.host==='cdn.jsdelivr.net'){
      if(u.pathname.includes('rapier3d-compat@'))return route.fulfill({path:path.join(NM,'@dimforge/rapier3d-compat',u.pathname.split(/@[0-9.]+\//)[1]),contentType:'application/javascript'});
      if(u.pathname.includes('peerjs'))return route.fulfill({path:path.join(NM,'peerjs/dist/peerjs.min.js'),contentType:'application/javascript'});
      const f=path.join(NM,'three',u.pathname.replace(/^\/npm\/three@[0-9.]+\//,''));return fs.existsSync(f)?route.fulfill({path:f,contentType:'application/javascript'}):route.fulfill({status:404});}
    if(u.host.includes('fonts.'))return route.fulfill({status:200,body:'',contentType:'text/css'});
    if(u.host==='local.test'){if(u.pathname==='/'){let h=fs.readFileSync(INDEX,'utf8').replace('window.__game={','window.__frameFn=frame;window.__game={');return route.fulfill({body:h,contentType:'text/html'});}
      const f=path.join(ROOT,decodeURIComponent(u.pathname));return fs.existsSync(f)?route.fulfill({path:f}):route.fulfill({status:404});}
    return route.abort();});
  await page.goto('http://local.test/'+query,{waitUntil:'domcontentloaded',timeout:300000});
  await page.waitForFunction(()=>window.__game&&window.__game.state==='attract',null,{timeout:300000});
  page.setDefaultTimeout(900000);
  if(!render)await page.evaluate(()=>{const g=window.__game;g.renderer.shadowMap.enabled=false;g.composer.render=()=>{};g.renderer.render=()=>{};});
  // step n rendered frames of dt seconds through the game's own frame()
  const fr=(n=1,dt=1/60)=>page.evaluate(([n,dt])=>{window.__now=window.__now||performance.now();for(let i=0;i<n;i++){window.__now+=dt*1000;window.__inManual=1;try{window.__frameFn(window.__now);}finally{window.__inManual=0;}}},[n,dt]);
  const tick=(n,dt=1/60)=>page.evaluate(([n,dt])=>{const g=window.__game;for(let i=0;i<n;i++)g.logic(dt);},[n,dt]);
  const start=(mode,map,opts={})=>page.evaluate(async([mode,map,opts])=>{const g=window.__game;const mb=document.querySelector(`.map[data-map=${map}]`);
    const md=document.querySelector(`.mode[data-mode="${mode}"]`);if(md)md.click();await new Promise(r=>setTimeout(r,150));if(mb){mb.click();await new Promise(r=>setTimeout(r,300));}
    g.startGame();window.__pause=!!opts.pause;},[mode,map,opts]);
  const shot=(file,q=88)=>page.screenshot({path:file,type:'jpeg',quality:q,timeout:600000});
  return {browser,page,logs,tick,fr,start,shot,ctx};
}
