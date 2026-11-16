// physical fighter: why does balance get lost? sharp turns, then a scripted fight; logs __pfwhy and knockdowns per phase
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud&pf'+(process.env.Q||'')});
const out=await page.evaluate(async([map])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));window.__pfwhy=[];
  g.startGame('duel',map);window.__pause=true;for(let i=0;i<200&&!g.RP;i++){await wait(50);}for(let i=0;i<260;i++)g.logic(1/60);
  const P=g.player,K=g.input.keys,D=g.fighters.find(f=>f!==P);const R={};
  const ph=(name,n,fn,far)=>{window.__pfwhy=[];let down=0,kd=0,was=false,pp=P.pos.clone(),d=0;for(let i=0;i<n;i++){P.stamina=100;P.hp=100;if(D){D.hp=100;if(far){const dx=P.pos.x+30-D.pos.x,dz=P.pos.z+30-D.pos.z;D.pos.x+=dx;D.pos.z+=dz;const sw=D.sword;if(sw)for(const k of ['H','T','Hp','Tp'])if(sw[k]){sw[k].x+=dx;sw[k].z+=dz;}}}fn(i);g.logic(1/60);d+=Math.hypot(P.pos.x-pp.x,P.pos.z-pp.z);pp.copy(P.pos);if(P.ragdoll){down++;if(!was)kd++;if(down%30===1){const Rg=P.ragdoll,S=P.hs;KL.push([name,i,'kn',+(P.knocked||0).toFixed(2),'rise',Rg.rise?[+Rg.rise.t.toFixed(2),Rg.rise.st,+(Rg.rise.p+Rg.rise.a+Rg.rise.b+Rg.rise.c).toFixed(2),Rg.rise.rollT].join('/'):'-','hold',!!Rg.hold,'pin',!!Rg.pin,'prone',!!P.prone,'downed',!!P.downed,'hsfall',S&&S.fall?S.fall.t.toFixed(2):'-','hips',Rg.P&&Rg.P.Hips?Rg.P.Hips.y.toFixed(2):'?','alive',P.alive].join(' '));}}was=!!P.ragdoll;}
    R[name]={speed:+(d/(n/60)).toFixed(2),kd,down,why:window.__pfwhy.slice(0,8)};};
  if(D)D.damage=()=>{};const KL=[];const kd0=P.knockdown.bind(P);P.knockdown=function(...a){KL.push('KD '+new Error().stack.split('\n').slice(2,5).map(s=>s.trim().slice(0,80)).join(' | '));return kd0(...a);};R.kl=KL;const di0=P.die.bind(P);P.die=function(...a){KL.push('DIE '+String(a[1])+' hp '+P.hp+' '+new Error().stack.split('\n').slice(2,5).map(s=>s.trim().slice(0,70)).join(' | '));return di0(...a);};
  ph('zigzag',480,i=>{K.KeyW=true;K.ShiftLeft=true;if(i%40===0)P.yaw+=(i%80?1:-1)*1.2;},1);
  for(const k in K)K[k]=false;
  ph('reverse',480,i=>{K.KeyW=true;K.ShiftLeft=true;if(i%90===0)P.yaw+=Math.PI;},1);
  for(const k in K)K[k]=false;
  ph('stop-go',480,i=>{K.KeyW=i%60<35;K.ShiftLeft=K.KeyW;},1);
  for(const k in K)K[k]=false;
  ph('strafe',480,i=>{K.KeyA=i%80<40;K.KeyD=!K.KeyA;K.ShiftLeft=true;},1);
  for(const k in K)K[k]=false;
  ph('fight',900,i=>{K.KeyW=i%120<60;K.ShiftLeft=i%240<60;K.KeyA=i%90<30;if(i%40===0){g.input.lmb=!g.input.lmb;}},0);
  return R;},[process.env.MAP||'colosseum']);
for(const k in out)console.log(k.padEnd(9),JSON.stringify(out[k]));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
