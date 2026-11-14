import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('br','village',{pause:true});
await page.evaluate(async()=>{const g=window.__game;for(let i=0;i<300&&!g.PRW;i++){await new Promise(r=>setTimeout(r,30));g.logic(1/60);}});
const out=await page.evaluate((who)=>{const g=window.__game,L=[];let t=0;
  for(let k=0;k<60*45;k++){g.logic(1/60);t+=1/60;if(g.player&&g.player.alive)g.player.hp=Math.max(g.player.hp,80);
    if(t>24&&k%15===0){const f=g.fighters.find(f=>f.name===who);if(!f||!f.alive)continue;const A=f.ai,z=g.zone,zc=z.next||z,toZ=Math.hypot(f.pos.x-zc.c.x,f.pos.z-zc.c.z),tg=A.target;
      const li=A.loot?g.loot.indexOf(A.loot):-1,lp=A.loot&&A.loot.sword?A.loot.sword.H:null;
      L.push(`${t.toFixed(2)} pos(${f.pos.x.toFixed(1)},${f.pos.z.toFixed(1)}) goal(${A.gx.toFixed(1)},${A.gz.toFixed(1)}) loot#${li}${lp?'@'+lp.x.toFixed(1)+','+lp.y.toFixed(1)+','+lp.z.toFixed(1)+' '+A.loot.def.id:''} lootT ${A.lootT.toFixed(2)} wander(${A.wander.x.toFixed(1)},${A.wander.z.toFixed(1)}) outside ${f.outside?1:0} toZ ${toZ.toFixed(1)} zr ${zc.r.toFixed(1)} zc(${zc.c.x.toFixed(1)},${zc.c.z.toFixed(1)}) tg ${tg?tg.name+' '+Math.hypot(tg.pos.x-f.pos.x,tg.pos.z-f.pos.z).toFixed(1):'-'} np ${A.np?A.np.i+'/'+A.np.n:'-'} stam ${f.stamina.toFixed(0)} detour ${(A.detour||0).toFixed(1)}`);}}
  return L.slice(0,70);},process.env.WHO||'Gunnar');
console.log(out.join('\n'));await browser.close();process.exit(0);
