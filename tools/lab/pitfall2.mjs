import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
const out=await page.evaluate(async()=>{const g=window.__game,res=[];window.__pitDbg=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="duel"]').click();await wait(100);const mb=document.querySelector('.map[data-map=pit]');if(mb)mb.click();await wait(200);g.startGame();window.__pause=true;
  for(let k=0;k<240;k++)g.logic(1/60);const P=g.player,PIT=g.PIT;
  for(const f of g.fighters)if(f!==P){f.pos.set(9,0,9);f.ai&&(f.ai.target=null);}
  for(let run=0;run<6;run++){P.hp=100;P.stamina=100;if(P.ragdoll){P.ragdoll=null;}
    const a=run*1.1+.3;P.pos.set(PIT.x+Math.cos(a)*1.2,0,PIT.z+Math.sin(a)*1.6+(Math.abs(Math.sin(a))<.3?1:0));P.vel.set(0,0,0);P.vy=0;P.fallT=null;P.pitT=null;
    g.input.keys.KeyS=true;let dead=null,landed=-1,up=-1,mh=100;for(let k=0;k<60*10;k++){g.logic(1/60);for(const f of g.fighters)if(f!==P)f.pos.set(9,0,9);
      mh=Math.min(mh,P.hp);if(!P.alive){dead=P.deathCause||"dead";break;}if(landed<0&&P.ragdoll&&P.ragdoll.P.Hips.y<-PIT.d+.6)landed=k/60;if(landed>=0&&!P.ragdoll&&up<0)up=k/60;}
    g.input.keys.KeyS=false;res.push({run,dead,minHp:Math.round(mh),landed,up,y:+P.pos.y.toFixed(2)});
    if(!P.alive)break;}
  // the ladder: stand at its foot, climb
  const d=PIT.ladder;let lad=null;if(d&&P.alive&&!P.ragdoll){const p=d.obj.position;P.pos.set(p.x,P.pos.y,p.z);for(let k=0;k<5;k++)g.logic(1/60);g.ladderClimb?g.ladderClimb(P,d):null;
    if(!P.climb){window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'}));g.logic(1/60);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyE'}));}
    const cl=!!P.climb;g.input.keys.KeyW=true;const tr=[];for(let k=0;k<60*14;k++){g.logic(1/60);P.stamina=100;if(k%15==0)tr.push([k/60,P.climb?(+P.climb.t.toFixed(2))+(P.climb.m?'m':''):'-',+P.pos.y.toFixed(2),+Math.hypot(P.pos.x-PIT.x,P.pos.z-PIT.z).toFixed(2),P.ragdoll?'R':'',P.fallT!=null?'F':'']);if(!P.climb&&k>30&&k%15==0&&tr.length>40)break;}window.__tr=tr;g.input.keys.KeyW=false;for(let k=0;k<60;k++)g.logic(1/60);lad={climbing:cl,y:+P.pos.y.toFixed(2),out:Math.hypot(P.pos.x-PIT.x,P.pos.z-PIT.z).toFixed(2),rag:!!P.ragdoll,ladY:+d.obj.position.y.toFixed(2)};}
  return {res,lad,ladder:!!d,tr:window.__tr};});
console.log(JSON.stringify(out,null,1));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
