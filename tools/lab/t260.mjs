// pick wheel: hold Z opens it, mouse picks, release takes it
import {boot} from './harness.mjs';
const {browser,page,logs,tick,start}=await boot({render:false,query:'?nohud'});
await start('career','crypt');await tick(200,1/60);
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,o={};window.__pause=true;
  g.pickUp(P,g.testLoot('arming',P.pos.x,P.pos.z));P.beltKey();g.pickUp(P,g.testLoot('longsword',P.pos.x,P.pos.z));P.beltKey();g.pickUp(P,g.testLoot('knife',P.pos.x,P.pos.z));
  o.start=[P.sword&&P.sword.def.id,P.belt&&P.belt.def.id,P.back&&P.back.def.id,P.hip2&&P.hip2.def.id];
  g.wheelOpen();o.items=g.WH.items.map(q=>q.k+':'+q.label);o.open=g.WH.open;
  // pick the back (longsword): find its index, push the mouse that way
  const i=g.WH.items.findIndex(q=>q.k==='back'),n=g.WH.items.length,a=i/n*Math.PI*2;g.WH.v.x=Math.sin(a)*80;g.WH.v.y=-Math.cos(a)*80;g.wheelSel();o.sel=g.WH.sel;g.wheelClose(true);
  for(let k=0;k<20;k++)g.logic(1/60);o.after=[P.sword&&P.sword.def.id,P.belt&&P.belt.def.id,P.back&&P.back.def.id,P.hip2&&P.hip2.def.id];
  g.wheelOpen();const j=g.WH.items.findIndex(q=>q.k==='free'),b=j/g.WH.items.length*Math.PI*2;g.WH.v.x=Math.sin(b)*80;g.WH.v.y=-Math.cos(b)*80;g.wheelSel();g.wheelClose(true);
  o.free=[P.sword&&P.sword.def.id,P.belt&&P.belt.def.id,P.back&&P.back.def.id,P.hip2&&P.hip2.def.id];return o;});
console.log(JSON.stringify(r));
// the key itself
await page.evaluate(()=>{window.__pause=false;});await page.keyboard.down('KeyZ');await new Promise(r=>setTimeout(r,400));const op=await page.evaluate(()=>window.__game.WH.open);await page.keyboard.up('KeyZ');const cl=await page.evaluate(()=>window.__game.WH.open);
console.log('held Z opens',op,'release closes',!cl);
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
