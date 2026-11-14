// pinning: knock a bot down, crouch over his belly -> astride him; he stays down; his writhing throws you off; bots pin too
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({render:false,query:'?nohud'});
const r=await page.evaluate(()=>{const g=window.__game;window.__pause=true;g.startGame('duel','colosseum');for(let i=0;i<240;i++)g.logic(1/60);
  const P=g.player,B=g.fighters.find(f=>f!==P);const out={};
  B.ai.skill=0;B.knockdown(3,new g.THREE.Vector3(0,0,0),B.chest);for(let i=0;i<60;i++)g.logic(1/60);
  const R=B.ragdoll,bx=(R.P.Spine1.x+R.P.Hips.x)/2,bz=(R.P.Spine1.z+R.P.Hips.z)/2;P.pos.x=bx+.3;P.pos.z=bz;P.vel.set(0,0,0);P.crouch=true;
  for(let i=0;i<30;i++)g.logic(1/60);out.pinned=!!P.pin;out.dxz=+Math.hypot(P.pos.x-bx,P.pos.z-bz).toFixed(2);
  B.ai.skill=.0;let rose=false;const isP=B.isPlayer;for(let i=0;i<60*6;i++){g.logic(1/60);B.stamina=0;if(!B.ragdoll)rose=true;}out.stayedDown=!rose;out.stillPinned=!!P.pin;
  // hips height
  P.bones.Hips.getWorldPosition(window.__v=new g.THREE.Vector3());out.hipY=+window.__v.y.toFixed(2);
  // writhing
  let t=0;B.stamina=100;while(P.pin&&t<12){B.struggle();for(let i=0;i<9;i++)g.logic(1/60);B.stamina=100;t+=.15;}out.thrownAfter=+t.toFixed(2);out.thrown=!P.pin;
  // stand up gets off
  return out;});
console.log(JSON.stringify(r));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
