// frame cost per graphics level: a team battle in the Arena, 6 rendered frames each, time of __frameFn
import {boot} from './harness.mjs';
const LV=process.env.LV||'high';
process.env.GFX=LV;const {browser,page,logs,fr,tick,start}=await boot({W:1280,HH:720,query:'?nohud'});
await start(process.env.MODE||'team',process.env.MAP||'village');await fr(2,1/30);await tick(200,1/60);await new Promise(r=>setTimeout(r,3500));await tick(10,1/60);
const r=await page.evaluate(()=>{const g=window.__game;const ms=[];for(let i=0;i<24;i++){window.__now=(window.__now||performance.now())+16;window.__inManual=1;const t=performance.now();window.__frameFn(window.__now);ms.push(performance.now()-t);window.__inManual=0;}const i=g.renderer.info.render;return {ms:(()=>{const a=ms.slice(4).sort((x,y)=>x-y);return [Math.round(a[a.length>>1]),Math.round(a[Math.floor(a.length*.9)])];})(),pr:g.renderer.getPixelRatio(),tri:i.triangles,gfx:localStorage.getItem('bloodmoor-gfx')};});
console.log(LV,JSON.stringify(r));console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
