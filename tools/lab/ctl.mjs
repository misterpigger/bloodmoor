// controls: rebinding (kick to KeyK, use swapped with kick), Alt thrust, X swap hands, mouse sensitivity
import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:640,HH:360,render:false,query:'?nohud'});
await start('yard','arena',{pause:true});
const kd=async(code,up)=>{await page.keyboard.down(code);if(up)await page.keyboard.up(code);};
const out=await page.evaluate(()=>{const g=window.__game;for(let k=0;k<200;k++)g.logic(1/60);return {wep:g.player.sword&&g.player.sword.def.id,arm:g.player.mainArm};});
console.log(JSON.stringify(out));
// X swaps
await page.keyboard.press('KeyX');let r=await page.evaluate(()=>{const g=window.__game;for(let k=0;k<30;k++)g.logic(1/60);return g.player.mainArm;});console.log('after X',r);
await page.keyboard.press('KeyX');r=await page.evaluate(()=>{const g=window.__game;for(let k=0;k<30;k++)g.logic(1/60);return g.player.mainArm;});console.log('after X again',r);
// Alt thrust
await page.keyboard.down('AltLeft');r=await page.evaluate(()=>{const g=window.__game;for(let k=0;k<20;k++)g.logic(1/60);return [g.player.ctrl.z.toFixed(2),g.player.thrust];});console.log('alt held',r);
await page.keyboard.up('AltLeft');r=await page.evaluate(()=>{const g=window.__game;for(let k=0;k<20;k++)g.logic(1/60);return [g.player.ctrl.z.toFixed(2),g.player.thrust];});console.log('alt up',r);
// rebind kick to K
await page.evaluate(()=>{localStorage.setItem('bloodmoor-keys',JSON.stringify({KeyF:'KeyK'}));});
// can't reload easily; use the UI: open options, click the Kick button, press K
await page.evaluate(()=>{window.__game.player.kickReq=false;});
r=await page.evaluate(()=>{const b=[...document.querySelectorAll('#keyList .kb')].find(d=>d.textContent.startsWith('Kick'));b.querySelector('button').click();return b.textContent;});console.log('waiting',r);
await page.keyboard.press('KeyK');
r=await page.evaluate(()=>[...document.querySelectorAll('#keyList .kb')].map(d=>d.textContent).join(' | '));console.log(r);
let spy=await page.evaluate(()=>{window.__kicks=0;const P=window.__game.player;let v=false;Object.defineProperty(P,'kickReq',{get(){return v;},set(x){if(x)window.__kicks++;v=x;},configurable:true});return 1;});
await page.keyboard.press('KeyK');await page.keyboard.press('KeyF');
r=await page.evaluate(()=>window.__kicks);console.log('kicks after K and F (want 1):',r);
// swap: bind Use to F (kick is K, F free)
r=await page.evaluate(()=>{const b=[...document.querySelectorAll('#keyList .kb')].find(d=>d.textContent.startsWith('Take'));b.querySelector('button').click();return 1;});await page.keyboard.press('KeyK');
r=await page.evaluate(()=>[...document.querySelectorAll('#keyList .kb')].slice(7,9).map(d=>d.textContent).join(' | '));console.log('use<-K swaps:',r);
await page.evaluate(()=>{window.__kicks=0;});await page.keyboard.press('KeyE');await page.keyboard.press('KeyK');r=await page.evaluate(()=>window.__kicks);console.log('kicks after E and K (want 1, E is kick now):',r);
await page.evaluate(()=>document.getElementById('keyReset').click());await page.evaluate(()=>{window.__kicks=0;});await page.keyboard.press('KeyF');r=await page.evaluate(()=>[window.__kicks,localStorage.getItem('bloodmoor-keys')]);console.log('after reset F kicks:',r);
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
