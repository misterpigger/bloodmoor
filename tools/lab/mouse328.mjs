// the player driven like a person with a real (locked) mouse: strokes through aimMove (so the box overflows into turning and the view tilting),
// the button held for cuts, W now and then. Counts falls, drawn-joint jumps relative to the hips (over 8 cm a frame), and big view turns.
// Q adds query (&pf). SECS. SEED. WEP.
import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('duel',process.env.MAP||'arena');
const r=await page.evaluate(async([wep,secs,seed,walk,NOGB,FJ])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  window.__pause=true;window.__FJ=FJ;if(NOGB)window.__noGB=1;for(let i=0;i<200&&!g.RP;i++)await wait(50);for(let i=0;i<120;i++)g.logic(1/60);
  const P=g.player;if(wep&&(!P.sword||P.sword.def.id!==wep)){g.spawnWeaponLoot(g.WEAPONS[wep],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
  for(const f of g.fighters)if(f!==P){f.think=()=>{};f.pos.x+=60;}
  P.damage=()=>{};const input=g.input;let s=seed;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  const J=['Spine2','Head','RightHand','LeftHand','RightForeArm','LeftForeArm','RightFoot','LeftFoot','RightLeg','LeftLeg'];
  const W=(n)=>{const e=P.bones[n].matrixWorld.elements;return [e[12],e[13],e[14]];};
  let inT={Right:0,Left:0},prev=null,pp=null,acc={},flips={R:0,L:0},fev=[],falls=0,down=0,jumps={},turns=0,pit=0,stroke=null,wasD=false,ev=[];J.forEach(j=>{jumps[j]=0;acc[j]=0;});
  for(let i=0;i<secs*60;i++){input.keys={};input.locked=true;
    if(!stroke||stroke.n<=0){const big=rnd()<.5;stroke={dx:(rnd()-.5)*(big?70:25),dy:(rnd()-.5)*(big?60:20),n:6+Math.floor(rnd()*20),lmb:rnd()<.55};}
    stroke.n--;input.lmb=stroke.lmb;if(walk&&(i%400)<200)input.keys.KeyW=true;
    g.aimMove(stroke.dx,stroke.dy);P.stamina=100;g.logic(1/60);g.scene.updateMatrixWorld(true);
    if(P.ragdoll){down++;if(!wasD){falls++;ev.push(i);}wasD=true;prev=null;pp=null;continue;}wasD=false;
    const H=W('Hips');const fr={};for(const j of J){const p=W(j);fr[j]=[p[0]-H[0],p[1]-H[1],p[2]-H[2]];}
    const dd=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
    if(prev)for(const j of J){if(dd(fr[j],prev[j])>.08)jumps[j]++;if(pp){const a=fr[j],b=prev[j],c=pp[j];if(Math.hypot(a[0]-2*b[0]+c[0],a[1]-2*b[1]+c[1],a[2]-2*b[2]+c[2])>.05){acc[j]++;if((window.__FJ?new RegExp(window.__FJ):/Foot|Leg/).test(j)&&fev.length<60)fev.push(['FT',i,j,i%400,stroke.lmb?1:0,+Math.hypot(P.vel.x,P.vel.z).toFixed(2),+P.ctrl.x.toFixed(2),+P.ctrl.y.toFixed(2),P.offOn?1:0,+(P.offW||0).toFixed(2)]);}}}
    if(prev)for(const sd of ['R','L']){const e=dd(fr[(sd==='R'?'Right':'Left')+'ForeArm'],prev[(sd==='R'?'Right':'Left')+'ForeArm']),h=dd(fr[(sd==='R'?'Right':'Left')+'Hand'],prev[(sd==='R'?'Right':'Left')+'Hand']);if(e>.1&&e>2*h){flips[sd]++;if(sd==='L'&&fev.length<80)fev.push(['FLIP',i,P.offOn?1:0,+(P.offW||0).toFixed(2),+(P._gb?.o||0).toFixed(2),stroke.lmb?1:0,+P.ctrl.x.toFixed(2),+P.ctrl.y.toFixed(2),+(P._gbA||0).toFixed?.(2)]);}}
    for(const sd of ['Right','Left']){const e=P.bones[sd+'ForeArm'].matrixWorld.elements;const x=[e[12],e[13],e[14]];for(const c of P.caps||[]){if(!c.on||c.zone!=='torso')continue;const ab=[c.b.x-c.a.x,c.b.y-c.a.y,c.b.z-c.a.z],L2=ab[0]**2+ab[1]**2+ab[2]**2||1e-9;let u=((x[0]-c.a.x)*ab[0]+(x[1]-c.a.y)*ab[1]+(x[2]-c.a.z)*ab[2])/L2;u=Math.max(0,Math.min(1,u));const d=Math.hypot(x[0]-c.a.x-ab[0]*u,x[1]-c.a.y-ab[1]*u,x[2]-c.a.z-ab[2]*u);if(d<c.r-.025){inT[sd]++;break;}}}
    pp=prev;prev=fr;}
  return {falls,inT,acc,flips,fev:fev.filter(e=>e[0]==='FT')};},[process.env.WEP||'longsword',+(process.env.SECS||40),+(process.env.SEED||7),+(process.env.WALK||0),+(process.env.NOGB||0),process.env.FJ||'']);
console.log(JSON.stringify(r));console.log(logs.slice(0,3).join('\n')||'no errors');await browser.close();process.exit(0);
