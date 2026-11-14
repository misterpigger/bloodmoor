// elbows in walls: sweep a weapon in the longest corridor and against a room wall, count frames where either elbow is inside stone
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
const out=await page.evaluate(async()=>{const g=window.__game,res={};const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);
  for(const f of g.fighters.slice())if(f!==g.player){f.dispose();g.fighters.splice(g.fighters.indexOf(f),1);}
  const C=g.CRYPT,P=g.player,T=g.THREE,k=C.cors.slice().sort((a,b)=>b.L-a.L)[0];const e=new T.Vector3();
  for(const pw of [0,1]){window.__noPW=!pw;for(const wid of ['arming','longsword','poleaxe']){g.spawnWeaponLoot(g.WEAPONS[wid],P.pos.x+.4,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);
    for(const where of ['tunnel','wall','face']){if(where==='tunnel'){if(k.ax){P.pos.set((k.x0+k.x1)/2,0,k.m);P.yaw=Math.PI/2;}else{P.pos.set(k.m,0,(k.z0+k.z1)/2);P.yaw=0;}}
      else{P.pos.set(C.start.x,0,C.start.z);let x=C.start.x;for(let i=0;i<40;i++){const q=new T.Vector3(x+.1,1,C.start.z);if(g.collide?g.collide(q,.3,true):false)break;x+=.1;}P.pos.x=x-(where==='face'?.25:.15);P.yaw=where==='face'?Math.PI/2:0;}
      P.vel.set(0,0,0);for(let i=0;i<30;i++)g.logic(1/60);g.input.locked=false;g.input.lmb=true;let bad=0,n=0,dep=0;
      for(let q=0;q<480;q++){const ph=q/60*Math.PI*1.3;g.input.mx=innerWidth/2+Math.sin(ph)*innerWidth*.5;g.input.my=innerHeight*.45+Math.cos(ph*.7)*innerHeight*.25;g.input.lmb=q%120<80;P.stamina=100;P.hp=100;g.logic(1/60);
        const pts=[];for(const sd of ['Right','Left']){const a=P.bones[sd+'Arm'].getWorldPosition(new T.Vector3()),b=P.bones[sd+'ForeArm'].getWorldPosition(new T.Vector3()),c=P.bones[sd+'Hand'].getWorldPosition(new T.Vector3());pts.push(b,a.clone().lerp(b,.5),b.clone().lerp(c,.5));}
        for(const pp of pts){e.copy(pp);const q0=e.clone();if(g.collide(q0,.035,true,0)){bad++;dep=Math.max(dep,q0.distanceTo(e));}n++;}}
      g.input.lmb=false;res[(pw?'pw_':'old_')+wid+'_'+where]=(100*bad/n).toFixed(1)+'% max '+(dep*100).toFixed(0)+'cm';}}}
  return res;});
console.log(JSON.stringify(out,null,1));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
