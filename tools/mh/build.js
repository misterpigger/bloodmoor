// Builds fighters.glb from the MakeHuman bodies (mh_bodies.json, made by build_mh.py): the game's Mixamo X Bot skeleton
// with its joints moved onto the MakeHuman body, each body reposed onto the X Bot's rest pose bone by bone and bound to it.
window.BUILD=async function(opts){
const {THREE,loader,GLTFExporter}=window.L;const log=[];
const xj=await (await fetch('/game/xbot.json')).json();
const X=await new Promise((res,rej)=>loader.parse(JSON.stringify(xj),'',res,rej));
X.scene.updateMatrixWorld(true);
const xb={};X.scene.traverse(o=>{if(o.isBone)xb[o.name.replace('mixamorig','').replace(':','')]=o;});
let xSkin=null;X.scene.traverse(o=>{if(o.isSkinnedMesh&&!xSkin)xSkin=o;});
const bones=xSkin.skeleton.bones;const idx={};bones.forEach((b,i)=>idx[b.name.replace('mixamorig','').replace(':','')]=i);
const M=await (await fetch('/mh/mh_bodies.json')).json();
const mhb=M.bones.map(n=>n.replace('mixamorig:',''));
const V3=(a)=>new THREE.Vector3(a[0],a[1],a[2]);
const A=M.bodies[0];const head={},tail={};for(const n of M.bones){head[n.replace('mixamorig:','')]=V3(A.heads[n]);tail[n.replace('mixamorig:','')]=V3(A.tails[n]);}
// X Bot rest directions (each bone's +Y axis in the world), taken before anything moves
// (the X Bot's rest rotations are all identity, so the direction is to the bone's main child)
const MAIN={Hips:'Spine',Spine:'Spine1',Spine1:'Spine2',Spine2:'Neck',Neck:'Head',Head:'HeadTop_End'};
for(const s of ['Left','Right']){Object.assign(MAIN,{[s+'Shoulder']:s+'Arm',[s+'Arm']:s+'ForeArm',[s+'ForeArm']:s+'Hand',[s+'Hand']:s+'HandMiddle1',[s+'UpLeg']:s+'Leg',[s+'Leg']:s+'Foot',[s+'Foot']:s+'ToeBase',[s+'ToeBase']:s+'Toe_End'});
  for(const f of ['Thumb','Index','Middle','Ring','Pinky'])for(let k=1;k<=3;k++)MAIN[s+'Hand'+f+k]=s+'Hand'+f+(k+1);}
const xdir={};for(const n in xb){const c=xb[MAIN[n]];if(!c)continue;xdir[n]=c.getWorldPosition(new THREE.Vector3()).sub(xb[n].getWorldPosition(new THREE.Vector3())).normalize();}
// per bone: the rotation that turns the MakeHuman bone onto the X Bot bone's direction
const delta={};let worstAng=0,worstN='';
// only the limbs: turning the spine, neck or collarbones to the X Bot's lines would lift the shoulders and stretch the neck
const LIMB=/(Arm|ForeArm|Hand|UpLeg|Leg|Foot|ToeBase)/;
for(const n of mhb){const dm=tail[n].clone().sub(head[n]).normalize(),dx=xdir[n];if(!dx||!LIMB.test(n)||/Shoulder/.test(n)){delta[n]=new THREE.Quaternion();continue;}
  delta[n]=new THREE.Quaternion().setFromUnitVectors(dm,dx);const a=dm.angleTo(dx)*57.3;if(a>worstAng){worstAng=a;worstN=n;}}
log.push('largest repose angle '+worstAng.toFixed(1)+' deg at '+worstN);
// posed joint heads, down the hierarchy
const par={};for(const n of M.bones)par[n.replace('mixamorig:','')]=(M.parents[n]||'').replace('mixamorig:','');
const order=[];const seen=new Set();const visit=n=>{if(seen.has(n))return;if(par[n])visit(par[n]);seen.add(n);order.push(n);};mhb.forEach(visit);
const head2={};for(const n of order){const p=par[n];head2[n]=p?head2[p].clone().add(head[n].clone().sub(head[p]).applyQuaternion(delta[p])):head[n].clone();}
const tail2={};for(const n of mhb)tail2[n]=head2[n].clone().add(tail[n].clone().sub(head[n]).applyQuaternion(delta[n]));
// move the game skeleton's joints onto the posed MakeHuman joints (rotations untouched, so the animations still fit)
const hipsOld=xb.Hips.position.clone();
const xorder=[];X.scene.traverse(o=>{if(o.isBone)xorder.push(o);});
const ends={HeadTop_End:'Head',LeftToe_End:'LeftToeBase',RightToe_End:'RightToeBase'};
for(const s of ['Left','Right'])for(const f of ['Thumb','Index','Middle','Ring','Pinky'])ends[s+'Hand'+f+'4']=s+'Hand'+f+'3';
for(const b of xorder){const m=b.name.replace('mixamorig','').replace(':','');const w=head2[m]||(ends[m]&&tail2[ends[m]]);if(!w)continue;
  b.parent.updateMatrixWorld(true);b.position.copy(b.parent.worldToLocal(w.clone()));b.updateMatrixWorld(true);}
X.scene.updateMatrixWorld(true);
const hipsDelta=xb.Hips.position.clone().sub(hipsOld);log.push('hips delta local '+hipsDelta.toArray().map(v=>v.toFixed(3)));
let worst=0;for(const m of mhb){if(!xb[m])continue;worst=Math.max(worst,xb[m].getWorldPosition(new THREE.Vector3()).distanceTo(head2[m]));}log.push('worst joint gap '+worst.toFixed(4));
const skel=new THREE.Skeleton(bones);
// skin weights: MakeHuman bone index -> game bone index
const si=new Uint16Array(M.skinIndex.length);for(let i=0;i<si.length;i++){const n=mhb[M.skinIndex[i]];si[i]=idx[n]!==undefined?idx[n]:idx.Hips;}
const sw=new Float32Array(M.skinWeight);
const uv=new Float32Array(M.uv);const index=M.index;
const _v=new THREE.Vector3(),_a=new THREE.Vector3();
// repose a body: linear blend of each bone's turn about its own head
function repose(P,Nr,headsB){const n=P.length/3,out=new Float32Array(P.length),on=new Float32Array(P.length);
  const hb={},hb2={};for(const nm of M.bones){const k=nm.replace('mixamorig:','');hb[k]=V3(headsB[nm]);}
  for(const k of order){const p=par[k];hb2[k]=p?hb2[p].clone().add(hb[k].clone().sub(hb[p]).applyQuaternion(delta[p])):hb[k].clone();}
  // and the whole body shifted so its joints sit where body A's do (they share the skeleton)
  for(let i=0;i<n;i++){const px=P[i*3],py=P[i*3+1],pz=P[i*3+2];let x=0,y=0,z=0,nx=0,ny=0,nz=0;
    for(let k=0;k<4;k++){const w=M.skinWeight[i*4+k];if(!w)continue;const bn=mhb[M.skinIndex[i*4+k]];
      _v.set(px,py,pz).sub(hb[bn]).applyQuaternion(delta[bn]).add(hb2[bn]).sub(hb2[bn]).add(head2[bn]);x+=w*_v.x;y+=w*_v.y;z+=w*_v.z;
      _a.set(Nr[i*3],Nr[i*3+1],Nr[i*3+2]).applyQuaternion(delta[bn]);nx+=w*_a.x;ny+=w*_a.y;nz+=w*_a.z;}
    out[i*3]=x;out[i*3+1]=y;out[i*3+2]=z;const l=Math.hypot(nx,ny,nz)||1;on[i*3]=nx/l;on[i*3+1]=ny/l;on[i*3+2]=nz/l;}
  return [out,on,hb];}
const old=[];X.scene.traverse(o=>{if(o.isSkinnedMesh)old.push(o);});for(const o of old)o.removeFromParent();
const skinMat=new THREE.MeshStandardMaterial({name:'mh_skin',color:0xffffff,roughness:.55});
const eyeMat=new THREE.MeshStandardMaterial({name:'mh_eye',color:0xffffff,roughness:.15});
for(const B of M.bodies){
  const [p,n,hb]=repose(B.pos,B.nor,B.heads);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('normal',new THREE.BufferAttribute(n,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setAttribute('skinIndex',new THREE.BufferAttribute(si,4));g.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));g.setIndex(index);
  const m=new THREE.SkinnedMesh(g,skinMat);m.name=B.name;X.scene.add(m);m.bind(skel,new THREE.Matrix4());
  // eyes ride the head bone; shift them with the head the same way
  const E=new Float32Array(B.eyes);const hk='Head';for(let i=0;i<E.length;i+=3){_v.set(E[i],E[i+1],E[i+2]).sub(hb[hk]).applyQuaternion(delta[hk]).add(head2[hk]);E[i]=_v.x;E[i+1]=_v.y;E[i+2]=_v.z;}
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(E,3));ge.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(M.eyes.uv),2));ge.setIndex(M.eyes.index);ge.computeVertexNormals();
  const ne=E.length/3,esi=new Uint16Array(ne*4),esw=new Float32Array(ne*4);for(let i=0;i<ne;i++){esi[i*4]=idx.Head;esw[i*4]=1;}
  ge.setAttribute('skinIndex',new THREE.BufferAttribute(esi,4));ge.setAttribute('skinWeight',new THREE.BufferAttribute(esw,4));
  const me=new THREE.SkinnedMesh(ge,eyeMat);me.name=B.name.replace('Body','Eyes');X.scene.add(me);me.bind(skel,new THREE.Matrix4());
  log.push(B.name+' verts '+p.length/3);}
const keep=['idle','walk','run'];const anims=[];
for(const a of X.animations.filter(a=>keep.includes(a.name))){const tr=[];
  for(const t of a.tracks){const [node,prop]=t.name.split('.');
    if(prop==='quaternion')tr.push(t);
    else if(prop==='position'&&node.endsWith('Hips')){const v=t.values.slice();for(let i=0;i<v.length;i+=3){v[i]+=hipsDelta.x;v[i+1]+=hipsDelta.y;v[i+2]+=hipsDelta.z;}tr.push(new THREE.VectorKeyframeTrack(t.name,t.times,v));}}
  anims.push(new THREE.AnimationClip(a.name,a.duration,tr));}
window.BUILT={scene:X.scene,anims,skel};
if(opts.noExport)return {log};
const glb=await new GLTFExporter().parseAsync(X.scene,{binary:true,animations:anims,onlyVisible:false});
const b=new Uint8Array(glb);let s='';for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));
return {log,glb:btoa(s)};
};
