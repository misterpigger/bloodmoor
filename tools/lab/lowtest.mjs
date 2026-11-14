import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:600,HH:400,query:'?nohud',render:false});
const r=await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));
 g.startGame();window.__pause=true;for(let k=0;k<30;k++)g.logic(1/60);for(let t=0;t<20&&!g.CRYPT.lows.length;t++){g.startGame();for(let k=0;k<30;k++)g.logic(1/60);}
 const C=g.CRYPT,P=g.player,F=g.fighters,q=C.lows[0];if(!q)return 'no low';for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
 const T=g.THREE,v=new T.Vector3(),out=[];
 for(const spd of ['walk','run']){const u0=q.a0-2.5,dirx=q.ax?1:0,dirz=q.ax?0:1;P.pos.set(q.ax?u0:q.m,0,q.ax?q.m:u0);P.vel.set(0,0,0);P.yaw=Math.atan2(dirx,dirz);P.crouch=false;P._lowC=false;P.crouchAmt=0;
  for(let k=0;k<30;k++)g.logic(1/60);let mx=-9,mxIn=-9,mxEdge=-9;
  g.input.keys=g.input.keys||{};
  for(let k=0;k<600;k++){const ku=q.ax?P.pos.x:P.pos.z;if(ku>q.a1+1.5)break;
   window.__forceMove=1;g.input.fwd=1;
   // drive: set key state
   const K=g.input.keys;K['KeyW']=true;K['ShiftLeft']=spd==='run';
   g.logic(1/60);g.scene.updateMatrixWorld(true);
   let hy=-9;P.model.traverse(o=>{if(o.isBone&&/HeadTop_End$/.test(o.name)){o.getWorldPosition(v);hy=v.y;}});
   const head=P.bones.Head.getWorldPosition(v).y;const c=g.cryptCeil?g.cryptCeil(P.pos.x,P.pos.z):0;
   const inLow=ku>q.a0-.1&&ku<q.a1+.1;if(inLow&&hy-q.y>mxIn){mxIn=hy-q.y;window.__at=[+(ku-q.a0).toFixed(2),+(q.a1-q.a0).toFixed(2),+P.duck.toFixed(2),+P.crouchAmt.toFixed(2),k];}
   if(Math.abs(ku-q.a0)<.35)mxEdge=Math.max(mxEdge,hy-q.y);}
  const K=g.input.keys;K['KeyW']=false;K['ShiftLeft']=false;
  out.push({at:window.__at,spd,ceil:q.y,headTopOverCeilIn:+mxIn.toFixed(3),atEdge:+mxEdge.toFixed(3),crouch:+P.crouchAmt.toFixed(2),passed:+( (q.ax?P.pos.x:P.pos.z)-q.a1).toFixed(2)});}
 return out;});
console.log(JSON.stringify(r));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
