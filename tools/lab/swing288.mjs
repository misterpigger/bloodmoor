// the player's own cut by the numbers, in his body's frame: where the hand and the point are (right, up, forward of the chest), shoulder turn, tip speed
import {boot} from './harness.mjs';
const WEP=process.env.WEP||'longsword',MV=(process.env.MV||'.86,.14,.18,.72').split(',').map(Number),DUR=+(process.env.DUR||.2);
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await new Promise(r=>setTimeout(r,2000));
const out=await page.evaluate(([w,MV,DUR])=>{const g=window.__game,T=g.THREE,P=g.player,input=g.input;for(let k=0;k<120;k++)g.logic(1/60);
  if(!P.sword||P.sword.def.id!==w){g.spawnWeaponLoot(g.WEAPONS[w],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
  const far=g.fighters.filter(f=>f!==P);for(const f of far){f.pos.x+=30;}   /* nobody in reach */
  const rows=[];const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),d=new T.Vector3();
  for(let i=0;i<110;i++){const t=i/60,u=Math.min(1,Math.max(0,(t-.6)/DUR));input.locked=false;P.stamina=100;P.ctrl.z=.46;
    if(t<.6){input.mx=MV[0];input.my=MV[1];input.lmb=false;}else if(t<1.25){input.mx=MV[0]+(MV[2]-MV[0])*u;input.my=MV[1]+(MV[3]-MV[1])*u;input.lmb=true;}else{input.mx=.5;input.my=.45;input.lmb=false;}
    g.logic(1/60);const s=P.sword,f=new T.Vector3(Math.sin(P.yaw),0,Math.cos(P.yaw)),r=new T.Vector3(-f.z,0,f.x);   /* right */
    P.bones.Spine2.getWorldPosition(a);const H=s.H.clone().sub(a),Tp=s.T.clone().sub(a);P.bones.RightArm.getWorldPosition(b);P.bones.LeftArm.getWorldPosition(c);d.subVectors(b,c);const sh=Math.atan2(d.dot(f),d.dot(r))*57.3;
    P.bones.RightUpLeg.getWorldPosition(b);P.bones.LeftUpLeg.getWorldPosition(c);d.subVectors(b,c);const hp=Math.atan2(d.dot(f),d.dot(r))*57.3;P.bones.Head.getWorldPosition(b);P.bones.Hips.getWorldPosition(c);b.sub(c);
    if(i>=30&&i%2===0||(i>=36&&i<=52))rows.push([i,+H.dot(r).toFixed(2),+H.y.toFixed(2),+H.dot(f).toFixed(2),+Tp.dot(r).toFixed(2),+Tp.y.toFixed(2),+Tp.dot(f).toFixed(2),+s.tipVel.length().toFixed(1),+sh.toFixed(0),+hp.toFixed(0),+(b.dot(f)*100).toFixed(0),+(b.dot(r)*100).toFixed(0),P.commit?1:0,+P.ctrl.x.toFixed(2),+P.ctrl.y.toFixed(2),P._ft?+P._ft.w.toFixed(2):0]);}
  return rows;},[WEP,MV,DUR]);
console.log('  i  handR handU handF | tipR  tipU  tipF | tipV shTurn hipTurn headFwd headR cm');for(const r of out)if(r[0]<=80)console.log(r.map((x,i)=>String(x).padStart(i?6:3)).join(''));
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
