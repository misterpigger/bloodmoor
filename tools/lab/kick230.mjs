import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await start('yard','arena');await new Promise(r=>setTimeout(r,2500));
const out=await page.evaluate(async()=>{const g=window.__game,T=g.THREE,res=[];window.__pause=true;for(let k=0;k<240;k++)g.logic(1/60);const P=g.player;
  const kick=()=>{P.kickT=0;P.kickHit=false;P.kickLeg='R';};
  for(let rep=0;rep<3;rep++){let D=null;for(let q=0;q<900&&!(D=g.fighters.find(f=>f.dummy&&f.alive&&!f.ragdoll&&!f.downed&&!f.rec));q++)g.logic(1/60);if(!D){res.push('no dummy');continue;}
    const fw=new T.Vector3(Math.sin(D.yaw),0,Math.cos(D.yaw));D.knockdown(1.2,fw.clone().multiplyScalar(-2.5),D.chest.clone());
    let t=0;while(D.ragdoll&&!D.ragdoll.rise&&t<6){g.logic(1/60);t+=1/60;}for(let i=0;i<25;i++)g.logic(1/60);
    if(!D.ragdoll){res.push('up too soon');continue;}
    const h=D.ragdoll.P.Hips;P.pos.set(h.x,0,h.z-.75);P.yaw=0;P.vel.set(0,0,0);P.stamina=100;const hp0=D.hp,rising=!!D.ragdoll.rise,p0=h.clone();kick();
    for(let i=0;i<40;i++){P.pos.set(p0.x,0,p0.z-.75);P.yaw=0;g.logic(1/60);}
    res.push({rising,hit:P.kickHit,dmg:+(hp0-D.hp).toFixed(1),riseAfter:!!(D.ragdoll&&D.ragdoll.rise),knocked:+D.knocked.toFixed(2),moved:+D.ragdoll?.P.Hips.distanceTo(p0).toFixed(2)});
    let up=-1;for(let i=0;i<900;i++){g.logic(1/60);if(!D.ragdoll){up=i/60;break;}}res[res.length-1].upAfter=up;}
  // a prop
  const pr=g.PROPS&&g.PROPS.find(p=>!p.broken&&(p.kind==='barrel'||p.kind==='crate'||p.kind==='fence'));
  if(pr){const kinds=pr.kind;let n=0;const x=pr.seg?(pr.seg[0]+pr.seg[2])/2:pr.x,z=pr.seg?(pr.seg[1]+pr.seg[3])/2:pr.z;for(;n<12&&!pr.broken;n++){for(let i=0;i<40;i++){P.pos.set(x,0,z-.9-(pr.r||0));P.yaw=0;P.vel.set(0,0,0);P.stamina=100;if(i==0)kick();g.logic(1/60);}}res.push({prop:kinds,dyn:!!pr.dyn,kicks:n,broken:pr.broken,hp:pr.hp});}
  else res.push('no prop '+(g.PROPS?g.PROPS.length:'-'));
  return res;});
console.log(JSON.stringify(out,null,0));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
