import {boot} from './harness.mjs';
const W=process.env.WEP||'greatsword';const MT=+(process.env.MT||.25);
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await new Promise(r=>setTimeout(r,2500));
const out=await page.evaluate(async([w,MT,HP])=>{const g=window.__game,T=g.THREE,P=g.player,input=g.input,res={};if(HP)Object.assign(g.HANDLING[w],HP);
  for(let k=0;k<120;k++)g.logic(1/60);for(const f of g.fighters)if(f!==P){f.pos.x+=40;}
  g.spawnWeaponLoot(g.WEAPONS[w],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);
  const moves={cutR:[[.86,.14],[.18,.72]],cutL:[[.14,.14],[.82,.72]],chop:[[.5,.03],[.5,.92]]};
  for(const [mn,[a,b]] of Object.entries(moves)){const tr=[];
    const step=(mx,my,lmb)=>{input.locked=false;P.stamina=100;input.mx=mx;input.my=my;input.lmb=lmb;P.ctrl.z=.46;g.logic(1/60);const s=P.sword;return [+(s.tipVel.length()).toFixed(1),+(s.Hv.length()).toFixed(1)];};
    for(let i=0;i<50;i++)step(.5,.45,false);for(let i=0;i<30;i++)step(a[0],a[1],false);
    const n=Math.round(MT*60);for(let i=0;i<n;i++){const u=(i+1)/n;tr.push(step(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,true));}
    for(let i=0;i<30;i++)tr.push(step(b[0],b[1],true));
    res[mn]={tip:tr.map(x=>x[0]).join(' '),hand:tr.map(x=>x[1]).join(' ')};}
  return res;},[W,MT,process.env.HP?JSON.parse(process.env.HP):null]);
for(const k in out){console.log(k,'tip :',out[k].tip);console.log(k,'hand:',out[k].hand);}
console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
