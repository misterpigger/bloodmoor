import {boot} from './harness.mjs';import fs from 'fs';
const MAPSL=(process.env.MAPS||'village').split(',');
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
for(const mp of MAPSL){const [mode,map]=mp.split('@');
  await start(mode,map,{pause:true});
  const r=await page.evaluate(async()=>{const g=window.__game;for(let i=0;i<200&&!g.PRW;i++){await new Promise(r=>setTimeout(r,30));g.logic(1/60);}for(let i=0;i<30;i++)g.logic(1/60);const t=performance.now();g.navBuild();const ms=performance.now()-t;const N=g.NAV;let s='';for(let i=0;i<N.blk.length;i++)s+=N.blk[i]?'1':'0';
    // a test path between two far points
    const buf=new Float32Array(1200);const f=g.fighters.find(f=>!f.isPlayer&&f.alive),P=g.player;const t1=performance.now();const m=g.navPath(f.pos.x,f.pos.z,P.pos.x,P.pos.z,buf);const pms=performance.now()-t1;
    return {n:N.n,s,ms,m,pms,pts:Array.from(buf.slice(0,m*2)),a:[f.pos.x,f.pos.z],b:[P.pos.x,P.pos.z],x0:N.x0,z0:N.z0,cs:N.cs,fs:g.fighters.map(f=>[f.pos.x,f.pos.z])};});
  console.log(map,'grid',r.n,'build ms',r.ms.toFixed(1),'path nodes',r.m,'in ms',r.pms.toFixed(2));
  // write a PGM-ish PPM
  const n=r.n,sc=2,W=n*sc,buf=Buffer.alloc(W*W*3);for(let j=0;j<n;j++)for(let i=0;i<n;i++){const b=r.s[j*n+i]==='1';for(let y=0;y<sc;y++)for(let x=0;x<sc;x++){const o=((j*sc+y)*W+i*sc+x)*3;buf[o]=b?40:220;buf[o+1]=b?40:215;buf[o+2]=b?50:200;}}
  const put=(wx,wz,c,rad=2)=>{const i=Math.round((wx-r.x0)/r.cs*sc),j=Math.round((wz-r.z0)/r.cs*sc);for(let y=-rad;y<=rad;y++)for(let x=-rad;x<=rad;x++){const X=i+x,Y=j+y;if(X<0||Y<0||X>=W||Y>=W)continue;const o=(Y*W+X)*3;buf[o]=c[0];buf[o+1]=c[1];buf[o+2]=c[2];}};
  for(let k=0;k<r.m;k++)put(r.pts[k*2],r.pts[k*2+1],[220,30,30],1);for(const f of r.fs)put(f[0],f[1],[30,90,230],3);
  fs.writeFileSync(`nav_${map}.ppm`,Buffer.concat([Buffer.from(`P6\n${W} ${W}\n255\n`),buf]));}
console.log(logs.slice(0,5).join('\n'));await browser.close();process.exit(0);
