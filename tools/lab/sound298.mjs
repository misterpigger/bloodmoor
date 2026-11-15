// the mix by the numbers: run a match in real time with music on, tap everything that reaches the speakers, and report loudness,
// peaks, clipping and which layers sound. MODE/MAP, SECS
import {boot} from './harness.mjs';
const MODE=process.env.MODE||'br',MAP=process.env.MAP||'village',SECS=+(process.env.SECS||20);
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await page.evaluate(l=>{window.__LAY=l;},process.env.LAY||'all');await start(MODE,MAP,{pause:true});
await page.evaluate(async()=>{const g=window.__game;g.initAudio&&g.initAudio();const AC=g.AC;if(AC.state!=='running')await AC.resume();
  const sum=AC.createGain();if(window.__LAY!=='music')g.master.connect(sum);const an=AC.createAnalyser();an.fftSize=2048;sum.connect(an);window.__an=an;window.__sum=sum;window.__S={rms:[],peak:0,clip:0,n:0,cent:[]};});
await new Promise(r=>setTimeout(r,6000));   // let the recordings and music buffers load
await page.evaluate(()=>{const g=window.__game;if(g.MUS&&g.MUS.gain&&window.__LAY!=='sfx')g.MUS.gain.connect(window.__sum);});
const t0=Date.now();
while(Date.now()-t0<SECS*1000){await page.evaluate(()=>{const g=window.__game;g.logic(1/60);g.musicTick&&g.musicTick();const an=window.__an,S=window.__S;const b=new Float32Array(an.fftSize);an.getFloatTimeDomainData(b);let s=0,pk=0,cl=0;for(const v of b){s+=v*v;const a=Math.abs(v);if(a>pk)pk=a;if(a>=.999)cl++;}S.rms.push(Math.sqrt(s/b.length));S.peak=Math.max(S.peak,pk);S.clip+=cl;S.n+=b.length;
  const f=new Float32Array(an.frequencyBinCount);an.getFloatFrequencyData(f);let w=0,ws=0;for(let i=1;i<f.length;i++){const m=Math.pow(10,f[i]/20);w+=m;ws+=m*i*an.context.sampleRate/an.fftSize;}if(w>1e-6)S.cent.push(ws/w);});
  await new Promise(r=>setTimeout(r,16));}
const S=await page.evaluate(()=>{const S=window.__S,g=window.__game;const r=S.rms.slice().sort((a,b)=>a-b),q=p=>r[Math.floor(p*r.length)]||0,db=x=>(20*Math.log10(Math.max(1e-6,x))).toFixed(1);const c=S.cent.slice().sort((a,b)=>a-b);
  return `frames ${r.length}, rms dBFS p10 ${db(q(.1))} p50 ${db(q(.5))} p90 ${db(q(.9))} max ${db(r[r.length-1])}, peak ${db(S.peak)}, clipped samples ${S.clip} of ${S.n}, spectral centroid p50 ${(c[Math.floor(c.length/2)]||0).toFixed(0)} Hz, music ${g.MUS&&g.MUS.theme||'?'} on ${g.MUS&&g.MUS.on}`;});
console.log(MODE+'@'+MAP+' ['+(process.env.LAY||'all')+']: '+S);console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
