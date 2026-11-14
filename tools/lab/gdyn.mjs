import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:400,HH:300,query:'?nohud',render:false});
const r=await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;
 for(let k=0;k<200;k++)g.logic(1/60);await new Promise(r=>setTimeout(r,2500));for(let k=0;k<30;k++)g.logic(1/60);
 const C=g.CRYPT,P=g.player,F=g.fighters,input=g.input,K=input.keys;for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
 const it=g.testLoot('knife',P.pos.x,P.pos.z);g.pickUp(P,it);
 const D=g.DYN.filter(d=>d.body&&!d.gone&&d.m<5);if(!D.length)return 'nodyn '+g.DYN.length+' bodies:'+g.DYN.filter(d=>d.body).length;
 const d=D[0],o=d.obj,p0=o.position.clone();const out={m:d.m,n:D.length};
 const dx=P.pos.x-p0.x,dz=P.pos.z-p0.z,l=Math.hypot(dx,dz)||1;P.pos.set(p0.x+dx/l*.6,0,p0.z+dz/l*.6);P.yaw=Math.atan2(-dx/l,-dz/l);P.vel.set(0,0,0);
 for(let i=0;i<40;i++){K.KeyG=false;input.locked=false;input.mx=.5;input.my=1;g.logic(1/60);}
 for(let i=0;i<60;i++){K.KeyG=true;input.locked=false;input.mx=.5;input.my=1;g.logic(1/60);if(P.offG&&P.offG.grab)break;}
 out.grab=P.offG&&P.offG.grab&&P.offG.grab.k;out.y0=+o.position.y.toFixed(2);
 out.tr=[];window.__dg=[];for(let i=0;i<90;i++){K.KeyG=true;input.locked=false;input.mx=.5;input.my=.2;g.logic(1/60);if(i%10==0){const G=P.offG,sh=P.mainArm==='R'?P.shL:P.shR;out.tr.push([G.grab&&G.grab.k,+G.pos.y.toFixed(2),+d.body.translation().y.toFixed(2),+P.pitch.toFixed(2),+sh.y.toFixed(2),+(P.duck||0).toFixed(2)]);}}out.yUp=+d.body.translation().y.toFixed(2);out.dg=window.__dg.filter((_,i)=>i%25==0);
 K.KeyG=false;for(let i=0;i<60;i++)g.logic(1/60);out.yAfter=+d.body.translation().y.toFixed(2);return out;});
console.log(JSON.stringify(r));console.log(logs.slice(0,3).join('\n')||'no errors');await browser.close();process.exit(0);
