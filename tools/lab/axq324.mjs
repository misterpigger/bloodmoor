// pf weapon check without pictures: a scripted player cut (MOVE) with WEP in the yard; prints tip speed while holding still before, the peak in the swing, and while holding at the end; hand-to-target lag p50/max. Q passes extra query (e.g. &pf&hsp=...)
import {boot} from './harness.mjs';
const W=process.env.WEP||'axe',MV=process.env.MOVE||'cutR';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const r=await page.evaluate(async([w,MV,DD])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));g.startGame('yard','arena');window.__pause=true;for(let i=0;i<200&&!g.RP;i++)await wait(50);
  const P=g.player,T=g.THREE,input=g.input;for(let k=0;k<200;k++)g.logic(1/60);
  if(!P.sword||P.sword.def.id!==w){g.spawnWeaponLoot(g.WEAPONS[w],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
  const D=g.fighters.filter(f=>f!==P).sort((a,b)=>a.pos.distanceTo(P.pos)-b.pos.distanceTo(P.pos))[0];const fw=new T.Vector3(Math.sin(P.yaw),0,Math.cos(P.yaw)),home=P.pos.clone();const park=()=>{for(const f of g.fighters)if(f!==P&&f.dummy)f.pos.set(30,0,30);D.pos.copy(home).addScaledVector(fw,DD);};park();
  const MOVES={cutR:{pre:[.86,.14],to:[.18,.72],t:.2},cutL:{pre:[.14,.14],to:[.82,.72],t:.2},chop:{pre:[.5,.03],to:[.5,.92],t:.18}};const M=MOVES[MV];
  const seq=[];for(let i=0;i<40;i++)seq.push([.5,.45,0]);for(let i=0;i<30;i++)seq.push([M.pre[0],M.pre[1],0]);const n=Math.round(M.t*60);for(let i=0;i<n;i++){const u=(i+1)/n;seq.push([M.pre[0]+(M.to[0]-M.pre[0])*u,M.pre[1]+(M.to[1]-M.pre[1])*u,1]);}for(let i=0;i<60;i++)seq.push([M.to[0],M.to[1],1]);
  const A=[],L=[];for(let i=0;i<seq.length;i++){const s=seq[i];park();input.locked=false;input.mx=s[0];input.my=s[1];input.lmb=!!s[2];P.ctrl.z=.46;P.stamina=100;g.logic(1/60);
    const sw=P.sword;A.push(sw?sw.tipVel.length():0);L.push(sw?P.handTarget(new T.Vector3()).distanceTo(sw.H):0);}
  const mean=a=>a.reduce((x,y)=>x+y,0)/a.length,mx=a=>Math.max(...a),md=a=>{const b=[...a].sort((x,y)=>x-y);return b[b.length>>1];};
  return {pre:mean(A.slice(40,70)).toFixed(1),peak:mx(A.slice(70,70+n+25)).toFixed(1),post:mean(A.slice(-30)).toFixed(1),lag50:(md(L)*100).toFixed(0),lagmx:(mx(L)*100).toFixed(0),held:!!P.sword,tr:A.slice(66,100).map(v=>v.toFixed(0)).join(" ")};},[W,MV,+(process.env.DD||4)]);
console.log(JSON.stringify(r));console.log(logs.slice(0,3).join('\n')||'no errors');await browser.close();process.exit(0);
