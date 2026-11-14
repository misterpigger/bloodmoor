import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await start('duel','arena');await new Promise(r=>setTimeout(r,2500));
console.log(JSON.stringify(await page.evaluate(()=>{const g=window.__game,P=g.player;const b=P.bones;const o={};for(const n of ['Hips','Spine','Spine1','Spine2','Neck','LeftArm','LeftShoulder']){const B=b[n];const v=new g.THREE.Vector3();B.getWorldPosition(v);o[n]=[+(v.x-P.pos.x).toFixed(3),+v.y.toFixed(3)];}
 let body=null;P.model.traverse(m=>{if(m.isSkinnedMesh&&/^MH_Body/.test(m.name))body=m;});o.body=body&&body.name;o.sc=P.model.scale.x;
 const sk=body.skeleton;const i=sk.bones.findIndex(x=>x.name==='Hips');const inv=sk.boneInverses[i].clone().invert();o.bindHips=[inv.elements[12],inv.elements[13],inv.elements[14]].map(x=>+x.toFixed(3));
 const j=sk.bones.findIndex(x=>x.name==='LeftArm');const inv2=sk.boneInverses[j].clone().invert();o.bindLArm=[inv2.elements[12],inv2.elements[13],inv2.elements[14]].map(x=>+x.toFixed(3));return o;})));
await browser.close();process.exit(0);
