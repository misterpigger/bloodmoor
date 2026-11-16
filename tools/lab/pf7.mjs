// physical fighter: run straight then stop (or reverse); per 3 frames: fvel, hip v, lean o (signed along travel), feet physical vs animated gap, sup, tilt
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud&pf'+(process.env.Q||'')});
const out=await page.evaluate(async([map,mode])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));window.__pfwhy=[];
  g.startGame('duel',map);window.__pause=true;for(let i=0;i<200&&!g.RP;i++){await wait(50);}for(let i=0;i<260;i++)g.logic(1/60);
  const P=g.player,K=g.input.keys,D=g.fighters.find(f=>f!==P);if(D){D.damage=()=>{};D.pos.set(30,0,30);D.dummy=true;}
  P.yaw=Math.atan2(-P.pos.x,-P.pos.z);for(let i=0;i<30;i++)g.logic(1/60);const L=[];
  for(let i=0;i<170;i++){P.stamina=100;P.hp=100;const go=i<80;K.KeyW=go||mode==='rev';K.ShiftLeft=K.KeyW;if(mode==='rev'&&i===80)P.yaw+=Math.PI;g.logic(1/60);
    if(i>=60&&i%3===0){const S=P.hs;if(!S||!S.seg||!S.seg.pel){L.push(i+' nohs '+(P.ragdoll?'DOWN':''));continue;}const p=S.seg.pel.b.translation(),v=S.seg.pel.b.linvel(),a=S.seg.ftL.b.translation(),c=S.seg.ftR.b.translation(),T=S.T;
      const gap=T&&T.LeftFoot?Math.hypot(a.x-T.LeftFoot.x,a.z-T.LeftFoot.z)+Math.hypot(c.x-T.RightFoot.x,c.z-T.RightFoot.z):-1;
      L.push([i,+Math.hypot(P.vel.x,P.vel.z).toFixed(2),+v.z.toFixed(2),'o',+(S.pfo||0).toFixed(2),'gap',+(gap/2).toFixed(2),'sup',+(S.sup||0).toFixed(2),'tilt',+(S.pft||0).toFixed(2),'ft',+a.y.toFixed(2),+c.y.toFixed(2),S.lost?'LOST':'',P.ragdoll?'DOWN':''].join(' '));}}
  return L.concat(JSON.stringify(window.__pfwhy));},[process.env.MAP||'colosseum',process.env.MODE||'stop']);
console.log(out.join('\n'));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
