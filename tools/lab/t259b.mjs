// pinning 2: stabbing from astride, and a bot getting on a downed player
import {boot} from './harness.mjs';
const {browser,page,logs,tick,start}=await boot({render:false,query:'?nohud'});
await start('duel','colosseum');await tick(200,1/60);
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,F=g.fighters,input=g.input;window.__pause=true;for(let i=0;i<240;i++)g.logic(1/60);const B=F.find(f=>f!==P);const o={};
  g.pickUp(P,g.testLoot('rondel',P.pos.x,P.pos.z));B.hp=100;B.knockdown(3,new g.THREE.Vector3(0,0,0),B.chest);for(let i=0;i<90;i++)g.logic(1/60);
  const R=B.ragdoll;P.pos.x=(R.P.Spine1.x+R.P.Hips.x)/2+.25;P.pos.z=(R.P.Spine1.z+R.P.Hips.z)/2;P.crouch=true;P.rev=true;for(let i=0;i<40;i++){if(!P.pin){const R2=B.ragdoll;P.pos.x=(R2.P.Spine1.x+R2.P.Hips.x)/2+.2;P.pos.z=(R2.P.Spine1.z+R2.P.Hips.z)/2;}g.logic(1/60);}o.pin=!!P.pin;{const R2=B.ragdoll;o.by=+((R2.P.Spine1.y+R2.P.Hips.y)/2-P.pos.y).toFixed(2);o.pcd=P._pinCd;o.cr=P.crouch;o.st=P.stoop;}
  const h0=B.hp;for(let k=0;k<4;k++){input.lmb=true;for(let i=0;i<30;i++){g.logic(1/60);B.stamina=0;}input.lmb=false;for(let i=0;i<30;i++){g.logic(1/60);B.stamina=0;}}o.dmg=Math.round(h0-B.hp);o.alive=B.alive;o.stillPin=!!P.pin;
  // bot on a downed player
  P.pin=null;P.crouch=false;P.rev=false;for(let i=0;i<60;i++)g.logic(1/60);
  const B2=B.alive?B:null;if(!B2)return o;B2.ragdoll&&(B2.knocked=0.01);for(let i=0;i<300;i++)g.logic(1/60);
  if(B2.sword)g.dropSword&&0;g.pickUp(B2,g.testLoot('rondel',B2.pos.x,B2.pos.z));B2.ai.aggr=1.4;
  let pins=0,frames=0;for(let rep=0;rep<4;rep++){P.hp=100;P.knockdown(4,new g.THREE.Vector3(0,0,0),P.chest);B2.ai._pinFor=null;for(let i=0;i<60*4;i++){g.logic(1/60);P.stamina=0;if(B2.pin)frames++;}if(frames)pins++;P.hp=100;}
  o.botPinFrames=frames;o.php=Math.round(P.hp);return o;});
console.log(JSON.stringify(r));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
