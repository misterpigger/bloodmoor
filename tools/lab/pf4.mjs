// physical fighter: per 10 frames while running and turning: f.vel, hip speed, sup, lean o, tilt, knock
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud&pf'+(process.env.Q||'')});
const out=await page.evaluate(async([map,turn,n,process_zig,fps])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  g.startGame('duel',map);window.__pause=true;for(let i=0;i<200&&!g.RP;i++){await wait(50);}for(let i=0;i<260;i++)g.logic(1/60);
  const DT=1/(fps||60);const P=g.player,K=g.input.keys,D=g.fighters.find(f=>f!==P);if(D)D.damage=()=>{};const L=[];let pp=P.pos.clone(),acc=0;
  for(let i=0;i<n;i++){P.stamina=100;P.hp=100;K.KeyW=true;K.ShiftLeft=true;if(D)D.pos.set(P.pos.x+30,0,P.pos.z+30);if(process_zig){if(i%40===0)P.yaw+=(i%80?1:-1)*1.2;}else P.yaw+=turn;g.logic(DT);
    acc+=Math.hypot(P.pos.x-pp.x,P.pos.z-pp.z);pp.copy(P.pos);
    if(i%(process_zig?5:10)===(process_zig?4:9)){const S=P.hs;let hv=0;if(S&&S.seg&&S.seg.pel){const v=S.seg.pel.b.linvel();hv=Math.hypot(v.x,v.z);}
      let ct='';if(S&&S.seg&&hv<1.2&&Math.hypot(P.vel.x,P.vel.z)>3){const W=g.HSW;const set=new Set();for(const sg of S.list){const n=sg.b.numColliders();for(let c=0;c<n;c++){const col=sg.b.collider(c);W.contactPairsWith(col,o=>{let hit=false;W.contactPair(col,o,(m)=>{if(m.numContacts()>0)hit=true;});if(!hit)return;const ob=o.parent();const t=o.translation(),hs=o.shape&&o.shape.halfExtents;set.add(sg.id+'>'+(ob&&ob.isFixed()?'fix':'dyn')+'@'+t.x.toFixed(1)+','+t.y.toFixed(1)+','+t.z.toFixed(1)+(hs?' he '+hs.x.toFixed(2)+','+hs.y.toFixed(2)+','+hs.z.toFixed(2):' r'+(o.shape&&o.shape.radius||'')));});}}ct=[...set].slice(0,6).join(' ');}
      L.push([i,+(acc/(DT*(process_zig?5:10))).toFixed(2),+Math.hypot(P.vel.x,P.vel.z).toFixed(2),+hv.toFixed(2),S&&S.sup!=null?+S.sup.toFixed(2):'-',S&&S.pfo!=null?+S.pfo.toFixed(2):'-',S&&S.pft!=null?+S.pft.toFixed(2):'-',P.pos.x.toFixed(1)+','+P.pos.z.toFixed(1),P.ragdoll?'DOWN':'',S&&S.lost?'lost':'',ct].join(' '));acc=0;}}
  return L;},[process.env.MAP||'colosseum',+(process.env.TURN||.012),+(process.env.N||360),!!process.env.ZIG,+(process.env.FPS||60)]);
console.log('i  speed fvel hipv sup o tilt');console.log(out.join('\n'));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
