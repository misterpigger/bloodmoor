import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start}=await boot({W:640,HH:360,query:'?nohud'});
const meas=()=>page.evaluate(()=>{const g=window.__game;g.renderer.info.autoReset=false;g.renderer.info.reset();window.__now=(window.__now||performance.now())+16;window.__inManual=1;const t=performance.now();window.__frameFn(window.__now);const ms=performance.now()-t;window.__inManual=0;const i=g.renderer.info.render;g.renderer.info.autoReset=true;return [i.triangles,i.calls,Math.round(ms)];});
await start('career','x');await fr(2,1/30);await tick(200,1/60);await new Promise(r=>setTimeout(r,3500));await tick(10,1/60);
console.log('crypt, no lantern',JSON.stringify(await meas()));
await page.evaluate(()=>{const g=window.__game,P=g.player,C=g.CRYPT;P.pos.set(C.lampAt[0]+.7,0,C.lampAt[1]);g.cryptUse(P);});await fr(2,1/30);
console.log('crypt, lantern',JSON.stringify(await meas()),JSON.stringify(await meas()));
await start('duel','tavern');await fr(2,1/30);await tick(60,1/60);await new Promise(r=>setTimeout(r,3000));await tick(10,1/60);console.log('tavern duel',JSON.stringify(await meas()));
console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
