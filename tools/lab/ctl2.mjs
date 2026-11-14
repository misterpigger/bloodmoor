import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:640,HH:360,render:false,query:'?nohud'});
await start('yard','arena',{pause:true});
await page.evaluate(()=>{const g=window.__game,P=g.player;for(let k=0;k<200;k++)g.logic(1/60);g.spawnWeaponLoot(g.WEAPONS.arming,P.pos.x+.4,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);for(let k=0;k<30;k++)g.logic(1/60);});
for(let i=0;i<2;i++){await page.keyboard.press('KeyX');const r=await page.evaluate(()=>{const g=window.__game,P=g.player;let gap=0;for(let k=0;k<60;k++){g.logic(1/60);}const hb=P.bones[P.mainArm==='L'?'LeftHand':'RightHand'],v=new g.THREE.Vector3();hb.getWorldPosition(v);return [P.mainArm,P.sword.def.id,+v.distanceTo(P.sword.H).toFixed(3),Number.isFinite(P.sword.T.x)];});console.log('X',r);}
// swing with the left hand: tip speed
const r=await page.evaluate(()=>{const g=window.__game,P=g.player;g.input.locked=false;P.mainArm='L';let vm=0;g.input.lmb=true;for(let q=0;q<90;q++){g.input.mx=innerWidth*(q<30?.9:.1);g.input.my=innerHeight*.4;P.stamina=100;g.logic(1/60);vm=Math.max(vm,P.sword.tipVel.length());}g.input.lmb=false;return vm.toFixed(1);});
console.log('left-hand sweep tip',r);
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
