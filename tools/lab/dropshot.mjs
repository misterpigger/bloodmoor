import {boot} from './harness.mjs';import fs from 'fs';import {execSync} from 'child_process';
const OUT=process.env.OUT||'../out/drop';fs.mkdirSync(OUT,{recursive:true});
const {browser,page,logs,fr,tick,shot}=await boot({W:640,HH:360,query:'?nohud'+(process.env.Q||'')});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);
  const P=g.player,C=g.CRYPT,F=g.fighters;for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
  P.pos.set(C.lampAt[0]+.7,0,C.lampAt[1]);g.cryptUse(P);const it=g.loot.find(l=>l.kind==='weapon');if(it)g.pickUp(P,it);
  const h=C.hole;P.pos.set(h.x+2.3,0,h.z+1.0);P.yaw=-Math.PI/2-.5;P.vel.set(0,0,0);if(location.search.includes('fp'))for(let i=0;i<3&&g.camMode!=='fp';i++)window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyV'}));});
await new Promise(r=>setTimeout(r,2500));await fr(6,1/30);await page.evaluate(()=>{window.__pause=false;window.__game.input.keys.KeyW=true;});
const info=[];for(let i=0;i<30;i++){await fr(3,1/36);await new Promise(r=>setTimeout(r,20));info.push(await page.evaluate(()=>{const g=window.__game,P=g.player;return [g.CRYPT.depth,+P.pos.y.toFixed(1),Math.round(P.hp),P.ragdoll?'r':''].join('/');}));await shot(`${OUT}/f${String(i).padStart(2,'0')}.jpg`,80);}
console.log(info.join(' '));console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();
execSync(`python3 -c "
from PIL import Image,ImageDraw
import glob
fs=sorted(glob.glob('${OUT}/f*.jpg'));ims=[Image.open(f) for f in fs];w,h=ims[0].size;cols=6;rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(cols*w//2,rows*h//2))
for i,im in enumerate(ims):
    sh.paste(im.resize((w//2,h//2)),((i%cols)*w//2,(i//cols)*h//2));ImageDraw.Draw(sh).text(((i%cols)*w//2+4,(i//cols)*h//2+4),str(i),fill=(255,255,0))
sh.save('${OUT}/sheet.jpg',quality=88)"`);process.exit(0);
