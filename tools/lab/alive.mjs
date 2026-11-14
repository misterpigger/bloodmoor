// how much a fighting body moves: shoulder line against hip line (yaw), trunk pitch, in guard and in committed swings. Q for flags.
import {boot} from './harness.mjs';
const {browser,page}=await boot({render:false,query:'?nohud'+(process.env.Q||'')});
const out=await page.evaluate(async(wep)=>{const g=window.__game;window.__pause=true;g.startGame('duel','colosseum');for(let i=0;i<200;i++)g.logic(1/60);
 const P=g.player;P.isPlayer=false;for(const f of g.fighters){g.spawnWeaponLoot(g.WEAPONS[wep],f.pos.x,f.pos.z);g.pickUp(f,g.loot[g.loot.length-1]);}
 const T=g.THREE,a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),d=new T.Vector3();const S={g:[],c:[],gp:[],cp:[],gyr:[]};const prev=new Map();
 for(let i=0;i<60*40;i++){g.logic(1/60);for(const f of g.fighters){if(!f.alive||f.ragdoll)continue;const B=f.bones;if(!B.LeftArm)continue;
   B.LeftArm.getWorldPosition(a);B.RightArm.getWorldPosition(b);B.LeftUpLeg.getWorldPosition(c);B.RightUpLeg.getWorldPosition(d);
   const sy=Math.atan2(b.z-a.z,b.x-a.x),hy=Math.atan2(d.z-c.z,d.x-c.x);let dy=sy-hy;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;
   const m=a.clone().add(b).multiplyScalar(.5),h=c.clone().add(d).multiplyScalar(.5);const up=m.clone().sub(h).normalize();const pitch=Math.asin(Math.min(1,Math.hypot(up.x,up.z)));
   const k=f.commit?'c':'g';S[k].push(Math.abs(dy)*57.3);S[k+'p'].push(pitch*57.3);
   if(!f.commit){const p=prev.get(f);if(p!=null){let r=sy-p;while(r>Math.PI)r-=2*Math.PI;while(r<-Math.PI)r+=2*Math.PI;S.gyr.push(Math.abs(r)*60*57.3);}}prev.set(f,sy);}}
 const q=(A,p)=>{A=A.slice().sort((x,y)=>x-y);return A.length?+A[Math.floor(p*(A.length-1))].toFixed(1):null;};
 return {guardTwist:[q(S.g,.5),q(S.g,.9)],commitTwist:[q(S.c,.5),q(S.c,.9)],guardPitch:[q(S.gp,.5),q(S.gp,.9)],commitPitch:[q(S.cp,.5),q(S.cp,.9)],guardYawRate:[q(S.gyr,.5),q(S.gyr,.9)],n:[S.g.length,S.c.length]};},process.env.WEP||'longsword');
console.log(JSON.stringify(out));await browser.close();process.exit(0);
