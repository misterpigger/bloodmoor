import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud&cdepth=2'});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;for(let k=0;k<120;k++)g.logic(1/60);
  const C=g.CRYPT,P=g.player,F=g.fighters;out.push('lamps '+g.LAMPS.map(l=>l.kind+(l.f?'h':'')).join(','));
  // candle then lantern
  const st=g.LAMPS.find(l=>!l.f);if(st){P.pos.set(st.g.position.x+.5,0,st.g.position.z);P.yaw=-Math.PI/2;g.logic(1/60);out.push('prompt '+g.cryptUse(P,true));g.cryptUse(P);out.push('have '+(P.lamp&&P.lamp.kind));}
  // zombie rises again
  const z=F.find(f=>f!==P&&f.alive&&f.undead==='zombie');if(z){z.again=1;if(z.ai.mind)z.ai.mind.dormant=0;P.pos.set(z.pos.x+30,0,z.pos.z+30);for(let k=0;k<200&&z.ragdoll;k++)g.logic(1/60);z.damage(400,P,'slain');out.push('z after kill alive '+z.alive+' hp '+z.hp+' again '+z.again+' rag '+!!z.ragdoll);let up=-1;for(let t=0;t<14*60;t++){P.hp=100;g.logic(1/60);if(up<0&&!z.ragdoll&&z.alive)up=t/60;}out.push('z up at '+up+' alive '+z.alive);z._hk=1e9;z.damage(400,P,'slain');out.push('z 2nd kill alive '+z.alive);}else out.push('no zombie');
  // talk
  const m=F.find(f=>f!==P&&f.alive&&!f.undead&&f.ai.mind&&!f.ai.mind.keyman&&!f.ai.mind.dark&&f.ai.mind.mood!=='cult');if(m){m.ai.mind.mood='peace';m.ai.mind.dormant=0;for(const o of F)if(o!==P&&o!==m)o.pos.set(o.pos.x+200,0,o.pos.z);P.pos.set(m.pos.x-1.2,0,m.pos.z);P.yaw=Math.PI/2;g.logic(1/60);P.pos.set(m.pos.x-1.2,0,m.pos.z);P.yaw=Math.PI/2;out.push('talk prompt '+g.cryptUse(P,true));for(let i=0;i<4;i++){g.cryptUse(P);out.push(' > '+document.getElementById('bark').textContent);}}else out.push('no man');
  let nan=0;for(const f of F)if(!isFinite(f.pos.x+f.pos.y+f.pos.z))nan++;out.push('nan '+nan);return out.join('\n');});
console.log(r);console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
