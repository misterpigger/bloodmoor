// arm glitch check in a live duel: the player sweeps the aim and cuts (scripted), the bot fights back. Per drawn frame, for the player (P) and the bot (B):
// elbow jumps (> 8 cm a frame against the chest), hand jumps (> 10 cm), drawn main hand off the weapon's grip, elbow inside own trunk, and hand lag (handTarget vs grip).
// Q adds query (e.g. &pf). WEP picks the player's weapon. SECS length.
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const r=await page.evaluate(async([wep,secs])=>{const g=window.__game,T=g.THREE;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  g.startGame('duel','colosseum');window.__pause=true;for(let i=0;i<200&&!g.RP;i++)await wait(50);for(let i=0;i<240;i++)g.logic(1/60);
  const P=g.player,B=g.fighters.find(f=>f!==P),input=g.input;
  if(wep&&(!P.sword||P.sword.def.id!==wep)){g.spawnWeaponLoot(g.WEAPONS[wep],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
  P.damage=()=>{};P.knockdown=()=>{};const st={};const S=(f,k)=>{const o=st[k]||(st[k]={n:0,ej:0,hj:0,gap:[],intr:0,lag:[],kd:0});return o;};
  const W=(f,n)=>{const b=f.bones[n];if(!b)return null;const e=b.matrixWorld.elements;return new T.Vector3(e[12],e[13],e[14]);};
  const prev=new Map();let wasDown={P:false,B:false};
  const N=secs*60;for(let i=0;i<N;i++){P.stamina=100;P.hp=Math.max(P.hp,60);if(B){B.hp=Math.max(B.hp,60);}
    // scripted player: wander the guard, cut across every ~1.3 s, thrust sometimes, keep facing the bot, step in/out
    const t=i/60,ph=t%1.3;input.locked=false;
    if(ph<.5){input.mx=.5+.3*Math.sin(t*2.1);input.my=.4+.2*Math.cos(t*1.7);input.lmb=false;}
    else if(ph<.62){input.mx=(Math.floor(t/1.3)%2)?.85:.15;input.my=.15;input.lmb=false;}
    else{const u=(ph-.62)/.68,side=(Math.floor(t/1.3)%2);input.mx=side?.85-.7*Math.min(1,u*2):.15+.7*Math.min(1,u*2);input.my=.15+.6*Math.min(1,u*2);input.lmb=true;}
    P.ctrl.z=(Math.floor(t/1.3)%5===4&&ph>.5)?.66:.46;
    if(B){const dx=B.pos.x-P.pos.x,dz=B.pos.z-P.pos.z,d=Math.hypot(dx,dz);P.yaw=Math.atan2(dx,dz);input.keys.KeyW=d>1.9;input.keys.KeyS=d<1.2;}
    g.logic(1/60);g.scene.updateMatrixWorld(true);
    for(const [k,f] of [['P',P],['B',B]]){if(!f)continue;const o=S(f,k);if(f.ragdoll||!f.alive){if(!wasDown[k]&&f.ragdoll)o.kd++;wasDown[k]=!!f.ragdoll;prev.delete(k);continue;}wasDown[k]=false;o.n++;if(f.hs&&f.hs.T&&f.hs.T.RightArm){(o.sh=o.sh||[]).push(W(f,'RightArm').distanceTo(f.hs.T.RightArm));(o.hp=o.hp||[]).push(W(f,'Hips').distanceTo(f.hs.T.Hips||W(f,'Hips')));}
      const ch=W(f,'Spine2');const ms=(f.mainArm==='L'?'Left':'Right'),os=ms==='Right'?'Left':'Right';
      const cur={};for(const s of ['Right','Left']){cur[s+'E']=W(f,s+'ForeArm').sub(ch);cur[s+'H']=W(f,s+'Hand').sub(ch);}
      const pv=prev.get(k);if(pv){for(const s of ['Right','Left']){if(cur[s+'E'].distanceTo(pv[s+'E'])>.08){o.ej++;const sh=W(f,s+'Arm'),hd=W(f,s+'Hand');const ext=sh.distanceTo(hd)/((f.armLen?f.armLen[0]+f.armLen[1]:.55));(o.det=o.det||[]).push([i,s[0],+cur[s+'E'].distanceTo(pv[s+'E']).toFixed(2),+cur[s+'H'].distanceTo(pv[s+'H']).toFixed(2),+ext.toFixed(2),f.commit?1:0,+(f.stagger||0).toFixed(2),f.rec?1:0,+(f.calmW||0).toFixed(1),f.hs&&f.hs.dO?+Math.hypot(f.hs.dO.x||0,f.hs.dO.y||0,f.hs.dO.z||0).toFixed(2):-1,(f.offOn?1:0),+(f._shW||0).toFixed(1),+(f._hfW||0).toFixed(1),(()=>{const S=f.hs;if(!S||!S.T)return 'noT';const T=S.T,nm=s;const e=W(f,nm+'ForeArm'),sh=W(f,nm+'Arm');return [T[nm+'ForeArm']?+e.distanceTo(T[nm+'ForeArm']).toFixed(2):-1,T[nm+'Arm']?+sh.distanceTo(T[nm+'Arm']).toFixed(2):-1,S.pin.has('ha'+nm[0])?1:0];})()]);}if(cur[s+'H'].distanceTo(pv[s+'H'])>.10)o.hj++;}}
      prev.set(k,cur);
      if(f.sword&&f.sword.H){const h=W(f,ms+'Hand');o.gap.push(h.distanceTo(f.sword.H));const tg=f.handTarget(new T.Vector3());o.lag.push(tg.distanceTo(f.sword.H));}
      // elbow inside own trunk: elbow within 0.13 m of the Spine1-Neck line
      const a=W(f,'Spine1'),b=W(f,'Neck');for(const s of ['Right','Left']){const e=W(f,s+'ForeArm');const ab=b.clone().sub(a),t2=Math.max(0,Math.min(1,e.clone().sub(a).dot(ab)/ab.lengthSq()));if(e.distanceTo(a.clone().addScaledVector(ab,t2))<.13)o.intr++;}}}
  const q=(a,p)=>{if(!a.length)return '-';const b=[...a].sort((x,y)=>x-y);return (b[Math.min(b.length-1,Math.floor(b.length*p))]*100).toFixed(1);};
  const out={};for(const k in st){const o=st[k];out[k]={frames:o.n,elbowJumps:o.ej,handJumps:o.hj,gap50:q(o.gap,.5),gap95:q(o.gap,.95),lag50:q(o.lag,.5),lag90:q(o.lag,.9),elbowInTrunk:o.intr,sh50:q(o.sh||[],.5),sh90:q(o.sh||[],.9),hip50:q(o.hp||[],.5),hip90:q(o.hp||[],.9),kd:o.kd,det:(o.det||[]).filter(r=>r[2]>.12&&r[2]>2*r[3])};}
  return out;},[process.env.WEP||'',+(process.env.SECS||25)]);
console.log(JSON.stringify(r));console.log(logs.slice(0,3).join('\n')||'no errors');await browser.close();process.exit(0);
