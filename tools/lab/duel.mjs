// bot v bot duels: how good is the fighting? strikes thrown, how many land, how fast, how hard, how long a fight lasts
import {boot} from './harness.mjs';
const WEPS=(process.env.WEPS||'arming,longsword,axe,mace,spear,greatsword').split(','),N=+(process.env.N||4),CAP=+(process.env.CAP||70);
const AR=process.env.AR||'';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const cdp=await page.context().newCDPSession(page);
for(const w of WEPS){const tot={kicks:0,catches:0,dist:[0,0,0,0,0],lean:[],fights:0,t:0,dec:0,strikes:0,hits:0,dmg:0,speed:0,soft:0,glance:0,clash:0,peak:0,peakN:0,far:0,modes:{},zones:{},kd:0,slow:0};
  for(let n=0;n<N;n++){
    await start('duel','colosseum',{pause:true});
    await page.evaluate(([w,AR])=>{const g=window.__game;const P=g.player;P.isPlayer=false;window.__hitGap=window.__hitGap||[];window.__stats={};window.__D={t:0,strikes:0,peak:0,peakN:0,far:0,ph:{},pk:{},kd:0,kdS:{},kicks:0,kS:{},dist:[0,0,0,0,0],lean:[],catches:0,cS:{}};
},[w,AR]);
    await page.evaluate(([w,AR])=>{const g=window.__game;for(const f of g.fighters){if(!f.sword||f.sword.def.id!==w){g.spawnWeaponLoot(g.WEAPONS[w],f.pos.x,f.pos.z);g.pickUp(f,g.loot[g.loot.length-1]);}if(AR)for(const a of AR.split('+'))f.equip(g.ARMOR[a]);if(!window.__keepAI){f.ai.skill=.6;f.ai.aggr=1;f.ai.react=.2;}}for(let i=g.loot.length-1;i>=0;i--){}},[w,AR]);
    let done=false;for(let c=0;c<CAP&&!done;c+=10){done=await page.evaluate(()=>{const g=window.__game,D=window.__D;
      for(let k=0;k<600;k++){g.logic(1/60);D.t+=1/60;const al=g.fighters.filter(f=>f.alive&&!f.dummy);if(al.length<2||g.state!=='playing')return true;
        if(al.length===2&&k%6===0){const d=Math.hypot(al[0].pos.x-al[1].pos.x,al[0].pos.z-al[1].pos.z);D.dist[d<.7?0:d<1?1:d<1.5?2:d<2.5?3:4]++;}for(const f of al){const A=f.ai,p=D.ph[f.id];if(A.phase==='strike'){const tv=f.sword?f.sword.tipVel.length():0;D.pk[f.id]=Math.max(D.pk[f.id]||0,tv);if(p!=='strike'){D.strikes++;const tg=A.target;if(tg){const d=Math.hypot(tg.pos.x-f.pos.x,tg.pos.z-f.pos.z);if(d>(f.sword?f.sword.def.len:.5)+1.0)D.far++;}}}
          else if(p==='strike'){D.peak+=D.pk[f.id]||0;D.peakN++;D.pk[f.id]=0;}
          D.ph[f.id]=A.phase;const kk=f.kickT>=0;if(kk&&!D.kS[f.id])D.kicks++;D.kS[f.id]=kk;const cc=f.catchT||0;if(cc!==(D.cS[f.id]||0))D.catches++;D.cS[f.id]=cc;if(k%6===0&&!f.ragdoll&&f.bones&&f.bones.Hips&&f.bones.Neck){const a=f.bones.Hips.matrixWorld.elements,b=f.bones.Neck.matrixWorld.elements;const dx=b[12]-a[12],dy=b[13]-a[13],dz=b[14]-a[14];const fx=Math.sin(f.yaw),fz=Math.cos(f.yaw);D.lean.push(Math.atan2(dx*fx+dz*fz,dy)*57.3);}const kd=!!f.ragdoll;if(kd&&!D.kdS[f.id])D.kd++;D.kdS[f.id]=kd;}}
      return false;});await cdp.send('HeapProfiler.collectGarbage');}
    const r=await page.evaluate(()=>{const g=window.__game,D=window.__D,S=window.__stats;const al=g.fighters.filter(f=>f.alive&&!f.dummy).length;return {D:{t:D.t,strikes:D.strikes,peak:D.peak,peakN:D.peakN,far:D.far,kd:D.kd,kicks:D.kicks,dist:D.dist,lean:D.lean,catches:D.catches},S,al,w:g.fighters.map(f=>f.sword&&f.sword.def.id)};});
    if(n===0&&process.env.V)console.log('  weps',r.w);
    tot.fights++;tot.t+=r.D.t;if(r.al<2)tot.dec++;tot.strikes+=r.D.strikes;tot.peak+=r.D.peak;tot.peakN+=r.D.peakN;tot.far+=r.D.far;tot.kd+=r.D.kd;tot.kicks+=r.D.kicks;tot.catches+=r.D.catches;r.D.dist.forEach((v,i)=>tot.dist[i]+=v);tot.lean.push(...r.D.lean);tot.clash+=r.S.clashes||0;
    for(const k in r.S){const s=r.S[k];if(typeof s!=='object')continue;tot.hits+=s.hits||0;tot.dmg+=s.dmg||0;tot.speed+=s.speed||0;tot.soft+=s.soft||0;tot.glance+=s.glance||0;for(const m in s.modes||{})tot.modes[m]=(tot.modes[m]||0)+s.modes[m];for(const z in s.zones||{})tot.zones[z]=(tot.zones[z]||0)+s.zones[z];}
    await page.evaluate(()=>{window.__pause=true;});}
  const f=x=>x.toFixed(1);{const L=tot.lean.sort((a,b)=>a-b),q=p=>L[Math.floor(p*(L.length-1))]||0,ds=tot.dist.reduce((a,b)=>a+b,0)||1;console.log(`   kicks/min ${f(tot.kicks/tot.t*60)}, catches/min ${f(tot.catches/tot.t*60)} | apart <0.7 ${f(tot.dist[0]/ds*100)}% <1 ${f(tot.dist[1]/ds*100)}% <1.5 ${f(tot.dist[2]/ds*100)}% <2.5 ${f(tot.dist[3]/ds*100)}% more ${f(tot.dist[4]/ds*100)}% | lean fwd(+)/back(-) deg p1 ${f(q(.01))} p10 ${f(q(.1))} p50 ${f(q(.5))} p90 ${f(q(.9))} p99 ${f(q(.99))}, back past 20: ${f(L.filter(x=>x<-20).length/Math.max(1,L.length)*100)}%`);}
  console.log(`${w}${AR?'+'+AR:''}: ${tot.fights} fights, ${tot.dec} decided, mean ${f(tot.t/tot.fights)} s | strikes/min ${f(tot.strikes/tot.t*60)} (out of reach ${f(tot.far/Math.max(1,tot.strikes)*100)}%), peak tip ${f(tot.peak/Math.max(1,tot.peakN))} m/s | hits/strike ${f(tot.hits/Math.max(1,tot.strikes))}, hit speed ${f(tot.speed/Math.max(1,tot.hits))}, dmg/hit ${f(tot.dmg/Math.max(1,tot.hits))}, glance ${f(tot.glance/Math.max(1,tot.hits)*100)}%, soft touches ${tot.soft}, clashes ${tot.clash}, knockdowns ${tot.kd} | ${JSON.stringify(tot.modes)} ${JSON.stringify(tot.zones)}`);
}
{const G=await page.evaluate(()=>window.__hitGap||[]);G.sort((a,b)=>a-b);const q=p=>((G[Math.floor(p*(G.length-1))]||0)*100).toFixed(1);console.log(`hit registered at cm from the skin (+ in the air): n ${G.length} p10 ${q(.1)} p50 ${q(.5)} p90 ${q(.9)} max ${q(1)}`);}
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
