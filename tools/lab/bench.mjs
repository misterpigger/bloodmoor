import {boot} from './harness.mjs';
const {browser,page,logs,tick,start,fr}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await start(process.env.MODE||'team','tavern');if(process.env.EARLY){await fr(2,1/30);await tick(60,1/60);}await new Promise(r=>setTimeout(r,4000));
const snap=()=>page.evaluate(()=>{const g=window.__game,o=[];for(const d of g.DYN){if(!d.obj||d.gone)continue;const up=new g.THREE.Vector3(0,1,0).applyQuaternion(d.obj.quaternion);if(d.m===16||d.m===34)o.push([d.m,+d.obj.position.x.toFixed(2),+d.obj.position.y.toFixed(2),+d.obj.position.z.toFixed(2),+up.y.toFixed(2)]);}return {n:o.length,o,fs:g.fighters.map(f=>[+f.pos.x.toFixed(1),+f.pos.z.toFixed(1)])};});
console.log(JSON.stringify(await snap()));
for(let i=0;i<4;i++){await tick(60,1/60);const s=await snap();console.log(i,s.o.filter(x=>x[4]<.9).length,'tipped of',s.n,JSON.stringify(s.o.filter(x=>x[4]<.9)));}
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
