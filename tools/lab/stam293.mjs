// the player swinging over and over with the button held, as in his clip: stamina each second, tip speed
import {boot} from './harness.mjs';
const WEP=process.env.WEP||'arming',PER=+(process.env.PER||.7),HOLD=+(process.env.HOLD||1);
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await new Promise(r=>setTimeout(r,2000));
const out=await page.evaluate(([w,PER,HOLD])=>{const g=window.__game,P=g.player,input=g.input;for(let k=0;k<120;k++)g.logic(1/60);
  if(!P.sword||P.sword.def.id!==w){g.spawnWeaponLoot(g.WEAPONS[w],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
  for(const f of g.fighters)if(f!==P)f.pos.x+=30;P.stamina=100;
  const rows=[];let pk=0,ex=0;
  for(let i=0;i<60*20;i++){const t=i/60,ph=(t%PER)/PER,leg=Math.floor(t/PER)%2;input.locked=false;P.ctrl.z=.46;
    const u=ph<.5?ph*2:1;input.mx=leg?.14+.72*u:.86-.72*u;input.my=leg?.7-.5*u:.2+.5*u;input.lmb=HOLD?true:ph<.5;
    g.logic(1/60);pk=Math.max(pk,P.sword.tipVel.length());if(P.stamina<12)ex++;
    if(i%60===59){rows.push([Math.round(t),+P.stamina.toFixed(0),+pk.toFixed(1),+(P.staminaMax||0).toFixed?.(0)]);pk=0;}}
  return {rows,ex:ex/60};},[WEP,PER,HOLD]);
console.log('s stam peakTip');for(const r of out.rows)console.log(r.join(' '));console.log('seconds exhausted',out.ex.toFixed(1));
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
