import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
const out=await page.evaluate(async()=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));const res={};
  for(const w of ['greatsword','axe','longsword','arming','poleaxe','falchion']){document.querySelector('.mode[data-mode="team"]').click();await wait(100);const mb=document.querySelector('.map[data-map=colosseum]');if(mb)mb.click();await wait(200);g.startGame();window.__pause=true;window.__sevLog=[];window.__bisRes=1e9;
    for(let k=0;k<200;k++)g.logic(1/60);g.player.isPlayer=false;for(const f of g.fighters){g.spawnWeaponLoot(g.WEAPONS[w],f.pos.x,f.pos.z);g.pickUp(f,g.loot[g.loot.length-1]);for(const s of ['head','body','arms','legs'])if(f.armor[s]&&Math.random()<.5)f.unequip&&f.unequip(s);}
    for(let k=0;k<60*45;k++){g.logic(1/60);for(const f of g.fighters)if(f.alive){f.hp=Math.max(f.hp,60);f.stamina=Math.max(f.stamina,50);}}
    const L=window.__sevLog.filter(e=>e[0]==='waist');const r=L.map(e=>e[1]/e[2]*1e9).sort((a,b)=>a-b);const cps=L.map(e=>e[1]).sort((a,b)=>a-b);
    res[w]={n:L.length,cp50:cps[cps.length>>1],cp90:cps[Math.floor(cps.length*.9)],cpMax:cps[cps.length-1],resUnitMin:L.length?Math.min(...L.map(e=>e[2]/1e9)).toFixed(2):null};}
  return res;});
console.log(JSON.stringify(out,null,1));console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
