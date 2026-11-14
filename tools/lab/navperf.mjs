import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
for(const [mode,map] of [['raid','arena'],['br','village'],['team','tavern']]){
  await start(mode,map,{pause:true});
  const r=await page.evaluate(async()=>{const g=window.__game;for(let i=0;i<200&&!g.PRW;i++){await new Promise(r=>setTimeout(r,30));g.logic(1/60);}
    const nb=g.navBuild;let builds=0,ms=0,mx=0;const N=g.NAV;const t00=performance.now();
    // count rebuilds by watching NAV.at
    let last=N.at,nreb=0;const t0=N.ms,p0=N.plans;let lt=0;
    for(let k=0;k<60*60;k++){const a=performance.now();g.logic(1/60);const d=performance.now()-a;if(N.at!==last){last=N.at;nreb++;}if(g.player&&g.player.alive)g.player.hp=Math.max(g.player.hp,80);}
    // direct timing of a full and a patch rebuild
    N.key=-1;let a=performance.now();g.navBuild();const full=performance.now()-a;N.dr=[0,3,0,3];N.dirty=true;a=performance.now();g.navBuild();const patch=performance.now()-a;
    return {nreb,plans:N.plans-p0,planMs:+(N.ms-t0).toFixed(1),full:+full.toFixed(2),patch:+patch.toFixed(3),n:N.n};});
  console.log(mode,map,JSON.stringify(r));}
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
