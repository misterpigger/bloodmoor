// a live duel filmed from the player's own camera: the player walks in, holds a moving guard and cuts (scripted, as in arm325), the bot fights back.
// Q adds query (&pf). WEP weapon. SECS length. STEP render every n frames. OUT folder; writes frames, out.mp4 (30 fps of game time /STEP) and log.txt
import {boot} from './harness.mjs';import fs from 'fs';import {execSync} from 'child_process';
const OUT=process.env.OUT||'film326';fs.mkdirSync(OUT,{recursive:true});for(const f of fs.readdirSync(OUT))if(f.endsWith('.jpg'))fs.unlinkSync(OUT+'/'+f);
const STEP=+(process.env.STEP||2),SECS=+(process.env.SECS||8),WEP=process.env.WEP||'longsword',MAP=process.env.MAP||'arena';
const {browser,page,logs,fr,shot,start}=await boot({W:+(process.env.W||560),HH:+(process.env.H||340),query:'?nohud'+(process.env.Q||'')});
if(process.env.WALK)await page.evaluate(()=>{window.__walkOnly=1;});if(process.env.SWEEP)await page.evaluate(()=>{window.__sweep=1;window.__walkOnly=1;});if(process.env.MOUSE)await page.evaluate(()=>{window.__mouse=1;window.__walkOnly=1;});
await start('duel',MAP);
await page.evaluate(async([wep,map])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#yard{display:none!important}';document.head.appendChild(st);
  window.__pause=true;for(let i=0;i<200&&!g.RP;i++)await wait(50);for(let i=0;i<240;i++)g.logic(1/60);
  const P=g.player;if(wep&&(!P.sword||P.sword.def.id!==wep)){g.spawnWeaponLoot(g.WEAPONS[wep],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
  P.damage=()=>{};if(P.armor)for(const k of Object.keys(P.armor))if(P.armor[k])P.unequip(k);window.__fi=0;if(window.__walkOnly||window.__mouse||window.__sweep)for(const f of g.fighters)if(f!==P){f.think=()=>{};f.pos.x+=60;}},[WEP,MAP]);
await fr(2,1/60);
const N=SECS*60;const log=[];let fi=0;
for(let i=0;i<N;i++){
  const r=await page.evaluate((i)=>{const g=window.__game,P=g.player,T=g.THREE,input=g.input;const B=g.fighters.find(f=>f!==P&&f.alive);P.stamina=100;P.hp=Math.max(P.hp,60);if(B)B.hp=Math.max(B.hp,60);
    const t=i/60,ph=t%1.3;input.locked=false;
    if(ph<.5){input.mx=.5+.3*Math.sin(t*2.1);input.my=.4+.2*Math.cos(t*1.7);input.lmb=false;}
    else if(ph<.62){input.mx=(Math.floor(t/1.3)%2)?.85:.15;input.my=.15;input.lmb=false;}
    else{const u=(ph-.62)/.68,side=(Math.floor(t/1.3)%2);input.mx=side?.85-.7*Math.min(1,u*2):.15+.7*Math.min(1,u*2);input.my=.15+.6*Math.min(1,u*2);input.lmb=true;}
    P.ctrl.z=.46;
    if(window.__sweep){const k=input.keys={};input.locked=true;const ph=i%90,sd=Math.floor(i/90)%2?1:-1;let dx=0,dy=0;input.lmb=false;if(ph<30){dx=-sd*14;dy=-6;}else if(ph<42){}else if(ph<60){dx=sd*55;dy=9;input.lmb=true;}else{input.lmb=ph<70;dy=(P.ctrl.y>.45?-3:0);}if((i%600)>420)k.KeyW=true;g.aimMove(dx,dy);g.logic(1/60);return [+Math.hypot(P.vel.x,P.vel.z).toFixed(2),P.sword?+P.sword.tipVel.length().toFixed(1):0,P.ragdoll?1:0,-1];}
    if(window.__mouse){const k=input.keys={};input.locked=true;let S=window.__ms||(window.__ms={s:7,n:0});const rnd=()=>{S.s=(S.s*16807)%2147483647;return S.s/2147483647;};if(S.n<=0){const big=rnd()<.5;S.dx=(rnd()-.5)*(big?70:25);S.dy=(rnd()-.5)*(big?60:20);S.n=6+Math.floor(rnd()*20);S.lmb=rnd()<.55;}S.n--;input.lmb=S.lmb;if((i%400)<200)k.KeyW=true;g.aimMove(S.dx,S.dy);g.logic(1/60);return [+Math.hypot(P.vel.x,P.vel.z).toFixed(2),0,P.ragdoll?1:0,-1];}
    if(window.__walkOnly){const k=input.keys={};input.lmb=false;input.mx=.5+.12*Math.sin(t*1.3);input.my=.42;const u=t%7;if(u<2.4)k.KeyW=true;else if(u<2.9){}else if(u<4.4)k.KeyD=true;else if(u<5.9)k.KeyS=true;else k.KeyA=true;g.logic(1/60);return [+Math.hypot(P.vel.x,P.vel.z).toFixed(2),0,P.ragdoll?1:0,-1];}
    if(B){const dx=B.pos.x-P.pos.x,dz=B.pos.z-P.pos.z,d=Math.hypot(dx,dz);P.yaw=Math.atan2(dx,dz);input.keys.KeyW=d>1.9;input.keys.KeyS=d<1.2;}
    g.logic(1/60);
    return [+(P.vel?Math.hypot(P.vel.x,P.vel.z):0).toFixed(2),P.sword?+P.sword.tipVel.length().toFixed(1):0,P.ragdoll?1:0,B?+B.pos.distanceTo(P.pos).toFixed(2):-1];},i);
  log.push(i+':'+r.join('/'));
  if(i%STEP===0){await fr(1,0);await shot(`${OUT}/f${String(fi).padStart(4,'0')}.jpg`,84);fi++;}}
fs.writeFileSync(OUT+'/log.txt',log.join('\n'));
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();
execSync(`ffmpeg -v error -y -framerate ${60/STEP} -i ${OUT}/f%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 20 ${OUT}/out.mp4`);process.exit(0);
