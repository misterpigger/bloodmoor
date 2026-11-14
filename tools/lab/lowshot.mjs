import {boot} from './harness.mjs';
const OUT='../out/q218';
const {browser,page,logs,fr,tick,shot}=await boot({W:1100,HH:620,query:'?nohud'});
const ok=await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));
 g.startGame();window.__pause=true;for(let k=0;k<30;k++)g.logic(1/60);for(let t=0;t<20&&!g.CRYPT.lows.length;t++){g.startGame();for(let k=0;k<30;k++)g.logic(1/60);}return !!g.CRYPT.lows.length;});
if(!ok){console.log('none');process.exit(0);}
await new Promise(r=>setTimeout(r,3000));
await page.evaluate(()=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player,F=g.fighters,q=C.lows[0];for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
 const u=(q.a0+q.a1)/2+.3;P.pos.set(q.ax?u:q.m+.25,0,q.ax?q.m+.25:u);P.vel.set(0,0,0);P.yaw=Math.atan2(q.ax?1:0,q.ax?0:1);
 const lt=new T.PointLight(0xffc890,3,8,1.2);lt.position.set(q.ax?q.a0-.6:q.m,1.0,q.ax?q.m:q.a0-.6);g.scene.add(lt);
 for(let k=0;k<90;k++)g.logic(1/60);
 const s=Math.sin(P.yaw),c=Math.cos(P.yaw),W=(x,y,z)=>new T.Vector3(P.pos.x+c*x+s*z,y,P.pos.z-s*x+c*z);window.__dbgCam={p:W(-.95,.85,.15),t:W(0,.95,.35)};});
await tick(5);await fr(3);await shot(`${OUT}/low_side.jpg`,88);
await page.evaluate(()=>{window.__dbgCam=null;});await tick(5);await fr(3);await shot(`${OUT}/low_game.jpg`,88);console.log(await page.evaluate(()=>{const g=window.__game,P=g.player,c=g.camera;return JSON.stringify({fp:P.model.userData._fpOn,d:+c.position.distanceTo(P.headPos).toFixed(2),cy:+c.position.y.toFixed(2),hy:+P.headPos.y.toFixed(2),duck:+(P.duck||0).toFixed(2),htop:+(P._htop||0).toFixed(2)});}));
console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
