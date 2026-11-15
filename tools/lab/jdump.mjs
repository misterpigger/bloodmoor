import {boot} from './harness.mjs';
const {browser,page,start,fr}=await boot({W:640,HH:360,query:'?nohud',render:false});
await start('duel','arena');await fr(2,1/30);
const r=await page.evaluate(()=>{const g=window.__game,P=g.player;let body=null;P.model.traverse(o=>{if(o.isSkinnedMesh&&/^MH_Body/.test(o.name))body=o;});const o={name:body.name,sc:P.model.scale.x};
  body.skeleton.bones.forEach((b,i)=>{const e=new g.THREE.Matrix4().copy(body.skeleton.boneInverses[i]).invert().elements;const n=b.name.replace('mixamorig','').replace(':','');if(/^(Hips|Spine|Spine1|Spine2|Neck|Head|HeadTop_End|Left(Shoulder|Arm|ForeArm|Hand|UpLeg|Leg|Foot|ToeBase))$/.test(n))o[n]=[e[12],e[13],e[14]].map(x=>+x.toFixed(3));});
  const bp=body.geometry.attributes.position;let mx=0,zf=-9,zb=9;for(let i=0;i<bp.count;i++){const y=bp.getY(i),x=bp.getX(i),z=bp.getZ(i);if(y>1.0&&y<1.3&&Math.abs(x)<.25){zf=Math.max(zf,z);zb=Math.min(zb,z);}if(y>1.15&&y<1.25)mx=Math.max(mx,Math.abs(x));}o.zf=zf;o.zb=zb;o.mx=mx;return o;});
console.log(JSON.stringify(r,null,0));await browser.close();process.exit(0);
