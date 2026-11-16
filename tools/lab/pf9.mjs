// physical fighter: per-frame hand jitter trace in a scripted fight (the drawn right hand vs hips, the grip target, weapon body speed)
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud&pf'+(process.env.Q||'')});
const out=await page.evaluate(async([n])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  g.startGame('duel','colosseum');window.__pause=true;for(let i=0;i<200&&!g.RP;i++){await wait(50);}for(let i=0;i<260;i++)g.logic(1/60);
  const P=g.player,K=g.input.keys;P.damage=()=>{};for(const D of g.fighters)if(D!==P)D.damage=()=>{};
  const W=n=>{const e=P.bones[n].matrixWorld.elements;return [e[12],e[13],e[14]];};const L=[];let prev=null,cnt=0;
  for(let i=0;i<n;i++){P.stamina=100;P.hp=100;K.KeyW=i%120<60;K.ShiftLeft=i%240<60;K.KeyA=i%90<30;if(i%40===0)g.input.lmb=!g.input.lmb;g.logic(1/60);g.scene.updateMatrixWorld(true);
    if(P.ragdoll){prev=null;continue;}const H=W('Hips'),r=W('RightHand');const c=[r[0]-H[0],r[1]-H[1],r[2]-H[2]];
    if(prev){const a=Math.hypot(c[0]-prev[0],c[1]-prev[1],c[2]-prev[2]);if(a>.08){cnt++;const S=P.hs,wb=S&&S.wb;let wv=0,ww=0,gap=0;if(wb&&wb.b){const v=wb.b.linvel(),w=wb.b.angvel();wv=Math.hypot(v.x,v.y,v.z);ww=Math.hypot(w.x,w.y,w.z);}
      const sw=P.sword;if(sw&&sw.H)gap=Math.hypot(sw.H.x-r[0],sw.H.y-r[1],sw.H.z-r[2]);
      let ct='';if(wb&&wb.b){const set=new Set();const n=wb.b.numColliders();for(let c=0;c<n;c++){const col=wb.b.collider(c);g.HSW.contactPairsWith(col,o=>{let hit=false;g.HSW.contactPair(col,o,m=>{if(m.numContacts()>0)hit=true;});if(!hit)return;const ob=o.parent();let who='?';for(const F of g.fighters){if(F.hs)for(const sg of F.hs.list)if(sg.b===ob)who=(F===P?'self:':'foe:')+sg.id;}const t=o.translation();set.add(who+'@'+t.x.toFixed(1)+','+t.y.toFixed(1)+','+t.z.toFixed(1));});}ct=[...set].join(' ');}
      if(L.length<40)L.push([i,a.toFixed(2),'wv',wv.toFixed(1),'ww',ww.toFixed(1),'gap',gap.toFixed(2),'lmb',+g.input.lmb,'cm',+!!P.commit,'stag',+(P.stagger>0),'foe',P._foeD!=null?P._foeD.toFixed(1):'-','wb',!!wb,'att',wb?!!wb.att:'-',ct].join(' '));}}prev=c;}
  return [cnt].concat(L);},[+(process.env.N||900)]);
console.log(out.join('\n'));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
