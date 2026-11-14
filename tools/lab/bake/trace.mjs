// Path-traces a map's indirect light into a grid of ambient cubes (six directions a cell): sky light that gets in, and sunlight bounced off surfaces (two bounces), kept apart.
// GEO=geo.bin OUT=bake.bin node trace.mjs   (BOUNDS="x0,y0,z0,x1,y1,z1" CELL=.4 RAYS=160)
import {Worker,isMainThread,workerData,parentPort} from 'worker_threads';import fs from 'fs';import os from 'os';
import * as THREE from 'three';import {MeshBVH} from 'three-mesh-bvh';
const E=process.env,B=(E.BOUNDS||'-19.2,0.1,-19.2,19.2,9.7,19.2').split(',').map(Number),CELL=+(E.CELL||.4),RAYS=+(E.RAYS||160);
const NX=Math.round((B[3]-B[0])/CELL),NY=Math.round((B[4]-B[1])/CELL),NZ=Math.round((B[5]-B[2])/CELL);
const SUN_E=E.SUN?E.SUN.split(',').map(Number):[4.9*1.0,4.9*.9,4.9*.76];   // the sun's colour (0xfff3e2, linear) times its strength
const sky=(d,o)=>{if(d.y<0){o[0]=.22;o[1]=.2;o[2]=.17;return;}const t=Math.pow(d.y,.6);o[0]=.75+(.18-.75)*t;o[1]=.82+(.34-.82)*t;o[2]=.92+(.72-.92)*t;};
if(isMainThread){const nw=Math.max(1,os.cpus().length),t0=Date.now();const out=new Float32Array(NX*NY*NZ*37);let done=0;
  await Promise.all([...Array(nw)].map((_,w)=>new Promise(res=>{const wk=new Worker(new URL(import.meta.url),{workerData:{w,nw}});wk.on('message',m=>{if(m.p){if(w===0)process.stdout.write(`\r${(m.p*100).toFixed(0)}% ${((Date.now()-t0)/1000).toFixed(0)}s `);return;}out.set(m.data,m.y0*NX*NZ*37);done++;});wk.on('exit',res);wk.on('error',e=>{console.error(e);process.exit(1);});})));
  const hd=Buffer.alloc(40);hd.writeUInt32LE(NX,0);hd.writeUInt32LE(NY,4);hd.writeUInt32LE(NZ,8);for(let i=0;i<6;i++)hd.writeFloatLE(B[i],12+i*4);hd.writeFloatLE(CELL,36);
  fs.writeFileSync(E.OUT||'bake.bin',Buffer.concat([hd,Buffer.from(out.buffer)]));console.log(`\n${NX}x${NY}x${NZ} done in ${((Date.now()-t0)/1000).toFixed(0)}s`);
}else{const {w,nw}=workerData;const buf=fs.readFileSync(E.GEO),nt=buf.readUInt32LE(0);const pos=new Float32Array(buf.buffer.slice(buf.byteOffset+4,buf.byteOffset+4+nt*36)),alb=new Float32Array(buf.buffer.slice(buf.byteOffset+4+nt*36,buf.byteOffset+4+nt*48));
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(pos,3));const ix=new Uint32Array(nt*3);for(let i=0;i<nt*3;i++)ix[i]=i;ge.setIndex(new THREE.BufferAttribute(ix,1));
  const bvh=new MeshBVH(ge,{maxLeafTris:6,indirect:true});const sun=new THREE.Vector3(...JSON.parse(fs.readFileSync(E.GEO+'.json')).sun).normalize();
  const ray=new THREE.Ray(),fn=new THREE.Vector3(),e1=new THREE.Vector3(),e2=new THREE.Vector3(),tu=new THREE.Vector3(),tv=new THREE.Vector3(),d2=new THREE.Vector3(),p=new THREE.Vector3();
  const hit=(o,d)=>{ray.origin.copy(o);ray.direction.copy(d);return bvh.raycastFirst(ray,THREE.DoubleSide);};
  const faceN=(h,d)=>{const f=h.faceIndex*9;e1.set(pos[f+3]-pos[f],pos[f+4]-pos[f+1],pos[f+5]-pos[f+2]);e2.set(pos[f+6]-pos[f],pos[f+7]-pos[f+1],pos[f+8]-pos[f+2]);fn.crossVectors(e1,e2).normalize();const back=fn.dot(d)>0;if(back)fn.negate();return back;};
  const lit=(P,n)=>{const c=n.dot(sun);if(c<=0)return 0;p.copy(P).addScaledVector(n,.012);return hit(p,sun)?0:c;};
  const cosDir=(n,o)=>{const r1=Math.random(),r2=Math.random()*6.2831853,r=Math.sqrt(r1);if(Math.abs(n.y)<.9)tu.set(0,1,0);else tu.set(1,0,0);tu.cross(n).normalize();tv.crossVectors(n,tu);o.copy(n).multiplyScalar(Math.sqrt(1-r1)).addScaledVector(tu,r*Math.cos(r2)).addScaledVector(tv,r*Math.sin(r2)).normalize();};
  const dirs=[];for(let i=0;i<RAYS;i++){const y=1-2*(i+.5)/RAYS,r=Math.sqrt(1-y*y),a=i*2.399963;dirs.push(new THREE.Vector3(r*Math.cos(a),y,r*Math.sin(a)));}
  const O=new THREE.Vector3(),d=new THREE.Vector3(),P1=new THREE.Vector3(),n1=new THREE.Vector3(),P2=new THREE.Vector3(),q=new THREE.Quaternion(),ax=new THREE.Vector3(),sk=[0,0,0],Ls=[0,0,0],Lb=[0,0,0];
  const y0=Math.floor(NY*w/nw),y1=Math.floor(NY*(w+1)/nw),data=new Float32Array((y1-y0)*NX*NZ*37),K=4*Math.PI/RAYS;
  for(let y=y0;y<y1;y++){for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++){const o=((y-y0)*NZ*NX+z*NX+x)*37;O.set(B[0]+(x+.5)*CELL,B[1]+(y+.5)*CELL,B[2]+(z+.5)*CELL);
      ax.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize();q.setFromAxisAngle(ax,Math.random()*6.28);let back=0;
      for(let i=0;i<RAYS;i++){d.copy(dirs[i]).applyQuaternion(q);const h=hit(O,d);Ls[0]=Ls[1]=Ls[2]=0;Lb[0]=Lb[1]=Lb[2]=0;
        if(!h){sky(d,Ls);}else{if(faceN(h,d))back++;n1.copy(fn);P1.copy(h.point);const a=h.faceIndex*3,a0=alb[a],a1=alb[a+1],a2=alb[a+2],c=lit(P1,n1)/Math.PI;
          Lb[0]=a0*SUN_E[0]*c;Lb[1]=a1*SUN_E[1]*c;Lb[2]=a2*SUN_E[2]*c;
          cosDir(n1,d2);P2.copy(P1).addScaledVector(n1,.012);const h2=hit(P2,d2);   // one more bounce: what lights the surface we hit, other than the sun directly
          if(!h2){sky(d2,sk);Ls[0]=a0*sk[0];Ls[1]=a1*sk[1];Ls[2]=a2*sk[2];}else{faceN(h2,d2);n1.copy(fn);const b=h2.faceIndex*3,c2=lit(h2.point,n1);
            Lb[0]+=a0*alb[b]*SUN_E[0]*c2/Math.PI;Lb[1]+=a1*alb[b+1]*SUN_E[1]*c2/Math.PI;Lb[2]+=a2*alb[b+2]*SUN_E[2]*c2/Math.PI;
            const am=.35*Math.max(0,.5+.5*n1.y);Ls[0]+=a0*alb[b]*am*.5;Ls[1]+=a1*alb[b+1]*am*.6;Ls[2]+=a2*alb[b+2]*am*.8;}}
        for(let k=0;k<6;k++){const cw=k<2?(k===0?d.x:-d.x):k<4?(k===2?d.y:-d.y):(k===4?d.z:-d.z);if(cw<=0)continue;const m=cw*K;data[o+k*3]+=Ls[0]*m;data[o+k*3+1]+=Ls[1]*m;data[o+k*3+2]+=Ls[2]*m;data[o+18+k*3]+=Lb[0]*m;data[o+18+k*3+1]+=Lb[1]*m;data[o+18+k*3+2]+=Lb[2]*m;}}
      data[o+36]=back/RAYS;}
    parentPort.postMessage({p:(y-y0+1)/(y1-y0)});}
  parentPort.postMessage({data,y0});}
