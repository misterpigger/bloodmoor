// CPU profile of the sim: self time by function over SECS simulated seconds
import {boot} from './harness.mjs';import fs from 'fs';
const mode=process.env.MODE||'team',map=process.env.MAP||'arena',SECS=+(process.env.SECS||20),TN=process.env.TN||'4';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const cdp=await page.context().newCDPSession(page);
await page.evaluate(tn=>{const b=document.querySelector(`.tn[data-tn="${tn}"]`);if(b)b.click();},TN);
await start(mode,map,{pause:true});
await page.evaluate(async()=>{const g=window.__game;for(let i=0;i<300&&!g.PRW;i++){await new Promise(r=>setTimeout(r,30));g.logic(1/60);}for(let i=0;i<240;i++)g.logic(1/60);});   // through the countdown
await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:250});await cdp.send('Profiler.start');
const t0=Date.now();let wall=0;
for(let c=0;c<SECS;c+=5){wall+=await page.evaluate(()=>{const g=window.__game;const t=performance.now();for(let k=0;k<300;k++){g.logic(1/60);for(const f of g.fighters)if(f.alive&&f.hp<60&&!window.__mortal)f.hp=Math.max(f.hp,60);}return performance.now()-t;});}
const {profile}=await cdp.send('Profiler.stop');
const self=new Map(),byId=new Map();for(const n of profile.nodes)byId.set(n.id,n);
const dts=profile.timeDeltas,smp=profile.samples;const tot={};let all=0;
for(let i=0;i<smp.length;i++){const n=byId.get(smp[i]);const k=(n.callFrame.functionName||'(anon)')+':'+(n.callFrame.lineNumber+1);tot[k]=(tot[k]||0)+dts[i];all+=dts[i];}
// inclusive time too
const par=new Map();for(const n of profile.nodes)for(const c of n.children||[])par.set(c,n.id);
const inc={};for(let i=0;i<smp.length;i++){let id=smp[i];const seen=new Set();while(id!=null){const n=byId.get(id);const k=(n.callFrame.functionName||'(anon)')+':'+(n.callFrame.lineNumber+1);if(!seen.has(k)){seen.add(k);inc[k]=(inc[k]||0)+dts[i];}id=par.get(id);}}
const alive=await page.evaluate(()=>window.__game.fighters.filter(f=>f.alive).length+'/'+window.__game.fighters.length);
console.log(`${mode}@${map} ${TN}: ${Math.round(wall/SECS)} ms of work per simulated second; alive ${alive}`);
console.log('--- self');for(const [k,v] of Object.entries(tot).sort((a,b)=>b[1]-a[1]).slice(0,+(process.env.TOP||45)))console.log((v/all*100).toFixed(1).padStart(5)+'%  '+k);
console.log('--- inclusive');for(const [k,v] of Object.entries(inc).sort((a,b)=>b[1]-a[1]).slice(0,+(process.env.TOPI||60)))console.log((v/all*100).toFixed(1).padStart(5)+'%  '+k);
// callers of the matrix work: attribute each sample under updateMatrixWorld/updateWorldMatrix/getWorldPosition to the nearest index.html-named ancestor
const MX=new Set((process.env.MXF||'updateMatrixWorld,updateWorldMatrix,multiplyMatrices,updateMatrix,getWorldPosition,getWorldQuaternion,compose,decompose').split(','));const own={};
for(let i=0;i<smp.length;i++){let id=smp[i];let n=byId.get(id);if(!MX.has(n.callFrame.functionName))continue;const chain=[];while(id!=null){n=byId.get(id);if(!MX.has(n.callFrame.functionName)){chain.push(n.callFrame.functionName+':'+(n.callFrame.lineNumber+1));if(chain.length>=(+process.env.DEPTH||2))break;}id=par.get(id);}const k=chain.join(' < ');own[k]=(own[k]||0)+dts[i];}
console.log('--- matrix work by caller');for(const [k,v] of Object.entries(own).sort((a,b)=>b[1]-a[1]).slice(0,40))console.log((v/all*100).toFixed(1).padStart(5)+'%  '+k);
console.log(logs.slice(0,5).join('\n'));await browser.close();process.exit(0);
