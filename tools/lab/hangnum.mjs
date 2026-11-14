import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:300,HH:200,render:false,query:'?nohud'});
await start('duel','pit');await new Promise(r=>setTimeout(r,2500));
for(let run=0;run<3;run++){
const r=await page.evaluate((run)=>{const g=window.__game,P=g.player,F=g.fighters,input=g.input,PIT=g.PIT,T=g.THREE;window.__pause=true;for(let k=0;k<260;k++)g.logic(1/60);
  for(const f of F)if(f!==P){f.pos.set(PIT.x+20,0,PIT.z+20);f.ai.skill=0;}
  const c={x:PIT.x+.8-run*.5,z:PIT.z};P.pos.set(c.x,0,c.z+PIT.bw-.35);P.yaw=0;P.vel.set(0,0,0);P.stamina=100;P.hp=100;
  const out={bw:PIT.bw,rows:[]};let L=null;
  for(let i=0;i<620;i++){input.keys.KeyW=i<20||(i>=90&&!!P.hang);P.stamina=100;g.logic(1/60);if(P.hang)L=P.hang.L;
    if(i%40===0||i===619){const R=P.ragdoll;const row={i,hang:!!P.hang,cl:P.hang?+P.hang.climb.toFixed(2):null,alive:P.alive,rag:!!R,rise:!!(R&&R.rise)};
      if(R&&L){const f=n=>{const p=R.P[n];return [+((p.x-L.x)*L.dx+(p.z-L.z)*L.dz).toFixed(2),+(p.y-L.y).toFixed(2),+((p.x-L.x)*L.dz-(p.z-L.z)*L.dx).toFixed(2)];};row.ch=f('Spine2');row.hip=f('Hips');row.hd=f('Head');row.lf=f('LeftFoot');row.rf=f('RightFoot');
        const up=new T.Vector3().subVectors(R.P.Spine2,R.P.Hips),lf=new T.Vector3().subVectors(R.P.LeftArm,R.P.RightArm),fw=new T.Vector3().crossVectors(lf,up).normalize();row.faceUp=+fw.y.toFixed(2);
        // inside slab?
        let ins=0;for(const n of R.names){const p=R.P[n],al=(p.x-L.x)*L.dx+(p.z-L.z)*L.dz,dy=p.y-L.y;if(al>.02&&dy<-.02&&dy>-.3)ins++;}row.ins=ins;}
      else row.pos=[+P.pos.x.toFixed(2),+P.pos.y.toFixed(2),+P.pos.z.toFixed(2)];
      out.rows.push(row);}}
  out.L=L&&[+L.dx.toFixed(2),+L.dz.toFixed(2),+L.y.toFixed(2)];return out;},run);
console.log('RUN',run,JSON.stringify(r.L),r.bw);for(const x of r.rows)console.log(' ',JSON.stringify(x));
await page.evaluate(()=>window.__game.startGame());await new Promise(r=>setTimeout(r,1500));}
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
