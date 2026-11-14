import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await page.evaluate(()=>{const b=document.querySelector(`.tn[data-tn="8"]`);if(b)b.click();});
await start('team','arena',{pause:true});
const out=await page.evaluate(async()=>{const g=window.__game,T=g.THREE,R={};for(let i=0;i<60;i++)g.logic(1/60);
  for(const f of g.fighters){let body=null;f.model.traverse(o=>{if(o.isSkinnedMesh&&/^MH_Body/.test(o.name))body=o;});if(!body||R[body.name])continue;const J={};body.skeleton.bones.forEach((b,i)=>{const e=new T.Matrix4().copy(body.skeleton.boneInverses[i]).invert().elements;J[b.name.replace('mixamorig','').replace(':','')]=[+e[12].toFixed(3),+e[13].toFixed(3),+e[14].toFixed(3)];});
    R[body.name]={sh:J.LeftArm,el:J.LeftForeArm,wr:J.LeftHand,hips:J.Hips,neck:J.Neck};
    f.model.traverse(o=>{if(o.isSkinnedMesh&&o.name==='MH_Armor'&&o.geometry.attributes.aLoose){const P=o.geometry.attributes.position;let mx=0;for(let i=0;i<P.count;i++)mx=Math.max(mx,Math.abs(P.getX(i)));R[body.name].armorMaxX=(R[body.name].armorMaxX||[]).concat(+mx.toFixed(3));}});}
  return R;});
console.log(JSON.stringify(out,null,0));await browser.close();process.exit(0);
