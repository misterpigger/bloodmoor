import {boot} from './harness.mjs';import fs from 'fs';
const OUT='amb230';fs.mkdirSync(OUT,{recursive:true});
const {browser,page,logs,fr,tick,start,shot}=await boot({W:960,HH:540,query:''});
await start('team','ship');await page.evaluate(()=>{window.__storm=1;});await fr(2,1/30);await tick(120,1/60);await fr(3,1/30);await shot(`${OUT}/ship_storm.jpg`);
await page.evaluate(()=>{const g=window.__game;g.AMBX.flash=1;});await fr(1,1/30);await shot(`${OUT}/ship_flash.jpg`);
console.log(await page.evaluate(()=>{const g=window.__game;return JSON.stringify({rain:g.RAIN&&g.RAIN.visible,k:g.RAIN&&g.RAIN.material.uniforms.uK.value});}));
console.log(logs.slice(0,10).join('\n')||'no errors');await browser.close();process.exit(0);
