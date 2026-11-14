import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:600,HH:400,query:'?nohud',render:false});
const r=await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<60;k++)g.logic(1/60);
 await new Promise(r=>setTimeout(r,2500));const F=g.fighters,P=g.player;const b=F.find(f=>f!==P&&!f.undead);g.zombieDress(b);for(let k=0;k<60;k++)g.logic(1/60);
 const out=[];b.model.traverse(o=>{if(o.isMesh)out.push([o.name,o.isSkinnedMesh,!!(o.material.userData&&o.material.userData.U),!!(o.material.userData&&o.material.userData.HU),o.material.userData&&o.material.userData.HU&&o.material.userData.HU.uRot&&o.material.userData.HU.uRot.value,!!o.material._zt,o.material.type]);});return out;});
console.log(JSON.stringify(r,null,0));await browser.close();process.exit(0);
