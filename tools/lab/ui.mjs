// the screens between the fighting: end screen, pause box, wound view, fighter card
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'ui';fs.mkdirSync(OUT,{recursive:true});
const [W,H,touch]=JSON.parse(process.env.SIZE||'[1366,768]');
const {browser,page,fr,tick,start,shot,logs}=await boot({W,HH:H,query:process.env.Q||'',touch:!!touch,ua:touch?'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1':null});
const tag=`${W}x${H}`;
await fr(3,1/30);
await start('duel','colosseum');await fr(2,1/30);await tick(240,1/60);
// wound view (Tab) after a couple of wounds
await page.evaluate(()=>{const g=window.__game,P=g.player;P.hp=55;if(P.injureLimb){P.injureLimb('armL',30);P.injureLimb('legR',45);}if(P.addBleed)P.addBleed(.8,20);window.dispatchEvent(new KeyboardEvent('keydown',{code:'Tab',key:'Tab'}));});
await fr(3,1/30);await shot(`${OUT}/wounds_${tag}.jpg`,88);
await page.evaluate(()=>{window.dispatchEvent(new KeyboardEvent('keyup',{code:'Tab',key:'Tab'}));window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));});
await fr(3,1/30);await shot(`${OUT}/pause_${tag}.jpg`,88);
await page.evaluate(()=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));const g=window.__game,P=g.player;P.hp=0;P.die(null,'test',null);});
for(let i=0;i<12;i++){await tick(60,1/60);}
await fr(3,1/30);await shot(`${OUT}/end_${tag}.jpg`,88);
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
