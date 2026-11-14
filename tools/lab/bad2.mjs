import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud'});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;window.__keepBad=true;
  for(const [d,sd] of [[5,660],[1,918]]){const C=g.cryptBuild(d,sd);out.push('d'+d+' seed '+sd+' start '+C.start.x.toFixed(1)+','+C.start.z.toFixed(1));for(const w of C.badW||[])out.push('  '+w.map(v=>typeof v==='number'?+v.toFixed(1):v).join(' '));
   // the bad way nearest the start
   const w=(C.badW||[]).slice().sort((a,b)=>Math.hypot(a[0]-C.start.x,a[1]-C.start.z)-Math.hypot(b[0]-C.start.x,b[1]-C.start.z))[0];out.push('lows '+JSON.stringify(C.lows.map(q=>[q.ax,+q.m.toFixed(1),+q.a0.toFixed(1),+q.a1.toFixed(1)]))+' traps '+C.traps.length+' swings '+JSON.stringify(C.swings.length)+' spikes '+C.spikes.length+' blades '+(C.blades||[]).length+' gaps '+JSON.stringify(C.gaps.map(q=>Object.values(q).filter(v=>typeof v==='number').map(v=>+v.toFixed(1)))));{const [mx,mz]=d===5?[-23.3,11.2]:[-10,7.8];let o='';for(let j=-14;j<=14;j++){for(let i=-22;i<=22;i++){const p=new g.THREE.Vector3(mx+i*.1,0,mz+j*.1),x=p.x,z=p.z;g.collide(p,.03,true,1.1);o+=Math.abs(p.x-x)+Math.abs(p.z-z)>1e-6?'#':'.';}o+='\n';}out.push(o);}out.push(JSON.stringify(C.plan.cells.map(c=>[c.type,c.kind,+c.cx.toFixed(1),+c.cz.toFixed(1),+c.hx.toFixed(1),+c.hz.toFixed(1)])));}
  return out.join('\n');});
console.log(r);await browser.close();process.exit(0);
