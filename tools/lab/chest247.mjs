import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud&ckinds=coffins,plain,plain,plain'+(process.env.Q||'')});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;
  for(let k=0;k<60;k++){await new Promise(r=>setTimeout(r,100));g.logic(1/60);if(g.DYN.some(d=>d.body))break;}
  for(let k=0;k<120;k++)g.logic(1/60);
  const P=g.player,C=g.CRYPT;for(const f of g.fighters)if(f!==P)f.pos.set(900,0,900);
  out.push('dyn '+g.DYN.length+' with body '+g.DYN.filter(d=>d.body).length+' caskets '+C.caskets.length+' loose '+C.caskets.filter(k=>k.d).length+' coffins '+C.coffins.length);
  const push=(obj,nm)=>{const x0=obj.x,z0=obj.z;let best='';for(const a of [0,Math.PI/2,Math.PI,-Math.PI/2]){const dx=Math.sin(a),dz=Math.cos(a);P.hp=100;P.stamina=100;if(P.ragdoll){P.ragdoll=null;P.knocked=0;}P.pos.set(obj.x-dx*2,0,obj.z-dz*2);P.vel.set(0,0,0);
      const sx=obj.x,sz=obj.z;g.input.keys.KeyW=true;for(let k=0;k<130;k++){P.yaw=a;g.logic(1/60);}g.input.keys.KeyW=false;for(let k=0;k<40;k++)g.logic(1/60);best+=Math.hypot(obj.x-sx,obj.z-sz).toFixed(2)+' ';}
    out.push(nm+' opened '+obj.opened+' moved per push: '+best+'| total '+Math.hypot(obj.x-x0,obj.z-z0).toFixed(2)+(obj.g?' up '+new g.THREE.Vector3(0,1,0).applyQuaternion(obj.g.quaternion).y.toFixed(2):''));};
  if(C.caskets[0])push(C.caskets[0],'chest');if(C.coffins[0])push(C.coffins[0],'coffin');
  // open a moved chest by its lid: E then mouse up
  const k=C.caskets[0];if(k){P.pos.set(k.x+Math.sin(k.ry)*.9,0,k.z+Math.cos(k.ry)*.9);P.yaw=k.ry+Math.PI;for(let i=0;i<20;i++)g.logic(1/60);out.push('use prompt: '+g.cryptUse(P,true));}
  {const k2=C.caskets[1];if(k2&&k2.d.body){k2.d.body.setRotation({x:Math.SQRT1_2,y:0,z:0,w:Math.SQRT1_2},true);k2.d.body.setTranslation({x:k2.x,y:.4,z:k2.z},true);for(let i=0;i<90;i++)g.logic(1/60);out.push('tipped chest opened '+k2.opened+' purses on floor '+C.finds.filter(q=>q.kind==='purse'&&!q.gone).length);}}
  return out.join('\n');});
console.log(r);console.log(logs.filter(l=>!/GPU stall/.test(l)).slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
