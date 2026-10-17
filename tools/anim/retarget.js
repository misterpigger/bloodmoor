// Retargets clips from Quaternius' Universal Animation Library (CC0, Rigify "DEF-" bones) onto the game's Mixamo skeleton.
// Each target bone gets the source bone's rotation change from its reference pose, carried over in world space, so rest
// poses that differ (A-pose arms, other bone rolls) don't matter. The hips' travel is scaled by leg length.
window.RETARGET=async function(opts){
const {THREE,loader}=window.L;const log=[];
const parse=async u=>{const t=await (await fetch(u)).arrayBuffer();return await new Promise((res,rej)=>loader.parse(t,'',res,rej));};
const S=await parse(opts.src),T=await parse(opts.dst);
const MAP={Hips:'DEF-hips',Spine:'DEF-spine.001',Spine1:'DEF-spine.002',Spine2:'DEF-spine.003',Neck:'DEF-neck',Head:'DEF-head'};
for(const [s,r] of [['Left','L'],['Right','R']])Object.assign(MAP,{[s+'Shoulder']:'DEF-shoulder.'+r,[s+'Arm']:'DEF-upper_arm.'+r,[s+'ForeArm']:'DEF-forearm.'+r,[s+'Hand']:'DEF-hand.'+r,
  [s+'UpLeg']:'DEF-thigh.'+r,[s+'Leg']:'DEF-shin.'+r,[s+'Foot']:'DEF-foot.'+r,[s+'ToeBase']:'DEF-toe.'+r});
const sb={},tb={},SN=n=>THREE.PropertyBinding.sanitizeNodeName(n);for(const k in MAP)MAP[k]=SN(MAP[k]);S.scene.traverse(o=>{sb[o.name]=o;});T.scene.traverse(o=>{if(o.isBone)tb[o.name.replace('mixamorig','').replace(':','')]=o;});
const names=Object.keys(MAP).filter(n=>tb[n]&&sb[MAP[n]]);log.push('mapped '+names.length+' bones');
const order=[];T.scene.traverse(o=>{if(o.isBone){const n=o.name.replace('mixamorig','').replace(':','');if(names.includes(n))order.push(n);}});   // parents first
const mixer=new THREE.AnimationMixer(S.scene);
const pose=(clip,t)=>{mixer.stopAllAction();const a=mixer.clipAction(clip);a.reset().play();a.paused=true;a.time=t;mixer.update(0);S.scene.updateMatrixWorld(true);};
const wq=o=>o.getWorldQuaternion(new THREE.Quaternion()),wp=o=>o.getWorldPosition(new THREE.Vector3());
// reference: the source in its T-pose clip, the target in its bind pose
const ref=S.animations.find(a=>a.name==='A_TPose');pose(ref,0);const Qs0={},Ps0={};for(const n of names){Qs0[n]=wq(sb[MAP[n]]);}const hs0=wp(sb[MAP.Hips]);
T.scene.updateMatrixWorld(true);const Qt0={};for(const n of names)Qt0[n]=wq(tb[n]);const ht0=wp(tb.Hips);
// leg length ratio (hip height), for the hips' travel
const legS=hs0.y-wp(sb[MAP.LeftFoot]).y,legT=ht0.y-wp(tb.LeftFoot).y,k=legT/legS;log.push('leg ratio '+k.toFixed(3));
const out=[];
for(const want of opts.clips){const clip=S.animations.find(a=>a.name===want.src);if(!clip){log.push('missing '+want.src);continue;}
  const fps=30,n=Math.max(2,Math.round(clip.duration*fps)+1),times=new Float32Array(n),tracks={};for(const nm of names)tracks[nm]=new Float32Array(n*4);const hipsP=new Float32Array(n*3);
  for(let i=0;i<n;i++){const t=Math.min(clip.duration,i/fps);times[i]=t;pose(clip,t);
    const world={};for(const nm of order){const q=wq(sb[MAP[nm]]).multiply(Qs0[nm].clone().invert()).multiply(Qt0[nm]);world[nm]=q;
      const par=tb[nm].parent;let pq;const pn=par.name.replace('mixamorig','').replace(':','');if(world[pn])pq=world[pn];else{par.updateMatrixWorld(true);pq=wq(par);}
      const lq=pq.clone().invert().multiply(q);tracks[nm].set([lq.x,lq.y,lq.z,lq.w],i*4);}
    const d=wp(sb[MAP.Hips]).sub(hs0).multiplyScalar(k);if(want.inPlace){d.x=0;d.z=0;}const w=ht0.clone().add(d);const lp=tb.Hips.parent.worldToLocal(w);hipsP.set([lp.x,lp.y,lp.z],i*3);}
  out.push({name:want.dst,duration:clip.duration,times:Array.from(times),hips:Array.from(hipsP),tracks:Object.fromEntries(names.map(nm=>[tb[nm].name,Array.from(tracks[nm])]))});
  log.push(want.dst+' <- '+want.src+' '+clip.duration.toFixed(2)+'s '+n+' keys');}
// for a look: the target posed by the first clip
window.RT={S,T,out,tb};
return {log,clips:out};};
