// physical weapon stability: standing in guard, the weapon body is kicked (spin + speed); does the hand settle or shake on?
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud&pf'+(process.env.Q||'')});
const out=await page.evaluate(async([kicks,mode])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  g.startGame('duel','colosseum');window.__pause=true;for(let i=0;i<200&&!g.RP;i++){await wait(50);}for(let i=0;i<260;i++)g.logic(1/60);
  const P=g.player,K=g.input.keys;P.damage=()=>{};
  const park=()=>{for(const D of g.fighters){if(D===P)continue;D.damage=()=>{};const dx=22-D.pos.x,dz=22-D.pos.z;D.pos.x+=dx;D.pos.z+=dz;const sw=D.sword;if(sw)for(const k of ['H','T','Hp','Tp'])if(sw[k]){sw[k].x+=dx;sw[k].z+=dz;}D.vel.set(0,0,0);}};
  const W=n=>{const e=P.bones[n].matrixWorld.elements;return [e[12],e[13],e[14]];};const R=[];
  for(let k=0;k<kicks;k++){let prev=null,j1=0,j2=0;const a=k*1.7;
    for(let i=0;i<150;i++){park();P.stamina=100;P.hp=100;if(mode&1){K.KeyW=i%60<40;K.KeyA=i%50<20;}if(mode&2){g.input.lmb=(i%40)<20;}if(mode&4)P.yaw+=.03;
      if(i===20){const wb=P.hs&&P.hs.wb;if(wb&&wb.b){wb.b.setAngvel({x:25*Math.cos(a),y:10,z:25*Math.sin(a)},true);wb.b.setLinvel({x:6*Math.sin(a),y:3,z:6*Math.cos(a)},true);}}
      g.logic(1/60);g.scene.updateMatrixWorld(true);if(P.ragdoll){prev=null;continue;}const H=W('Hips'),r=W('RightHand');const c=[r[0]-H[0],r[1]-H[1],r[2]-H[2]];
      if(prev){const d=Math.hypot(c[0]-prev[0],c[1]-prev[1],c[2]-prev[2]);if(d>.08){if(i<60)j1++;else j2++;}}prev=c;}
    R.push((P.sword?P.sword.def.id:'-')+' wb '+!!(P.hs&&P.hs.wb)+' hs '+!!P.hs+' kick'+k+' early '+j1+' late(>0.67s) '+j2+(P.hs&&P.hs.wb?'':' nowb'));}
  return R;},[+(process.env.N||6),+(process.env.MODE||0)]);
console.log(out.join('\n'));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
