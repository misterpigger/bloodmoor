import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:400,HH:300,query:'?nohud',render:false});
const r=await page.evaluate(async()=>{const g=window.__game;await new Promise(r=>setTimeout(r,2000));g.startGame();window.__pause=true;for(let k=0;k<5;k++)g.logic(1/60);
 const P=g.player,T=g.THREE;const it=g.testLoot('arming',P.pos.x,P.pos.z);g.pickUp(P,it);for(let k=0;k<5;k++)g.logic(1/60);const S=P.sword;
 const bx=P.pos.x+5,bz=P.pos.z+5;g.addBox(bx,bx+.04,bz-.5,bz+.5,2.2);const out=[];
 for(const jump of [.05,.12,.2,.3]){S.H.set(bx-.6,1,bz);S.Hp.copy(S.H);S.Tp.set(bx-jump/2,1.05,bz);S.T.set(bx+.04+jump/2,1.05,bz);S._wcP=[1,.72,.46].map(t=>S.Hp.clone().lerp(S.Tp,t));S.worldClip(1/240,true);out.push([jump,+S.T.x.toFixed(3)-bx]);}
 return out;});
console.log(JSON.stringify(r));console.log(logs.slice(0,3).join('\n'));await browser.close();process.exit(0);
