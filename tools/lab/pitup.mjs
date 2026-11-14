import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud&cdepth=3&sunk'});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;for(let k=0;k<120;k++)g.logic(1/60);
  const C=g.CRYPT,q=C.sunks[0],P=g.player,F=g.fighters;if(!q)return 'no sunk';for(const f of F)if(f!==P)f.pos.set(900,0,900);
  for(const [lx,lz] of [[1,-1.2],[-2,2],[q.ix-.3,0]]){P.hp=100;P.stamina=100;P.pos.set(q.x+lx,0,q.z+lz);P.vel.set(0,0,0);let kd=0,was=false,tl='';for(let k=0;k<60*14;k++){g.logic(1/60);const r=!!P.ragdoll;if(r&&!was)kd++;was=r;if(k%60===59)tl+=(r?'R':'u')+P.pos.y.toFixed(1)+' ';}
    out.push('fall at '+lx+','+lz+': knockdowns '+kd+' hp '+P.hp.toFixed(0)+' | '+tl);}
  return out.join('\n');});
console.log(r);console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
