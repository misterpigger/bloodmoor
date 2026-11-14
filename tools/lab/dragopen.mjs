// a blade dragged slowly along stone: how jerky is it? (tip and hand jumps per frame, frames stuck while the aim moves)
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
const out=await page.evaluate(async()=>{const g=window.__game,res={};const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);
  for(const f of g.fighters.slice())if(f!==g.player){f.dispose();g.fighters.splice(g.fighters.indexOf(f),1);}
  const C=g.CRYPT,P=g.player,T=g.THREE;const k=C.cors.slice().sort((a,b)=>b.L-a.L)[0];
  for(const wid of ['arming','longsword','poleaxe','poker']){g.spawnWeaponLoot(g.WEAPONS[wid],P.pos.x+.4,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);
    let wd=0;for(let d=0;d<2;d+=.05){const q=k.ax?new T.Vector3((k.x0+k.x1)/2,1,k.m+d):new T.Vector3(k.m-d,1,(k.z0+k.z1)/2);const q0=q.clone();g.collide(q,.05,true,0);if(q.distanceTo(q0)>1e-4){wd=d;break;}}
    for(const off of [wd-.5,wd-.75]){P.pos.set(C.start.x,0,C.start.z);P.yaw=k.ax?0:-Math.PI/2;
      P.vel.set(0,0,0);for(let i=0;i<30;i++)g.logic(1/60);g.input.locked=false;let tj=0,hj=0,stuck=0,n=0,hits=0;var n2=0;const pt=new T.Vector3(),ph=new T.Vector3(),pv=new T.Vector3(),pvh=new T.Vector3();let first=true;
      for(let q=0;q<600;q++){const ph0=q/60*Math.PI*.35;g.input.locked=true;g.aimMove(Math.cos(ph0)*7,Math.cos(ph0*1.7)*5);P.yaw=k.ax?0:-Math.PI/2;g.input.lmb=false;P.stamina=100;P.hp=100;
        g.logic(1/60);const s=P.sword;if(!s)break;
        if(!first){const dt=s.T.distanceTo(pt),dh=s.H.distanceTo(ph);const dv=new T.Vector3().subVectors(s.T,pt).sub(pv),dvh=new T.Vector3().subVectors(s.H,ph).sub(pvh);if(dv.length()>.04)tj++;if(dvh.length()>.02)hj++;pv.subVectors(s.T,pt);pvh.subVectors(s.H,ph);const pen=(()=>{const q=s.T.clone(),q0=q.clone();g.collide(q,.02,true,0);return q.distanceTo(q0);})();if(pen>.03)n2=(n2||0)+1;if(s._wcAt!==undefined&&s._wcAt!==window.__lw){window.__lw=s._wcAt;hits++;if(dt<.002)stuck++;}n++;}first=false;pt.copy(s.T);ph.copy(s.H);}
      res[wid+'@'+off.toFixed(2)+'/'+wd.toFixed(2)]=`touch ${(100*hits/n).toFixed(0)}% tipJerks ${tj} handJerks ${hj} stuckWhileTouching ${hits?(100*stuck/hits).toFixed(0):0}% tipInWall ${n2} yaw ${P.yaw.toFixed(2)}`;}}
  return res;});
console.log(JSON.stringify(out,null,1));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
