// the player's own body from the side while doing something scripted: SCRIPT is JS run before each rendered frame with (g,P,i,input)
import {boot} from './harness.mjs';import fs from 'fs';import {execSync} from 'child_process';
const OUT=process.env.OUT||'pose';fs.mkdirSync(OUT,{recursive:true});
const NF=+(process.env.NF||16),STEP=+(process.env.STEP||4),SCRIPT=process.env.SCRIPT||'',WEP=process.env.WEP||'',ANG=+(process.env.ANG||90),D=+(process.env.D||3.4);
const {browser,page,logs,fr,start,shot}=await boot({W:+(process.env.W||560),HH:+(process.env.H||420),query:'?nohud'+(process.env.Q||'')});
await start(process.env.MODE||'yard',process.env.MAP||'arena');await fr(2,1/30);
await page.evaluate(([w])=>{const g=window.__game;const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip{display:none!important}';document.head.appendChild(st);const f=g.player;if(w&&(!f.sword||f.sword.def.id!==w)){g.spawnWeaponLoot(g.WEAPONS[w],f.pos.x,f.pos.z);g.pickUp(f,g.loot[g.loot.length-1]);}},[WEP]);
await page.evaluate(()=>{const g=window.__game;for(let k=0;k<240;k++)g.logic(1/60);});await fr(3,1/60);
for(let i=0;i<NF;i++){
  for(let k=0;k<STEP;k++){await page.evaluate(([s,i,k,STEP])=>{const g=window.__game,P=g.player,input=g.input;const t=(i*STEP+k)/60;if(s)eval(s);if(k<STEP-1)g.logic(1/60);},[SCRIPT,i,k,STEP]);}
  await page.evaluate(([ANG,D])=>{const g=window.__game,P=g.player;const a=P.yaw+ANG*Math.PI/180;const T=g.THREE;window.__dbgCam={p:new T.Vector3(P.pos.x+Math.sin(a)*D,P.pos.y+1.3,P.pos.z+Math.cos(a)*D),t:new T.Vector3(P.pos.x,P.pos.y+1.0,P.pos.z)};},[ANG,D]);
  await fr(1,1/60);await shot(`${OUT}/f${String(i).padStart(3,'0')}.jpg`,82);}
console.log(logs.slice(0,10).join('\n')||'no errors');await browser.close();
const cols=+(process.env.COLS||4);
execSync(`python3 - <<'PY'
from PIL import Image,ImageDraw
import glob
fs=sorted(glob.glob('${OUT}/f*.jpg'));cols=${cols}
ims=[Image.open(f) for f in fs];w,h=ims[0].size;rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(cols*w,rows*h))
for i,im in enumerate(ims):
    sh.paste(im,((i%cols)*w,(i//cols)*h));ImageDraw.Draw(sh).text(((i%cols)*w+4,(i//cols)*h+4),str(i),fill=(255,255,0))
sh.save('${OUT}/sheet.jpg',quality=86)
PY`);process.exit(0);
