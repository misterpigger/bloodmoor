// gore check: the player's scripted cut to the head and thrust to the chest at a dressed dummy, filmed from the side through the game's pipeline; then the body and the ground
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'gore';fs.mkdirSync(OUT,{recursive:true});const WEP=process.env.WEP||'longsword';
const {browser,page,logs,fr,start,shot}=await boot({W:+(process.env.W||986),HH:+(process.env.H||544),query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await fr(2,1/30);
await page.evaluate(async(w)=>{const g=window.__game,T=g.THREE,P=g.player,input=g.input;window.__pause=true;
  const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#banner,#yard,#toast{display:none!important}';document.head.appendChild(st);
  for(let k=0;k<120;k++)g.logic(1/60);g.spawnWeaponLoot(g.WEAPONS[w],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);
  const D=g.fighters.filter(f=>f.dummy&&f.alive).sort((a,b)=>a.pos.distanceTo(P.pos)-b.pos.distanceTo(P.pos))[0];window.__D=D;for(const s of ['head','body','arms','legs'])if(D.armor[s])D.unequip(s);
  window.__relook(D,Object.assign({},D.look,{o:4,bl:0,ft:1,h:1}));D._rsk=null;D.pal=['#6b6f73','#3a3f52','#2a2420',0];
  const home=P.pos.clone(),yaw=P.yaw,f=new T.Vector3(Math.sin(yaw),0,Math.cos(yaw)),r=new T.Vector3(f.z,0,-f.x);window.__G={home,yaw,f,r,dist:1.45};
  window.__step=(mx,my,lmb,z,hold)=>{const G=window.__G;input.locked=false;P.stamina=100;input.mx=mx;input.my=my;input.lmb=lmb;input.stab=false;P.ctrl.z=z;if(hold&&D.alive&&!D.ragdoll){D.pos.x=home.x+f.x*G.dist;D.pos.z=home.z+f.z*G.dist;D.vel.set(0,0,0);D.yaw=yaw+Math.PI;}g.logic(1/60);g.updateBlood(1/60);};
  window.__cam=(side,up,fwd,ty,tf)=>{const G=window.__G;window.__dbgCam={p:home.clone().addScaledVector(r,side).addScaledVector(f,fwd).add(new T.Vector3(0,up,0)),t:home.clone().addScaledVector(f,tf==null?G.dist:tf).add(new T.Vector3(0,ty,0))};};
  for(let i=0;i<60;i++)window.__step(.5,.45,false,.46,true);},WEP);
await new Promise(r=>setTimeout(r,2500));
const run=(n,a)=>page.evaluate(([n,a])=>{for(let i=0;i<n;i++)window.__step(...a);},[n,a]);
const sweep=(n,p,q)=>page.evaluate(([n,p,q])=>{for(let i=0;i<n;i++){const u=(i+1)/n;window.__step(p[0]+(q[0]-p[0])*u,p[1]+(q[1]-p[1])*u,true,.46,true);}},[n,p,q]);
const cam=(...a)=>page.evaluate(a=>window.__cam(...a),a);let k=0;const snap=async(tag)=>{await fr(1,1/600);await shot(`${OUT}/${String(k++).padStart(2,'0')}_${tag}.jpg`,90);console.log('shot',tag);};
const info=()=>page.evaluate(()=>{const D=window.__D;return {hp:+D.hp.toFixed(0),alive:D.alive,rag:!!D.ragdoll,src:(D.bloodSrc||[]).length,log:(window.__ulog||[]).map(h=>h.slice(0,3))};});
// 1: a cut at the head from the right
await page.evaluate(()=>{window.__ulog=[];});await cam(1.5,1.75,-.6,1.45);
await run(34,[.86,.14,false,.46,true]);await sweep(7,[.86,.14],[.5,.3]);await snap('cut_a');await sweep(5,[.5,.3],[.25,.5]);await snap('cut_b');
for(let i=0;i<3;i++){await run(5,[.2,.6,true,.46,true]);await snap('cut_c'+i);}console.log(JSON.stringify(await info()));
await run(40,[.5,.45,false,.46,true]);await cam(.55,1.6,.75,1.5);await snap('face');await cam(1.4,1.2,1.2,.1);await snap('ground1');
// 2: thrust to the chest
await page.evaluate(()=>{window.__ulog=[];window.__D.hp=Math.max(window.__D.hp,60);});await cam(1.5,1.75,-.6,1.3);
await run(20,[.5,.42,false,.46,true]);for(let i=0;i<8;i++)await run(1,[.5,.42,false,.46+(i+1)/8*.5,true]);await snap('stab_a');
for(let i=0;i<3;i++){await run(6,[.5,.42,false,.96,true]);await snap('stab_b'+i);}console.log(JSON.stringify(await info()));
for(let i=0;i<3;i++){await run(10,[.5,.45,false,.46,true]);await snap('stab_c'+i);}
// 3: more cuts until he is dead, then the body and the ground
await page.evaluate(()=>{window.__D.dummy=false;window.__D.hp=45;});
for(let c=0;c<5;c++){const i=await info();if(!i.alive)break;await run(26,[c%2?.14:.86,.14,false,.46,!i.rag]);await sweep(12,[c%2?.14:.86,.14],[c%2?.82:.18,.6]);await run(14,[c%2?.82:.18,.6,true,.46,false]);}
await page.evaluate(()=>{const D=window.__D;if(D.alive)D.damage(200,null,'test');});await run(200,[.5,.45,false,.46,false]);console.log(JSON.stringify(await info()));
await page.evaluate(()=>{const D=window.__D,T=window.__game.THREE,h=D.ragdoll?D.ragdoll.P.Spine2.clone():D.pos.clone(),G=window.__G;window.__dbgCam={p:h.clone().addScaledVector(G.r,1.6).addScaledVector(G.f,-1.4).add(new T.Vector3(0,1.7,0)),t:h};});await snap('body');
await page.evaluate(()=>{const D=window.__D,T=window.__game.THREE,h=D.ragdoll?D.ragdoll.P.Spine2.clone():D.pos.clone(),G=window.__G;window.__dbgCam={p:h.clone().add(new T.Vector3(.3,3.2,.3)),t:h};});await snap('top');
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
