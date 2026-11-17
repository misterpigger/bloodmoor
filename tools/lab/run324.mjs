// feet in the run: per frame for the left foot over ~1.2 s at a sprint: ankle height, toe height, foot pitch (ankle->toe vs level, + = toe down), ankle along-path vs hips, world slip of the ankle; plus summary of slip while planted. PF=1 for the physical fighter.
import {boot} from './harness.mjs';
const fq=process.env.FRP?'&frunp='+encodeURIComponent(process.env.FRP):'';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.PF?'&pf':'')+fq+(process.env.Q||'')});
const out=await page.evaluate(async([walk,process_stand,process_key])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  g.startGame('duel','colosseum');window.__pause=true;for(let i=0;i<200&&!g.RP;i++){await wait(50);}for(let i=0;i<120;i++)g.logic(1/60);
  const P=g.player,K=g.input.keys;const park=()=>{for(const D of g.fighters)if(D!==P){D.pos.set(22,0,22);D.vel.set(0,0,0);D.damage=()=>{};}};
  g.setHS(false);for(let q=0;q<10;q++){park();P.pos.set(-21,0,-14);P.vel.set(0,0,0);P.yaw=Math.PI/2;g.logic(1/60);}g.setHS(true);for(let q=0;q<30;q++){park();g.logic(1/60);}
  const W=n=>{const e=P.bones[n].matrixWorld.elements;return [e[12],e[13],e[14]];};
  const rows=[];let H0=0;let prev={};const slip={Left:[],Right:[]};const pitchDown={Left:[],Right:[]};
  for(let i=0;i<200;i++){park();P.stamina=100;K[process_key]=!process_stand;K.ShiftLeft=!walk;g.logic(1/60);g.scene.updateMatrixWorld(true);if(i<110)continue;
    const H=W('Hips');H0=H[1];const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);const r={};
    for(const s of ['Left','Right']){const f=W(s+'Foot'),t=W(s+'ToeBase');const hz=Math.hypot(t[0]-f[0],t[2]-f[2]);const pit=Math.atan2(f[1]-t[1],hz)*57.3;
      const pv=prev[s];const sl=pv?Math.hypot(f[0]-pv[0],f[2]-pv[2])*100:0;prev[s]=f;
      if(t[1]<.06||f[1]<.12){slip[s].push(sl);pitchDown[s].push(pit);}
      const hp=W(s+'UpLeg'),kn=W(s+'Leg');const v1=[hp[0]-kn[0],hp[1]-kn[1],hp[2]-kn[2]],v2=[f[0]-kn[0],f[1]-kn[1],f[2]-kn[2]];const kang=Math.round(Math.acos((v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2])/Math.hypot(...v1)/Math.hypot(...v2))*57.3);if(f[1]<.12)(window.__kd=window.__kd||[]).push(kang);const pk=(window.__pk=window.__pk||{});if(pk[s]!=null)(window.__kj=window.__kj||[]).push(Math.abs(kang-pk[s]));pk[s]=kang;
      r[s[0]]=[kang,+(f[1]).toFixed(3),+(t[1]).toFixed(3),Math.round(pit),+(((f[0]-H[0])*fx+(f[2]-H[2])*fz)).toFixed(2),+sl.toFixed(1)];}
    rows.push(r);}
  const st=a=>{const b=[...a].sort((x,y)=>x-y);return a.length?[b[0],b[Math.floor(b.length/2)],b[Math.floor(b.length*.9)],b[b.length-1]].map(v=>+v.toFixed(1)).join('/'):'-';};
  const kd=(window.__kd||[]).sort((a,b)=>a-b);const kj=(window.__kj||[]).sort((a,b)=>a-b);return {kj:kj.length?[kj[kj.length>>1],kj[Math.floor(kj.length*.9)],kj[Math.floor(kj.length*.99)],kj[kj.length-1]]:0,knee:kd.length?[kd[0],kd[kd.length>>1],kd[Math.floor(kd.length*.9)],kd[kd.length-1]]:0,hipY:+H0.toFixed(3),rows,slipL:st(slip.Left),slipR:st(slip.Right),pitL:st(pitchDown.Left),n:slip.Left.length,sp:Math.hypot(P.vel.x,P.vel.z).toFixed(2)};},[!!process.env.WALK,!!process.env.STAND,process.env.KEY||"KeyW"]);
console.log('L: ankleY toeY pitch along slipcm');for(const r of out.rows)console.log(JSON.stringify(r.L),JSON.stringify(r.R));
console.log('stance knee min/med/p90/max',JSON.stringify(out.knee),'hipY',out.hipY,'knee jump/frame p50/p90/p99/max',JSON.stringify(out.kj));console.log('down-frames',out.n,'slip cm/frame min/med/p90/max L',out.slipL,'R',out.slipR,'pitch when down',out.pitL,'speed',out.sp);
console.log(logs.slice(0,3).join('\n')||'no errors');await browser.close();process.exit(0);
