import {boot} from './harness.mjs';
const TY=process.env.TY||'swing';
const {browser,page,logs}=await boot({W:600,HH:400,query:'?nohud&ctraps='+TY,render:false});
const r=await page.evaluate(async(TY)=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));
 g.startGame();window.__pause=true;for(let k=0;k<30;k++)g.logic(1/60);
 const C=g.CRYPT,P=g.player,F=g.fighters;for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
 const list=TY==='swing'?C.swings:TY==='spikes'?C.spikes:C.traps.filter(t=>!t.gap);if(!list.length)return 'none';
 const out=[];const K=g.input.keys;
 for(const t of list.slice(0,3)){const ax=t.ax,u0=TY==='pit'?t.a0+1.0:t.u0,start=u0-2.6;P.hp=100;P.alive=true;if(P.ragdoll){P.ragdoll=null;}P.pos.set(ax?start:t.m+(TY==='spikes'?0:0),0,ax?t.m:start);P.vel.set(0,0,0);P.yaw=Math.atan2(ax?1:0,ax?0:1);for(let k=0;k<10;k++)g.logic(1/60);
  const hp0=P.hp;let fell=false,minY=0,ev=[];
  for(let k=0;k<300;k++){K.KeyW=!P.ragdoll;g.logic(1/60);minY=Math.min(minY,P.pos.y);if(P.ragdoll&&!fell){fell=true;ev.push('down@'+k);}
   if(TY==='swing'&&k%15==0)ev.push((+t.th.toFixed(2)));if(TY==='spikes'&&k%20==0)ev.push(t.st+':'+t.ext.toFixed(2));}
  K.KeyW=false;out.push({hp0,hp:+P.hp.toFixed(1),alive:P.alive,fell,minY:+minY.toFixed(2),ev:ev.join(' ')});
  // reset player
  if(P.ragdoll){P.ragdoll=null;P.knocked=0;}if(!P.alive)break;}
 return out;},TY);
console.log(TY,JSON.stringify(r));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
