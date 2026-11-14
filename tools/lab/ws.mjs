import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena',{pause:true});
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE,v=new T.Vector3();for(let k=0;k<200;k++)g.logic(1/60);
  g.spawnWeaponLoot(g.WEAPONS.arming,P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);P.pos.set(0,0,-6);P.yaw=0;for(let k=0;k<60;k++)g.logic(1/60);
  const lean=()=>{const e=n=>P.bones[n].matrixWorld.elements,A=e('Hips'),B=e('Neck'),fx=Math.sin(P.yaw),fz=Math.cos(P.yaw),rx=-fz,rz=fx;return [Math.atan2((B[12]-A[12])*fx+(B[14]-A[14])*fz,B[13]-A[13])*57.3,Math.atan2((B[12]-A[12])*rx+(B[14]-A[14])*rz,B[13]-A[13])*57.3];};
  const gap=()=>{P.bones.RightHand.getWorldPosition(v);return v.distanceTo(P.sword.H);};
  const ph=(keys,n)=>{for(const k in g.input.keys)g.input.keys[k]=false;for(const k of keys)g.input.keys[k]=true;const L=[],G=[],S=[];for(let i=0;i<n;i++){P.stamina=100;g.logic(1/60);L.push(lean());G.push(gap());const t=P.handTarget(new T.Vector3());S.push(t.distanceTo(P.sword.H));}
    const fw=L.map(x=>x[0]),sd=L.map(x=>x[1]);return {fwdMin:+Math.min(...fw).toFixed(1),fwdMax:+Math.max(...fw).toFixed(1),sideMin:+Math.min(...sd).toFixed(1),sideMax:+Math.max(...sd).toFixed(1),gripGap:+Math.max(...G).toFixed(3),handErr:+(S.reduce((a,b)=>a+b,0)/S.length).toFixed(3)};};
  const o={};o.start=ph(['KeyW'],40);o.walk=ph(['KeyW'],60);o.run=ph(['KeyW','ShiftLeft'],70);o.stop=ph([],60);o.turnR=(()=>{const a=[];for(let i=0;i<50;i++){g.input.keys.KeyW=true;g.input.keys.ShiftLeft=true;P.yaw-=.035;}return ph(['KeyW','ShiftLeft'],1);})();
  // running curve: turn while running
  for(const k in g.input.keys)g.input.keys[k]=false;g.input.keys.KeyW=true;g.input.keys.ShiftLeft=true;const L=[];for(let i=0;i<90;i++){P.yaw+=.03;P.stamina=100;g.logic(1/60);L.push(lean()[1]);}o.curve=[+Math.min(...L).toFixed(1),+Math.max(...L).toFixed(1)];
  for(const k in g.input.keys)g.input.keys[k]=false;return o;});
console.log(JSON.stringify(r));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
