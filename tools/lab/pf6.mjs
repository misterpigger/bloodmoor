import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud&pf'+(process.env.Q||'')});
const out=await page.evaluate(async([map])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  g.startGame('duel',map);window.__pause=true;for(let i=0;i<200&&!g.RP;i++){await wait(50);}for(let i=0;i<260;i++)g.logic(1/60);
  const P=g.player,K=g.input.keys,D=g.fighters.find(f=>f!==P);if(D)D.damage=()=>{};const L=[];
  const kd0=P.knockdown.bind(P);P.knockdown=function(...a){L.push('KD '+g.simTime?.toFixed?.(2)+' '+new Error().stack.split('\n').slice(2,5).map(s=>s.trim().slice(0,90)).join(' | '));return kd0(...a);};
  let was=false;
  for(let i=0;i<900;i++){P.stamina=100;P.hp=100;if(D)D.pos.set(P.pos.x+30,0,P.pos.z+30);K.KeyW=i%60<35;K.ShiftLeft=K.KeyW;g.logic(1/60);
    const R=P.ragdoll;if(R&&(i%30===0)){const S=P.hs;L.push([i,'kn',(P.knocked||0).toFixed?.(2),'rise',R.rise?R.rise.st||'y':'-','hsfall',S&&S.fall?S.fall.t.toFixed(2):'-','hips',R.P&&R.P.Hips?R.P.Hips.y.toFixed(2):'?'].join(' '));}
    if(!R&&was)L.push(i+' UP');was=!!R;}
  return L;},[process.env.MAP||'colosseum']);
console.log(out.join('\n'));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
