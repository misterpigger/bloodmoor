import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
const out=await page.evaluate(async()=>{const g=window.__game,log=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);
  const run=async(win)=>{g.startGame();window.__pause=true;for(let k=0;k<240;k++)g.logic(1/60);const P=g.player,foes=g.fighters.filter(f=>f.entrant&&f.entrant.foe);
    const info={hud:g.MODEHUD.slice(),kit:[P.sword&&P.sword.def.id,Object.values(P.armor).filter(Boolean).map(a=>a.def.id)],foes:foes.map(f=>[f.name,f.sword&&f.sword.def.id,+f.ai.skill.toFixed(2),Object.values(f.armor).filter(Boolean).map(a=>a.def.id)])};
    if(win)for(const f of foes)f.die(P,'slain',null);else P.die(foes[0],'slain',null);
    for(let k=0;k<260;k++)g.logic(1/60);info.end=g.END&&[g.END.title,g.END.line,g.END.cause];info.state=g.state;const C=g.CAREER;info.c=[C.renown,C.coin,C.wins,C.losses,C.streak,C.bouts];return info;};
  log.push(await run(true));log.push(await run(true));log.push(await run(false));
  // rank up fast and buy
  const C=g.CAREER;C.renown=345;C.coin=500;g.careerUI();const b=document.querySelector('#careerBox [data-buy="poleaxe"]'),b2=document.querySelector('#careerBox [data-buy="longsword"]');
  log.push({poleaxeDisabled:b&&b.disabled,longswordDisabled:b2&&b2.disabled});b2.click();log.push({own:g.CAREER.own.slice(),load:g.CAREER.load,coin:g.CAREER.coin});
  C.bouts=3;log.push(await run(true));C.bouts=4;for(let i=0;i<3;i++)log.push(await run(true));
  log.push(JSON.parse(localStorage.getItem('bloodmoor-career')));
  return log;});
for(const l of out)console.log(JSON.stringify(l));
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
