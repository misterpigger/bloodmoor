// Retargets CC0 clips from Quaternius' Universal Animation Library onto the fighters' skeleton and adds them to ../fighters.json.
//   SRC=<UAL glb> node anim-retarget.mjs            (SHOTS=dir also saves preview stills)
import { chromium } from 'playwright';import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
const HERE=path.dirname(fileURLToPath(import.meta.url));const THREE_DIR=process.env.THREE_DIR||path.join(HERE,'node_modules/three');
const SRC=process.env.SRC,DST=process.env.DST||path.join(HERE,'..','fighters.json'),OUT=process.env.OUT||DST;
const CLIPS=JSON.parse(process.env.CLIPS||'[{"src":"Sword_Idle","dst":"guard","inPlace":true}]');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM||undefined,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:480,height:480}});page.on('pageerror',e=>console.error('page error:',e.message));page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
await page.route('**/*',async route=>{const u=new URL(route.request().url());
  if(u.host==='cdn.jsdelivr.net'){const f=path.join(THREE_DIR,u.pathname.replace('/npm/three@0.160.0/',''));return fs.existsSync(f)?route.fulfill({path:f,contentType:'application/javascript'}):route.fulfill({status:404});}
  if(u.host==='lab.test'){const p=decodeURIComponent(u.pathname);
    if(p==='/lab.html')return route.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(HERE,'mh/lab.html'),'utf8').replace('/mh/build.js','/anim/retarget.js')});
    const f=p==='/anim/retarget.js'?path.join(HERE,'anim/retarget.js'):p==='/src.glb'?SRC:p==='/dst.json'?DST:null;
    if(!f||!fs.existsSync(f))return route.fulfill({status:404});return route.fulfill({path:f,contentType:'application/octet-stream'});}
  return route.abort();});
await page.goto('http://lab.test/lab.html');await page.waitForFunction(()=>window.READY,null,{timeout:60000});
const r=await page.evaluate(async c=>await window.RETARGET({src:'/src.glb',dst:'/dst.json',clips:c}),CLIPS);console.log(r.log.join('\n'));
if(process.env.SHOTS){fs.mkdirSync(process.env.SHOTS,{recursive:true});
  for(const c of r.clips)for(const fr of [0,.33,.66]){const img=await page.evaluate(([name,fr])=>{const {THREE,scene}=window.L,{T,out}=window.RT;const c=out.find(x=>x.name===name);
      if(!T.scene.parent){scene.add(T.scene);T.scene.traverse(o=>{if(o.isMesh&&!/Body_A|Eyes_A/.test(o.name))o.visible=false;});}
      const tr=[new THREE.VectorKeyframeTrack(window.RT.tb.Hips.name+'.position',c.times,c.hips)];for(const [bn,v] of Object.entries(c.tracks))tr.push(new THREE.QuaternionKeyframeTrack(bn+'.quaternion',c.times,v));
      const clip=new THREE.AnimationClip(name,c.duration,tr);const mx=new THREE.AnimationMixer(T.scene);const a=mx.clipAction(clip);a.play();mx.setTime(c.duration*fr);
      return window.L.shot([2.2,1.3,2.6],[0,.95,0]);},[c.name,fr]);
    fs.writeFileSync(path.join(process.env.SHOTS,c.name+'_'+fr+'.jpg'),Buffer.from(img.split(',')[1],'base64'));}}
// write the clips into the glTF: new accessors in a second buffer, channels on the bones by name
if(!process.env.NOWRITE){const j=JSON.parse(fs.readFileSync(DST,'utf8'));const nodeIdx=new Map(j.nodes.map((n,i)=>[n.name,i]));
  j.animations=j.animations.filter(a=>!r.clips.some(c=>c.name===a.name));
  const chunks=[];let off=0;const bi=j.buffers.length;const addAcc=(arr,type,minmax)=>{const f=new Float32Array(arr),b=Buffer.from(f.buffer);const bv=j.bufferViews.length;j.bufferViews.push({buffer:bi,byteOffset:off,byteLength:b.length});chunks.push(b);off+=b.length;
    const n=type==='SCALAR'?1:type==='VEC3'?3:4;const acc={bufferView:bv,componentType:5126,count:f.length/n,type};if(minmax){acc.min=[Math.min(...arr)];acc.max=[Math.max(...arr)];}j.accessors.push(acc);return j.accessors.length-1;};
  for(const c of r.clips){const want=CLIPS.find(w=>w.dst===c.name)||{},only=want.only?new RegExp(want.only):null;const tIn=addAcc(c.times,'SCALAR',true),anim={name:c.name,samplers:[],channels:[]};
    const hn=Object.keys(c.tracks).find(n=>/Hips$/.test(n));const add=(node,pathk,acc)=>{anim.samplers.push({input:tIn,output:acc,interpolation:'LINEAR'});anim.channels.push({sampler:anim.samplers.length-1,target:{node,path:pathk}});};
    if(hn&&nodeIdx.has(hn)&&!want.noHipsMove)add(nodeIdx.get(hn),'translation',addAcc(c.hips,'VEC3'));
    for(const [bn,v] of Object.entries(c.tracks))if(nodeIdx.has(bn)&&(!only||only.test(bn)))add(nodeIdx.get(bn),'rotation',addAcc(v,'VEC4'));   // (only: just the legs, so the arms and chest stay where the sword handling expects them)
    j.animations.push(anim);}
  const bin=Buffer.concat(chunks);j.buffers.push({byteLength:bin.length,uri:'data:application/octet-stream;base64,'+bin.toString('base64')});
  fs.writeFileSync(OUT,JSON.stringify(j));console.log('wrote',OUT,fs.statSync(OUT).size);}
await browser.close();
