import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await page.evaluate(()=>{const b=document.querySelector(`.tn[data-tn="4"]`);if(b)b.click();});
await start('team','arena',{pause:true});
const out=await page.evaluate(async()=>{const g=window.__game,T=g.THREE;for(let i=0;i<300&&!g.PRW;i++){await new Promise(r=>setTimeout(r,30));g.logic(1/60);}
  let n=0,both=0,onlyOld=0,onlyNew=0,maxd=0,sumd=0,tOld=0,tNew=0;const rc=new T.Raycaster(),o=new T.Vector3(),d=new T.Vector3(),pt=new T.Vector3(),big=[];
  for(let round=0;round<12;round++){for(let k=0;k<120;k++)g.logic(1/60);
    for(const B of g.fighters){if(!B.skins||!B.root.parent)continue;B.model.updateMatrixWorld(true);const RS=B.skins.filter(m=>/Body/.test(m.name)).slice(0,1);
      for(let ci=0;ci<B.caps.length;ci++){const c=B.caps[ci];if(!c.on)continue;for(let q=0;q<3;q++){
        const t=Math.random(),ax=new T.Vector3().subVectors(c.b,c.a),P=c.a.clone().addScaledVector(ax,t);let nn=new T.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5);nn.addScaledVector(ax,-nn.dot(ax)/ax.lengthSq()).normalize();
        o.copy(P).addScaledVector(nn,c.r+.3);d.copy(nn).negate();n++;
        let t0=performance.now();for(const m of RS)m.boundingSphere=null;rc.set(o,d);rc.far=c.r+.35;const h=rc.intersectObjects(RS,false)[0];tOld+=performance.now()-t0;
        t0=performance.now();let hn=null,bd=1e9;for(const m of RS)if(g.skinRay(m,o,d,c.r+.35,g.capBones(B,c),pt)){const dd=pt.distanceToSquared(o);if(dd<bd){bd=dd;hn=pt.clone();}}tNew+=performance.now()-t0;
        if(h&&hn){both++;const e=h.point.distanceTo(hn);sumd+=e;if(e>maxd)maxd=e;if(e>.01)big.push([B.name,c.ba,+e.toFixed(3),hn.distanceTo(o)>h.point.distanceTo(o)?'occl':'NEAR']);}else if(h)onlyOld++,big.push([B.name,c.ba,'old only']);else if(hn)onlyNew++;}}}}
  return {n,both,onlyOld,onlyNew,maxd,mean:sumd/Math.max(1,both),msOld:tOld/n,msNew:tNew/n,big:big.slice(0,12),nbig:big.length};});
console.log(JSON.stringify(out));console.log(logs.slice(0,5).join('\n'));await browser.close();process.exit(0);
