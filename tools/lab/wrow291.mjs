// weapons stood in a row in the yard's daylight, straight from their makers (no fighter): the whole row, then closer views of each (IDS, OUT, NAME)
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'wrow';fs.mkdirSync(OUT,{recursive:true});const IDS=(process.env.IDS||'cudgel,pitchfork,billhook,rustsword,knightsword,giltmace').split(','),NAME=process.env.NAME||'w';
const {browser,page,logs,fr,tick,start,shot}=await boot({W:1280,HH:720,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await fr(2,1/30);await tick(60,1/60);await new Promise(r=>setTimeout(r,3000));
const info=await page.evaluate((IDS)=>{const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#yard,.banner,#banner,#toast{display:none!important}';document.head.appendChild(st);
  const g=window.__game,P=g.player,T=g.THREE;window.__pause=true;for(const f of g.fighters){f.pos.x+=60;}for(let k=0;k<5;k++)g.logic(1/60);
  const O=new T.Vector3(0,0,-0.4),out=[];let x=-(IDS.length-1)*.5*.6;
  for(const id of IDS){const d=g.WEAPONS[id];if(!d){out.push([id,'none']);continue;}const m=d.make(d.st||0),lo=d.kind==='spear'?-(d.grip2||.4)-.1:-.3;m.position.set(O.x+x,1.0-(d.kind==='spear'?.55:0),O.z);m.rotation.y=.32;m.traverse(o=>{if(o.isMesh){o.castShadow=true;}});out.push([id,m.position.x,m.position.y,d.len]);x+=.6;}
  window.__O=O;return out;},IDS);
const cam=(p,t,fov=30)=>page.evaluate(([p,t,fov])=>{const g=window.__game,T=g.THREE;window.__dbgCam={p:new T.Vector3(...p),t:new T.Vector3(...t)};g.camera.fov=fov;g.camera.updateProjectionMatrix();},[p,t,fov]);
await cam([0.15,1.5,2.3],[0,1.3,-0.4],58);await fr(3,1/60);await shot(`${OUT}/${NAME}_row.jpg`,92);
for(const [id,x,y,len] of info){if(x==='none')continue;await cam([x+.1,y+len*.8,-0.4+.8],[x,y+len*.8,-0.4],26);await fr(2,1/60);await shot(`${OUT}/${NAME}_${id}_head.jpg`,92);await cam([x+.1,y+.02,-0.4+.7],[x,y,-0.4],26);await fr(2,1/60);await shot(`${OUT}/${NAME}_${id}_hilt.jpg`,92);}
console.log(JSON.stringify(info));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
