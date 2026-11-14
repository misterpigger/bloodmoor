// Exports a map's static geometry (world-space triangles with a flat albedo each) for the light bake.
// MAP=arena OUT=/path/geo.bin node export.mjs
import {boot} from '../harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'geo.bin';
const {browser,page,logs,fr,start}=await boot({W:640,HH:360,query:'?nohud'+(process.env.Q||'')});
await start(process.env.MODE||'duel',process.env.MAP||'arena');await fr(40,1/30);await new Promise(r=>setTimeout(r,6000));await fr(10,1/30);
const info=await page.evaluate(()=>{const g=window.__game,T=g.THREE,W=g.world;W.updateMatrixWorld(true);
  const cv=document.createElement('canvas');cv.width=cv.height=8;const cx=cv.getContext('2d',{willReadFrequently:true});const avg=new Map();
  const lin=c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);
  const texAvg=t=>{if(!t||!t.image)return [1,1,1];if(avg.has(t))return avg.get(t);let r=[.6,.6,.6];try{cx.clearRect(0,0,8,8);cx.drawImage(t.image,0,0,8,8);const d=cx.getImageData(0,0,8,8).data;let a=0,b=0,c=0;for(let i=0;i<256;i+=4){a+=lin(d[i]/255);b+=lin(d[i+1]/255);c+=lin(d[i+2]/255);}r=[a/64,b/64,c/64];}catch(e){}avg.set(t,r);return r;};
  const tris=[],alb=[],names={};const v=new T.Vector3();let skipped=0;
  W.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh)return;let vis=true;for(let q=o;q;q=q.parent)if(!q.visible)vis=false;if(!vis)return;
    const m=Array.isArray(o.material)?o.material[0]:o.material;if(!m||m.transparent||m.alphaTest>0||m.depthWrite===false||m.isShaderMaterial||m.isMeshBasicMaterial||m.blending!==T.NormalBlending){skipped++;return;}
    const ge=o.geometry,P=ge.attributes.position;if(!P)return;const ta=texAvg(m.map),c=m.color||{r:1,g:1,b:1};const A=[Math.min(.85,c.r*ta[0]),Math.min(.85,c.g*ta[1]),Math.min(.85,c.b*ta[2])];
    const ix=ge.index,n=ix?ix.count:P.count;const key=(m.name||'')+'|'+A.map(x=>x.toFixed(2));names[key]=(names[key]||0)+n/3;
    for(let i=0;i<n;i++){const k=ix?ix.getX(i):i;v.fromBufferAttribute(P,k).applyMatrix4(o.matrixWorld);tris.push(v.x,v.y,v.z);if(i%3===0)alb.push(A[0],A[1],A[2]);}});
  const sd=g.moonDir;window.__geo={t:new Float32Array(tris),a:new Float32Array(alb)};return {nt:tris.length/9,skipped,names,sun:[sd.x,sd.y,sd.z]};});
console.log(JSON.stringify({nt:info.nt,skipped:info.skipped,sun:info.sun}));console.log(Object.entries(info.names).sort((a,b)=>b[1]-a[1]).slice(0,25).map(e=>e[0]+' '+e[1]).join('\n'));
const pull=async k=>{const len=await page.evaluate(k=>window.__geo[k].byteLength,k);const bufs=[];for(let o=0;o<len;o+=3<<20){const b64=await page.evaluate(([k,o])=>{const u=new Uint8Array(window.__geo[k].buffer,o,Math.min(3<<20,window.__geo[k].byteLength-o));let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);},[k,o]);bufs.push(Buffer.from(b64,'base64'));}return Buffer.concat(bufs);};
const t=await pull('t'),a=await pull('a');const hd=Buffer.alloc(4);hd.writeUInt32LE(info.nt);fs.writeFileSync(OUT,Buffer.concat([hd,t,a]));fs.writeFileSync(OUT+'.json',JSON.stringify({sun:info.sun,nt:info.nt}));
console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
