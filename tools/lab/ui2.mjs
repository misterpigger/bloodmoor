import {boot} from './harness.mjs';import fs from 'fs';
const OUT='ui';fs.mkdirSync(OUT,{recursive:true});
for(const [W,H,touch] of JSON.parse(process.env.SIZES||'[[1366,768],[844,390,1]]')){
const {browser,page,fr,tick,start,shot,logs}=await boot({W,HH:H,query:process.env.Q||'',touch:!!touch,ua:touch?'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1':null});
const tag=`${W}x${H}`;await fr(2,1/30);
await start('br','village');await fr(2,1/30);await tick(300,1/60);
await page.evaluate(()=>{document.getElementById('pause').classList.remove('hide');});await fr(2,1/30);await shot(`${OUT}/pause_${tag}.jpg`,88);
await page.evaluate(()=>{document.getElementById('pause').classList.add('hide');const g=window.__game,P=g.player;P.hp=0;P.die(g.fighters[1],'cut down',null);});
for(let i=0;i<8;i++)await tick(60,1/60);await fr(3,1/30);await shot(`${OUT}/end_${tag}.jpg`,88);
console.log(tag,logs.slice(0,4).join('\n')||'no errors');await browser.close();}
process.exit(0);
