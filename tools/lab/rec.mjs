// records what a match sounds like: runs the game's own frame() in real time (no drawing) and records everything that reaches
// the speakers (effects + music) to a file. env MODE, MAP, SECS, OUT (file, .webm), MUSIC=0 to leave music out, IDLE=1 keeps the
// player still (ambience only), Q extra query
import {boot} from './harness.mjs';import fs from 'fs';
const MODE=process.env.MODE||'br',MAP=process.env.MAP||'village',SECS=+(process.env.SECS||20),OUT=process.env.OUT||'rec.webm';
const {browser,page,logs,fr,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start(MODE,MAP,{pause:false});
await page.evaluate(async(mus)=>{const g=window.__game;g.initAudio&&g.initAudio();const AC=g.AC;if(AC.state!=='running')await AC.resume();
  const dst=AC.createMediaStreamDestination();g.master.connect(dst);window.__dst=dst;window.__mus=mus;
  const rec=new MediaRecorder(dst.stream,{mimeType:'audio/webm;codecs=opus',audioBitsPerSecond:128000});const ch=[];rec.ondataavailable=e=>ch.push(e.data);window.__rec=rec;window.__ch=ch;},process.env.MUSIC!=='0');
// let the sound files and music load while the countdown runs
for(let i=0;i<240;i++){await fr(1,1/60);await new Promise(r=>setTimeout(r,8));}
await page.evaluate(()=>{const g=window.__game;if(window.__mus&&g.MUS&&g.MUS.gain)try{g.MUS.gain.connect(window.__dst);}catch(e){}window.__rec.start();
  });
const idle=!!process.env.IDLE;let last=Date.now();const t0=last;
while(Date.now()-t0<SECS*1000){const now=Date.now(),dt=Math.min(.05,(now-last)/1000)||1/60;last=now;
  await page.evaluate(([dt,idle])=>{const g=window.__game,P=g.player;if(idle&&P){P.hp=100;}window.__now=(window.__now||performance.now())+dt*1000;window.__inManual=1;try{window.__frameFn(window.__now);}finally{window.__inManual=0;}},[dt,idle]);
  await new Promise(r=>setTimeout(r,4));}
const b64=await page.evaluate(()=>new Promise(res=>{const rec=window.__rec;rec.onstop=async()=>{const bl=new Blob(window.__ch,{type:'audio/webm'});const buf=new Uint8Array(await bl.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=32768)s+=String.fromCharCode.apply(null,buf.subarray(i,i+32768));res(btoa(s));};rec.stop();}));
fs.writeFileSync(OUT,Buffer.from(b64,'base64'));console.log('wrote',OUT,(b64.length*.75/1024).toFixed(0)+' kB');
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
