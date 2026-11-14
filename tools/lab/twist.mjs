// joint turns of standing fighters' arms in a fight: twist about each bone's own length and bend, against the bind pose
import {boot} from './harness.mjs';
const WEPS=(process.env.WEPS||'longsword,arming').split(',');const SEC=+(process.env.SEC||25);
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
for(const w of WEPS){await start('duel','colosseum',{pause:true});
  await page.evaluate(([w])=>{const g=window.__game;g.player.isPlayer=false;for(const f of g.fighters){g.spawnWeaponLoot(g.WEAPONS[w],f.pos.x,f.pos.z);g.pickUp(f,g.loot[g.loot.length-1]);f.noSever=true;}},[w]);
  const acc={};
  for(let c=0;c<SEC;c+=5){const r=await page.evaluate(()=>{const g=window.__game,T=g.THREE,out={};const q=new T.Quaternion(),bq=new T.Quaternion();
    const names=['Arm','ForeArm','Hand'];
    for(let i=0;i<300;i++){g.logic(1/60);for(const f of g.fighters){if(!f.alive||f.ragdoll){if(f.alive===false){f.hp=100;}continue;}f.hp=Math.max(f.hp,60);
      for(const sd of ['Left','Right'])for(const n of names){const b=f.bones[sd+n];if(!b||!b.userData.bq)continue;const B=b.userData.bq;bq.set(B[0],B[1],B[2],B[3]);if(B.isQuaternion)bq.copy(B);q.copy(bq).invert().multiply(b.quaternion);if(q.w<0){q.x=-q.x;q.y=-q.y;q.z=-q.z;q.w=-q.w;}
        const tw=2*Math.atan2(q.y,q.w)*57.3,sw=2*Math.acos(Math.min(1,Math.hypot(q.w,q.y)))*57.3;const k=(f.mainArm===(sd==='Left'?'L':'R')?'main':'off')+n;(out[k+'.tw']||(out[k+'.tw']=[])).push(tw);(out[k+'.sw']||(out[k+'.sw']=[])).push(sw);}}}
    return out;});for(const k in r)(acc[k]||(acc[k]=[])).push(...r[k]);}
  console.log('==',w);for(const k of Object.keys(acc).sort()){const a=acc[k].sort((x,y)=>x-y),p=x=>a[Math.min(a.length-1,Math.floor(x*a.length))].toFixed(0);console.log(' ',k.padEnd(16),'min',p(0),'p1',p(.01),'p10',p(.1),'p50',p(.5),'p90',p(.9),'p99',p(.99),'max',p(1));}}
console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
