import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const out=await page.evaluate(async()=>{const g=window.__game,log=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);
  g.startGame();window.__pause=true;const step=n=>{for(let k=0;k<n;k++)g.logic(1/60);};step(200);
  let P=g.player;
  for(let fl=0;fl<8;fl++){const C=g.CRYPT;
    if(C.depth>=3){P.pos.set(C.start.x,0,C.start.z);const prev=new Map();for(let s2=0;s2<40*60;s2++){for(const f of g.fighters)if(f!==P)prev.set(f,{p:[f.pos.x,f.pos.z].map(v=>+v.toFixed(2)),v:[f.vel.x,f.vel.z].map(v=>+v.toFixed(2)),m:f.ai.mind&&{mood:f.ai.mind.mood,job:!!f.ai.mind.job,goal:f.ai.mind.goal,aware:!!f.ai.mind.aware,jump:f.ai.mind.jump},bal:[f.bal.x,f.balV.x].map(v=>+v.toFixed(2)),st:f.stagger,cl:!!f.climb,kn:f.knocked,sw:f.sword&&f.sword.def.id,y:f.pos.y,nav:f.ai.np&&f.ai.np.length,gx:f.ai.gx,gz:f.ai.gz});
        step(1);P.hp=100;const bad=g.fighters.find(f=>!Number.isFinite(f.pos.x+f.pos.z+f.vel.x));if(bad){log.push({d:C.depth,at:s2,was:prev.get(bad),now:{v:[bad.vel.x,bad.vel.z],bal:[bad.bal.x,bad.balV.x],yaw:bad.yaw}});return log;}if(s2%300===0)await wait(0);}}
    const h=C.hole;P.hp=100;P.pos.set(h.x+1,0,h.z+1.2);P.vel.set(0,0,0);for(let k=0;k<200;k++){step(1);if(k%20===0)await wait(0);}for(let k=0;k<400&&(P.ragdoll||k<60);k++)step(1);}
  log.push('none');return log;});
for(const l of out)console.log(JSON.stringify(l));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
