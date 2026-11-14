import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud&ckinds=plain,plain,plain,plain,plain,plain'+(process.env.Q||'')});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;
  for(let k=0;k<50;k++){await new Promise(r=>setTimeout(r,100));g.logic(1/60);if(g.DYN.some(d=>d.isTable&&d.body))break;}
  for(let k=0;k<120;k++)g.logic(1/60);
  const P=g.player,F=g.fighters;for(const f of F)if(f!==P)f.pos.set(900,0,900);
  const T=g.DYN.filter(d=>d.isTable&&!d.gone);out.push('tables '+T.length+' dyn '+g.DYN.length);
  for(const d of T.slice(0,5)){const o=d.obj,x0=o.position.x,z0=o.position.z;const near=g.DYN.filter(e=>e!==d&&!e.gone&&(e.obj.position.x-x0)**2+(e.obj.position.z-z0)**2<1.4&&e.obj.position.y>.5).length;
    const fn=g.CRYPT.finds.filter(q=>(q.x-x0)**2+(q.z-z0)**2<1.4).length;
    let best=0;for(const a of [T.indexOf(d)%2?0:1.57]){const e=new g.THREE.Euler().setFromQuaternion(o.quaternion,'YXZ');const ang=e.y+a,dx=Math.sin(ang),dz=Math.cos(ang);P.hp=100;P.stamina=100;if(P.ragdoll){P.ragdoll=null;P.knocked=0;}P.pos.set(o.position.x-dx*2.2,0,o.position.z-dz*2.2);P.vel.set(0,0,0);P.yaw=Math.atan2(dx,dz);const sx=o.position.x,sz=o.position.z;
      g.input.keys.KeyW=true;g.input.keys.ShiftLeft=!!window.__run;for(let k=0;k<150;k++){P.yaw=Math.atan2(dx,dz);g.logic(1/60);}g.input.keys.KeyW=false;g.input.keys.ShiftLeft=false;for(let k=0;k<30;k++)g.logic(1/60);
      const mv=Math.hypot(o.position.x-sx,o.position.z-sz);best=Math.max(best,mv);out.push('  table '+x0.toFixed(1)+','+z0.toFixed(1)+' things on '+near+' finds '+fn+' dir '+a+' moved '+mv.toFixed(2)+' player went '+Math.hypot(P.pos.x-(sx-dx*2.2),P.pos.z-(sz-dz*2.2)).toFixed(2)+' body '+!!d.body+' m '+d.m);}}
  return out.join('\n');});
console.log(r);console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
