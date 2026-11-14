// tour: menu + each mode/map from the player's own camera, at a few moments
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'tour';fs.mkdirSync(OUT,{recursive:true});
const RUNS=JSON.parse(process.env.RUNS||'[["br","village"]]');const T=JSON.parse(process.env.T||'[4,14]');
const {browser,page,logs,fr,tick,start,shot}=await boot({W:+(process.env.W||960),HH:+(process.env.H||540),query:process.env.Q||''});
if(process.env.MENU){await fr(3,1/30);await shot(`${OUT}/menu.jpg`);}
for(const [mode,map] of RUNS){
  await start(mode,map);await fr(2,1/30);let t=0;
  for(const tt of T){const n=Math.round((tt-t)*30);for(let c=0;c<n;c+=30){await tick(Math.min(30,n-c)*2,1/60);}t=tt;
    await page.evaluate(()=>{const g=window.__game;if(g.player&&g.player.alive)g.player.hp=Math.max(g.player.hp,70);});
    await fr(3,1/30);await shot(`${OUT}/${mode}_${map}_${tt}.jpg`);console.log('shot',mode,map,tt);}
  await page.evaluate(()=>{const b=document.getElementById('errbox');if(b&&b.textContent)console.error('ERRBOX '+b.textContent);});
}
console.log(logs.slice(0,10).join('\n')||'no errors');await browser.close();process.exit(0);
