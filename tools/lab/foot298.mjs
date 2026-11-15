// bot footwork in duels: how much they stand still near each other, circle, step in to strike and step out after
import {boot} from './harness.mjs';
const WEPS=(process.env.WEPS||'arming,longsword,axe').split(','),N=+(process.env.N||3),CAP=+(process.env.CAP||40);
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const cdp=await page.context().newCDPSession(page);
for(const w of WEPS){const T={n:0,still:0,near:0,tan:0,rad:0,inout:0,t:0,stIn:0,stN:0,afterOut:0,afterN:0,vs:[]};
  for(let n=0;n<N;n++){await start('duel','colosseum',{pause:true});
    await page.evaluate(([w])=>{const g=window.__game;const P=g.player;P.isPlayer=false;for(const f of g.fighters){if(!f.sword||f.sword.def.id!==w){g.spawnWeaponLoot(g.WEAPONS[w],f.pos.x,f.pos.z);g.pickUp(f,g.loot[g.loot.length-1]);}f.ai.skill=.6;f.ai.aggr=1;f.ai.react=.2;}
      window.__F={n:0,still:0,near:0,tan:0,rad:0,inout:0,t:0,stIn:0,stN:0,afterOut:0,afterN:0,vs:[],ph:{},sg:{},sgT:{},end:{}};},[w]);
    let done=false;for(let c=0;c<CAP&&!done;c+=10){done=await page.evaluate(()=>{const g=window.__game,F=window.__F;
      for(let k=0;k<600;k++){g.logic(1/60);F.t+=1/60;const al=g.fighters.filter(f=>f.alive&&!f.dummy);if(al.length<2||g.state!=='playing')return true;
        for(const f of al){if(f.ragdoll)continue;const o=al.find(q=>q!==f);const dx=o.pos.x-f.pos.x,dz=o.pos.z-f.pos.z,d=Math.hypot(dx,dz)||1,ux=dx/d,uz=dz/d;const vr=f.vel.x*ux+f.vel.z*uz,vt=-f.vel.x*uz+f.vel.z*ux,sp=Math.hypot(f.vel.x,f.vel.z);
          if(d<3.2){F.near++;if(sp<.25)F.still++;F.tan+=Math.abs(vt);F.rad+=Math.abs(vr);if(k%10===0)F.vs.push(sp);
            const s=vr>.5?1:vr<-.5?-1:0;if(s&&s!==F.sg[f.id]){if(F.sg[f.id])F.inout++;F.sg[f.id]=s;}}
          const ph=f.ai.phase,p=F.ph[f.id];if(ph==='strike'&&p!=='strike'){F.stN++;if(vr>.4)F.stIn++;}if(p==='strike'&&ph!=='strike')F.end[f.id]=F.t;
          if(F.end[f.id]&&F.t-F.end[f.id]>.4&&F.t-F.end[f.id]<.42){F.afterN++;if(vr<-.4)F.afterOut++;}F.ph[f.id]=ph;}}
      return false;});await cdp.send('HeapProfiler.collectGarbage');}
    const r=await page.evaluate(()=>window.__F);for(const k of ['still','near','tan','rad','inout','t','stIn','stN','afterOut','afterN'])T[k]+=r[k];T.vs.push(...r.vs);}
  const ns=T.near||1;T.vs.sort((a,b)=>a-b);const q=p=>T.vs[Math.floor(p*T.vs.length)]||0;
  console.log(`${w}: near ${(T.near/60/2).toFixed(0)} s/fighter, still ${(100*T.still/ns).toFixed(0)}%, |sideways| ${(T.tan/ns).toFixed(2)} m/s, |in-out| ${(T.rad/ns).toFixed(2)} m/s, speed p50 ${q(.5).toFixed(2)} p90 ${q(.9).toFixed(2)}, in/out switches/min ${(T.inout/(T.t/60)/2).toFixed(1)}, strikes stepping in ${(100*T.stIn/(T.stN||1)).toFixed(0)}% of ${T.stN}, stepping out after ${(100*T.afterOut/(T.afterN||1)).toFixed(0)}%`);}
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
