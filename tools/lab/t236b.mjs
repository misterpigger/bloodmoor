import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<100;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2000));
const out=await page.evaluate(async()=>{const g=window.__game,P=g.player,C=g.CRYPT,res={};const step=async n=>{for(let i=0;i<n;i++){g.scene.updateMatrixWorld(true);g.logic(1/60);if(i%40==0)await 0;}};const bad=()=>{let n=0;for(const k in P.bones){const b=P.bones[k];if(b&&b.matrixWorld&&!Number.isFinite(b.matrixWorld.elements[12]))n++;}return n;};
  res.look0={o:P.look.o,bl:P.look.bl};const take=async kind=>{const q=C.finds.find(q=>q.kind===kind&&!q.gone);if(!q)return 'none';P.pos.set(q.x+.3,0,q.z);P.vel.set(0,0,0);await step(3);P.yaw=Math.atan2(q.x-P.pos.x,q.z-P.pos.z);const pr=g.cryptUse(P,true);g.cryptUse(P);await step(60);return pr;};
  res.shirt=await take('shirt');res.look1=P.look.o;res.bad1=bad();
  g.testLoot&&0;P.equip(g.ARMOR?g.ARMOR.kettle:null);
  return res;}).catch(e=>({err:String(e)}));
console.log(JSON.stringify(out));
const out2=await page.evaluate(async()=>{const g=window.__game,P=g.player,C=g.CRYPT,res={};const step=async n=>{for(let i=0;i<n;i++){g.scene.updateMatrixWorld(true);g.logic(1/60);if(i%40==0)await 0;}};
  res.dorm=g.fighters.filter(f=>f.ai&&f.ai.mind&&f.ai.mind.dormant).length;await step(60);const z=g.fighters.find(f=>f.ai&&f.ai.mind&&f.ai.mind.dormant===2);
  if(z){res.zrag=!!z.ragdoll;const hp=z.ragdoll.P.Hips;await step(240);res.zstill=!!z.ragdoll&&z.ai.mind.dormant===2;P.pos.set(hp.x+1.2,0,hp.z);await step(300);res.zup=!z.ragdoll;res.zd=z.ai.mind.dormant;}
  P.hp=100;P.damage(999,null,'x');await step(240);res.over=!!g.RUN.over;res.after=typeof g.RUN.after;res.next=g.RUN.next!=null;return res;}).catch(e=>({err:String(e)}));
console.log(JSON.stringify(out2));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
