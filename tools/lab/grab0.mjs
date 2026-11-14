import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:640,HH:360,render:false,query:'?nohud'});
await start('duel','colosseum',{pause:true});
const r=await page.evaluate(()=>{const g=window.__game,P=g.player;for(let k=0;k<260;k++)g.logic(1/60);
  g.spawnWeaponLoot(g.WEAPONS.arming,P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);window.__ogdbg=[];g.input.keys.KeyG=true;g.logic(1/60);console.log(JSON.stringify(window.__ogdbg.slice(0,3)));
  const s=P.sword;return {dbg:window.__ogdbg.slice(0,3),main:P.mainArm,id:s.def.id,two:g.TWO_HANDED&&g.TWO_HANDED[s.def.id],lamp:!!P.lamp,clutch:P.clutchT,throwT:P.throwT,rev:P.revW,catch:P.catchT,stuck:!!s.stuck,kn:P.knocked,og:!!P.offG,touch:g.TOUCH,wheel:!!P.wheelHold,road:!!P.roadHold,th:P.throwHold};});
console.log(JSON.stringify(r));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
