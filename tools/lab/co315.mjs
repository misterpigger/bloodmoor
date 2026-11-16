// cast-off and clashes over a bot duel: counts cast-off throws, clash sparks and wood contacts. env WEP
import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('duel','colosseum',{pause:true});
const r=await page.evaluate(()=>{const g=window.__game,out={co:0,sp:0,c:0,wood:0};const oc=g.sClang;
  const NET=g.NET;const old=window.netEvHook;window.__evc=out;
  NET.mode='host';for(let k=0;k<60*40;k++){NET.ev.length=0;for(const f of g.fighters)if(f.sword&&!f.isPlayer){f.sword.blood=Math.max(f.sword.blood||0,.5);f.sword.bloodT=g.simTime||0;out.mx=Math.max(out.mx||0,f.sword.tipVel?f.sword.tipVel.length():0);out.bl=f.sword.blood;out.st=g.simTime;}g.logic(1/60);for(const e of NET.ev){if(e[0]==='bo')out.co++;if(e[0]==='k')out.sp++;if(e[0]==='c'){out.c++;if(e[3])out.wood++;}}const P=g.player;if(P.alive)P.hp=100;}NET.mode='';
  return out;});
console.log(JSON.stringify(r));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
