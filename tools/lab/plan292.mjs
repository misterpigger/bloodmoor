// a floor's plan as data (cells, passages, doorways), drawn by plan292.py: SEED, DEPTH, Q, OUT
import {boot} from './harness.mjs';import fs from 'fs';
const {page,browser,logs}=await boot({render:false,query:'?nohud'+(process.env.Q||'')});
const r=await page.evaluate(async([d,sd])=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;window.__keepBad=true;
  const C=g.cryptBuild(d,sd);return {bad:C.bad||0,cells:C.plan.cells.map(c=>({cx:c.cx,cz:c.cz,hx:c.hx,hz:c.hz,type:c.type,kind:c.kind||'',gal:c.gal||0,oct:c.oct||0,sunk:c.sunk?[c.sunk.ix,c.sunk.iz]:0})),cors:C.cors.map(k=>[k.x0,k.x1,k.z0,k.z1]),ways:C.ways.map(w=>[w.x,w.z]),key:C.keyRoom?[C.keyRoom.x,C.keyRoom.z]:null};},[+(process.env.DEPTH||3),+(process.env.SEED||777)]);
fs.writeFileSync(process.env.OUT||'plan.json',JSON.stringify(r));console.log('cells',r.cells.length,'bad',r.bad,logs.slice(0,3).join('|')||'no errors');await browser.close();process.exit(0);
