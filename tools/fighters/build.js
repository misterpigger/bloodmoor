// Builds fighters.glb: the game's Mixamo skeleton, joints moved onto the Quaternius bodies, with the Quaternius meshes rebound to it.
window.BUILD=async function(opts){
const {THREE,loader,GLTFExporter}=window.L;const log=[];
const load=u=>loader.loadAsync(u);
const xj=await (await fetch('/game/xbot.json')).json();   // the game skeleton and animations
const X=await new Promise((res,rej)=>loader.parse(JSON.stringify(xj),'',res,rej));
X.scene.updateMatrixWorld(true);
const xb={};X.scene.traverse(o=>{if(o.isBone)xb[o.name.replace('mixamorig','')]=o;});
let xSkin=null;X.scene.traverse(o=>{if(o.isSkinnedMesh&&!xSkin)xSkin=o;});
const bones=xSkin.skeleton.bones;const idx={};bones.forEach((b,i)=>idx[b.name.replace('mixamorig','')]=i);
// Mixamo name -> Quaternius name
const M2Q={Hips:'pelvis',Spine:'spine_01',Spine1:'spine_02',Spine2:'spine_03',Neck:'neck_01',Head:'Head'};
for(const [S,s] of [['Left','l'],['Right','r']]){Object.assign(M2Q,{[S+'Shoulder']:'clavicle_'+s,[S+'Arm']:'upperarm_'+s,[S+'ForeArm']:'lowerarm_'+s,[S+'Hand']:'hand_'+s,[S+'UpLeg']:'thigh_'+s,[S+'Leg']:'calf_'+s,[S+'Foot']:'foot_'+s,[S+'ToeBase']:'ball_'+s,[S+'Toe_End']:'ball_leaf_'+s});
  for(const [F,f] of [['Thumb','thumb'],['Index','index'],['Middle','middle'],['Ring','ring'],['Pinky','pinky']])for(let k=1;k<=4;k++)M2Q[S+'Hand'+F+k]=f+'_0'+k+(k===4?'_leaf':'')+'_'+s;}
const Q2M={};for(const m in M2Q)Q2M[M2Q[m]]=m;Q2M.root='Hips';
// Quaternius sources
const src={};
for(const [k,u] of Object.entries({base:'/q/base/Superhero_Male_FullBody.gltf',peasant:'/q/outfits/Male_Peasant.gltf',ranger:'/q/outfits/Male_Ranger.gltf',buzz:'/q/hair/Hair_Buzzed.gltf',parted:'/q/hair/Hair_SimpleParted.gltf',long:'/q/hair/Hair_Long.gltf',beard:'/q/hair/Hair_Beard.gltf'}))src[k]=await load(u);
// line the bodies up with the game's skeleton: same hip centre front-to-back
const qref={};src.peasant.scene.updateMatrixWorld(true);src.peasant.scene.traverse(o=>{if(o.isBone)qref[o.name]=o;});
const dz=xb.LeftUpLeg.getWorldPosition(new THREE.Vector3()).z-qref.thigh_l.getWorldPosition(new THREE.Vector3()).z;log.push('dz '+dz.toFixed(3));
for(const k in src){src[k].scene.position.z+=dz;src[k].scene.updateMatrixWorld(true);}
// move the game skeleton's joints onto the outfit skeleton's joints (rotations untouched, so the animations still fit)
const hipsOld=xb.Hips.position.clone();
const order=[];X.scene.traverse(o=>{if(o.isBone)order.push(o);});
for(const b of order){const m=b.name.replace('mixamorig','');const q=M2Q[m];if(!q||!qref[q])continue;
  const w=qref[q].getWorldPosition(new THREE.Vector3());b.parent.updateMatrixWorld(true);b.position.copy(b.parent.worldToLocal(w));b.updateMatrixWorld(true);}
X.scene.updateMatrixWorld(true);
const hipsDelta=xb.Hips.position.clone().sub(hipsOld);log.push('hips delta local '+hipsDelta.toArray().map(v=>v.toFixed(2)));
// check: joints now coincide
let worst=0;for(const m in M2Q){if(!xb[m]||!qref[M2Q[m]])continue;const d=xb[m].getWorldPosition(new THREE.Vector3()).distanceTo(qref[M2Q[m]].getWorldPosition(new THREE.Vector3()));worst=Math.max(worst,d);}log.push('worst joint gap '+worst.toFixed(4));
const skel=new THREE.Skeleton(bones);   // inverses from the adjusted rest pose
// textures: shrink and re-encode
const texCache=new Map();const shrink=(t,size)=>{if(!t||!t.image)return null;const fc=document.createElement('canvas');fc.width=fc.height=12;const fx=fc.getContext('2d');fx.drawImage(t.image,0,0,12,12);const key=t.image.width+'x'+t.image.height+':'+Array.from(fx.getImageData(0,0,12,12).data).join(',')+'|'+size;if(texCache.has(key))return texCache.get(key);const r=shrink0(t,size);texCache.set(key,r);return r;};
const shrink0=(t,size)=>{const c=document.createElement('canvas');c.width=c.height=Math.min(size,t.image.width);c.getContext('2d').drawImage(t.image,0,0,c.width,c.height);const n=new THREE.CanvasTexture(c);n.flipY=t.flipY;n.colorSpace=t.colorSpace;n.wrapS=t.wrapS;n.wrapT=t.wrapT;n.userData.mimeType='image/jpeg';return n;};
const matCache=new Map();
const mat=(m,name,rough)=>{if(matCache.has(m))return matCache.get(m);const n=new THREE.MeshStandardMaterial({name,map:shrink(m.map,opts.tex||1024),normalMap:shrink(m.normalMap,opts.ntex||512),roughness:rough,metalness:0});matCache.set(m,n);return n;};
const _v=new THREE.Vector3();
// rebind a source mesh onto the game skeleton; keepTri(i0,i1,i2) optionally filters triangles
function rebind(qm,name,material,keepTri){
  qm.updateMatrixWorld(true);const g0=qm.geometry;const g=new THREE.BufferGeometry();
  const P=g0.attributes.position,N=g0.attributes.normal,UV=g0.attributes.uv,SI=g0.attributes.skinIndex,SW=g0.attributes.skinWeight;
  const n=P.count,pos=new Float32Array(n*3),nor=new Float32Array(n*3),si=new Uint16Array(n*4),sw=new Float32Array(n*4);
  const nm=new THREE.Matrix3().getNormalMatrix(qm.matrixWorld);const qb=qm.skeleton.bones;
  for(let i=0;i<n;i++){qm.getVertexPosition(i,_v);_v.applyMatrix4(qm.matrixWorld);pos.set([_v.x,_v.y,_v.z],i*3);
    _v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor.set([_v.x,_v.y,_v.z],i*3);
    for(let k=0;k<4;k++){const qn=qb[SI.getComponent(i,k)].name;const mn=Q2M[qn];const bi=mn!==undefined&&idx[mn]!==undefined?idx[mn]:idx.Hips;si[i*4+k]=bi;sw[i*4+k]=SW.getComponent(i,k);}}
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));if(UV)g.setAttribute('uv',UV.clone());
  g.setAttribute('skinIndex',new THREE.BufferAttribute(si,4));g.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));
  let index=g0.index?Array.from(g0.index.array):[...Array(n).keys()];
  if(keepTri){const k=[];for(let t=0;t<index.length;t+=3)if(keepTri(index[t],index[t+1],index[t+2]))k.push(index[t],index[t+1],index[t+2]);index=k;}
  g.setIndex(index);
  if(keepTri){ // drop unused vertices
    const used=new Map(),ni=[];for(const v of index){if(!used.has(v))used.set(v,used.size);ni.push(used.get(v));}
    const g2=new THREE.BufferGeometry();for(const [an,a] of Object.entries(g.attributes)){const s=a.itemSize,arr=new a.array.constructor(used.size*s);for(const [ov,nv] of used)for(let c=0;c<s;c++)arr[nv*s+c]=a.array[ov*s+c];g2.setAttribute(an,new THREE.BufferAttribute(arr,s,a.normalized));}g2.setIndex(ni);g.dispose();
    const m=new THREE.SkinnedMesh(g2,material);m.name=name;return m;}
  const m=new THREE.SkinnedMesh(g,material);m.name=name;return m;
}
const out=[];const meshesOf=gl=>{const a=[];gl.scene.traverse(o=>{if(o.isSkinnedMesh)a.push(o);});return a;};
const tag=(o,s)=>{o.userData.part=s;return o;};
// base body: whole body (bare-chested look), plus a head-and-neck piece for wearing with outfits
for(const m of meshesOf(src.base)){
  const nm=m.name+'|'+m.material.name;
  if(m.material.name==='MI_Superhero_Male'){
    const M=mat(m.material,'skin_body',.55);out.push(rebind(m,'Body_Bare',M));
    const SI=m.geometry.attributes.skinIndex,SW=m.geometry.attributes.skinWeight,qb=m.skeleton.bones;
    const dom=i=>{let bw=-1,bn='';for(let k=0;k<4;k++){const w=SW.getComponent(i,k);if(w>bw){bw=w;bn=qb[SI.getComponent(i,k)].name;}}return bn;};
    const headish=i=>{const b=dom(i);return b==='Head'||b==='neck_01';};
    out.push(rebind(m,'Head',M,(a,b,c)=>headish(a)&&headish(b)&&headish(c)));
  } else if(m.material.name==='MI_Eyes')out.push(rebind(m,'Eyes',mat(m.material,'eyes',.2)));
  else out.push(rebind(m,'Brows',mat(m.material,'hair',.8)));
}
for(const [k,pre] of [['peasant','Peasant'],['ranger','Ranger']])for(const m of meshesOf(src[k])){
  const skin=m.material.name==='MI_Regular_Male';out.push(rebind(m,pre+'_'+m.name.replace(/^Male_(Peasant|Ranger)_/,'')+(skin?'_Skin':''),mat(m.material,skin?'skin_limbs':'cloth_'+k,skin?.55:.85)));}
for(const [k,nm] of [['buzz','Hair_Buzzed'],['parted','Hair_Parted'],['long','Hair_Long'],['beard','Hair_Beard']])for(const m of meshesOf(src[k]))out.push(rebind(m,nm,mat(m.material,'hair',.8)));
// swap the meshes into the game model
const old=[];X.scene.traverse(o=>{if(o.isSkinnedMesh)old.push(o);});for(const o of old)o.removeFromParent();
for(const m of out){X.scene.add(m);m.bind(skel,new THREE.Matrix4());}
log.push('meshes '+out.map(m=>m.name+':'+m.geometry.attributes.position.count).join(' '));
// animations: rotations only, plus the hips height shifted onto the new pelvis
const keep=['idle','walk','run'];const anims=[];
for(const a of X.animations.filter(a=>keep.includes(a.name))){const tr=[];
  for(const t of a.tracks){const [node,prop]=t.name.split('.');
    if(prop==='quaternion')tr.push(t);
    else if(prop==='position'&&node.endsWith('Hips')){const v=t.values.slice();for(let i=0;i<v.length;i+=3){v[i]+=hipsDelta.x;v[i+1]+=hipsDelta.y;v[i+2]+=hipsDelta.z;}tr.push(new THREE.VectorKeyframeTrack(t.name,t.times,v));}}
  anims.push(new THREE.AnimationClip(a.name,a.duration,tr));}
log.push('anims '+anims.map(a=>a.name+':'+a.tracks.length));
window.BUILT={scene:X.scene,anims,skel};
if(opts.noExport)return log;
const glb=await new GLTFExporter().parseAsync(X.scene,{binary:true,animations:anims,onlyVisible:false});
const b=new Uint8Array(glb);let s='';for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));
return {log,glb:btoa(s)};
};
