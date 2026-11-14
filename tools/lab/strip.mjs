// a strip of frames from a fight, from the player's camera (the player is played by the AI), to look at the fighting itself
import {boot} from './harness.mjs';import fs from 'fs';import {execSync} from 'child_process';
const OUT=process.env.OUT||'strip';fs.mkdirSync(OUT,{recursive:true});
const mode=process.env.MODE||'duel',map=process.env.MAP||'colosseum',W=process.env.WEP||'',AR=process.env.AR||'',NF=+(process.env.NF||40),STEP=+(process.env.STEP||6),PRE=process.env.PRE||'';
const {browser,page,logs,fr,tick,start,shot}=await boot({W:+(process.env.W||640),HH:+(process.env.H||360),query:'?nohud'+(process.env.Q||'')});
await start(mode,map);await fr(2,1/30);
await page.evaluate(([w,AR,PRE])=>{const g=window.__game;if(!window.__human)g.player.isPlayer=false;for(const f of g.fighters){if(w&&(!f.sword||f.sword.def.id!==w)){g.spawnWeaponLoot(g.WEAPONS[w],f.pos.x,f.pos.z);g.pickUp(f,g.loot[g.loot.length-1]);}if(AR)for(const a of AR.split('+'))f.equip(g.ARMOR[a]);}if(PRE)eval(PRE);const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip{display:none!important}';document.head.appendChild(st);},[W,AR,PRE]);
// run until they close
for(let i=0;i<40;i++){const d=await page.evaluate(()=>{const g=window.__game;for(let k=0;k<30;k++)g.logic(1/60);const P=g.player;let m=99;for(const f of g.fighters)if(f!==P&&f.alive)m=Math.min(m,Math.hypot(f.pos.x-P.pos.x,f.pos.z-P.pos.z));return m;});if(d<(+(process.env.D||3.2)))break;}
await fr(4,1/60);
for(let i=0;i<NF;i++){await page.evaluate(n=>{const g=window.__game;for(let k=0;k<n;k++)g.logic(1/60);},STEP-1);if(process.env.SIDE)await page.evaluate(sd=>{const g=window.__game,P=g.player;let o=null,m=99;for(const f of g.fighters)if(f!==P&&f.alive){const d=Math.hypot(f.pos.x-P.pos.x,f.pos.z-P.pos.z);if(d<m){m=d;o=f;}}if(!o)return;const cx=(P.pos.x+o.pos.x)/2,cz=(P.pos.z+o.pos.z)/2;let dx=o.pos.x-P.pos.x,dz=o.pos.z-P.pos.z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const C=window.__sc||(window.__sc={x:-dz,z:dx});C.x+=(-dz-C.x)*.15;C.z+=(dx-C.z)*.15;const D=+sd;window.__dbgCam={p:new g.THREE.Vector3(cx+C.x*D,P.pos.y+1.5,cz+C.z*D),t:new g.THREE.Vector3(cx,P.pos.y+1.05,cz)};},process.env.SIDE);await fr(1,1/60);await shot(`${OUT}/f${String(i).padStart(3,'0')}.jpg`,80);}
console.log(logs.slice(0,10).join('\n')||'no errors');await browser.close();
const cols=+(process.env.COLS||5),per=cols*(+(process.env.ROWS||4));
execSync(`python3 - <<'PY'
from PIL import Image,ImageDraw
import glob
fs=sorted(glob.glob('${OUT}/f*.jpg'));per=${per};cols=${cols}
for s in range(0,len(fs),per):
    ims=[Image.open(f) for f in fs[s:s+per]];w,h=ims[0].size;rows=(len(ims)+cols-1)//cols
    sh=Image.new('RGB',(cols*w,rows*h))
    for i,im in enumerate(ims):
        sh.paste(im,((i%cols)*w,(i//cols)*h));ImageDraw.Draw(sh).text(((i%cols)*w+4,(i//cols)*h+4),str(s+i),fill=(255,255,0))
    sh.save('${OUT}/sheet%d.jpg'%(s//per),quality=85)
PY`);process.exit(0);
