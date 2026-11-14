import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'menu';fs.mkdirSync(OUT,{recursive:true});
const SIZES=JSON.parse(process.env.SIZES||'[[1440,900],[1920,1080],[1366,768]]');
for(const [W,H,touch] of SIZES){const {browser,page,fr,shot}=await boot({W,HH:H,query:process.env.Q||'',touch:!!touch,ua:touch?'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1':null});
  await fr(3,1/30);if(process.env.PRE)await page.evaluate(process.env.PRE);await new Promise(r=>setTimeout(r,400));await fr(1,1/30);
  await shot(`${OUT}/${process.env.NAME||'menu'}_${W}x${H}.jpg`,90);
  const info=await page.evaluate(()=>{const p=document.querySelector('.panel-inner'),b=document.getElementById('startBtn').getBoundingClientRect();return {scrollH:p.scrollHeight,clientH:p.clientHeight,startTop:Math.round(b.top),startBottom:Math.round(b.bottom),vh:innerHeight,mode:document.compatMode};});
  console.log(W,H,JSON.stringify(info));await browser.close();}
process.exit(0);
