// two browsers, host and friend, joined through a fake Peer relayed by this script: does a friend's game hold together in every mode?
import {boot} from './harness.mjs';
const RUNS=JSON.parse(process.env.RUNS||'[["br","village"],["duel","colosseum"],["team","tavern"],["team","ship"],["team","road"],["team","breach"],["raid","arena"],["gauntlet","pit"]]'),SECS=+(process.env.SECS||25);
const A=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')}),B=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const FAKE=()=>{class Em{constructor(){this.h={};}on(e,f){(this.h[e]??=[]).push(f);return this;}emit(e,...a){for(const f of (this.h[e]||[]).slice())f(...a);}}
  const peers={};window.__peerRecv=m=>{const p=peers[m.to];if(p)p.recv(m);};window.__netBytes=0;
  class Conn extends Em{constructor(p,peer,cid){super();this.p=p;this.peer=peer;this.connectionId=cid;this.open=false;}
    send(d){const s=JSON.stringify(d);window.__netBytes+=s.length;if(d&&d.t==='s'){const K=window.__netK||(window.__netK={});for(const k in d){K[k]=(K[k]||0)+JSON.stringify(d[k]).length;}if(d.f){const F=window.__netF||(window.__netF={});for(const o of d.f)for(const k in o)F[k]=(F[k]||0)+JSON.stringify(o[k]).length+k.length+3;}}window.__peerSend({k:'data',to:this.peer,from:this.p.id,cid:this.connectionId,d:s});}close(){this.open=false;}}
  class Peer extends Em{constructor(id){super();this.id=id||'c'+Math.random().toString(36).slice(2);this.conns={};peers[this.id]=this;setTimeout(()=>this.emit('open',this.id),5);}
    recv(m){if(m.k==='connect'){const c=new Conn(this,m.from,m.cid);this.conns[m.cid]=c;this.emit('connection',c);window.__peerSend({k:'accept',to:m.from,from:this.id,cid:m.cid});setTimeout(()=>{c.open=true;c.emit('open');},0);}
      else if(m.k==='accept'){const c=this.conns[m.cid];if(c){c.open=true;c.emit('open');}}
      else if(m.k==='data'){const c=this.conns[m.cid];if(c)c.emit('data',JSON.parse(m.d));}}
    connect(id){const cid=Math.random().toString(36).slice(2);const c=new Conn(this,id,cid);this.conns[cid]=c;window.__peerSend({k:'connect',to:id,from:this.id,cid});return c;}destroy(){delete peers[this.id];}}
  window.peerjs={Peer};};
for(const [X,Y] of [[A,B],[B,A]]){await X.page.exposeFunction('__peerSend',m=>{Y.page.evaluate(m=>window.__peerRecv(m),m).catch(()=>{});});await X.page.evaluate(FAKE);}
await A.page.evaluate(()=>document.getElementById('hostBtn').click());
await A.page.waitForFunction(()=>window.__game.NET.mode==='host'&&window.__game.NET.code,null,{timeout:20000});
const code=await A.page.evaluate(()=>window.__game.NET.code);
await B.page.evaluate(c=>{document.getElementById('joinCode').value=c;document.getElementById('joinBtn').click();},code);
for(let i=0;i<40;i++){await A.fr(1);await B.fr(1);await new Promise(r=>setTimeout(r,50));const ok=await A.page.evaluate(()=>window.__game.NET.conns.length&&window.__game.NET.conns[0].hello);if(ok)break;}
console.log('joined',code,await A.page.evaluate(()=>window.__game.NET.conns.map(c=>c.name+':'+c.hello)));
const probe=()=>{const g=window.__game;let nan=0;const fs=g.fighters.map(f=>{if(!isFinite(f.pos.x+f.pos.y+f.pos.z))nan++;const h=f.B&&f.B.Hips;if(h&&!isFinite(h.matrixWorld.elements[12]))nan++;return {n:f.name,x:+f.pos.x.toFixed(2),z:+f.pos.z.toFixed(2),a:f.alive?1:0,w:f.sword?f.sword.def.id:f.fists?'fists':null,rg:f.ragdoll?1:0,rh:f.ragdoll&&f.ragdoll.P.Head?[+f.ragdoll.P.Head.x.toFixed(2),+f.ragdoll.P.Head.y.toFixed(2),+f.ragdoll.P.Head.z.toFixed(2)]:null};});
  return {state:g.state,mode:g.RUN&&g.RUN.mode,n:g.fighters.length,nan,fs,me:g.player?g.player.name:null,meA:g.player?g.player.alive:null,hud:(g.MODEHUD||[]).join(' | '),ghost:g.loot.filter(it=>it.corpse&&!g.fighters.includes(it.corpse)).length,lpos:g.loot.map(it=>it.sword?[it.def.id,+it.sword.H.x.toFixed(2),+it.sword.H.z.toFixed(2)]:it.obj?[it.def.id,+it.obj.position.x.toFixed(2),+it.obj.position.z.toFixed(2)]:[it.def.id,0,0]),err:(document.getElementById('errbox')||{}).textContent||'',bytes:window.__netBytes,loot:g.loot.length};};
for(const [mode,map] of RUNS){
  await A.start(mode,map);await A.fr(2);await B.fr(2);
  let limbo=[],wn='',worst=0,sum=0,cnt=0,nan=0,bn0=await A.page.evaluate(()=>window.__netBytes),moved=0,p0=null,miss=0,last=null;
  for(let t=0;t<SECS*30;t++){
    if(t===30*5)await B.page.evaluate(()=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',key:'w'}));});
    if(t===30*9)await B.page.evaluate(()=>{window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW',key:'w'}));});
    if(t===30*4&&process.env.KILL)await A.page.evaluate(n=>{const g=window.__game;let k=0;for(const f of g.fighters){if(k>=n)break;if(f.alive&&!f.isPlayer&&!f.remote){f.hp=0;f.die(null,'test',null);k++;}}},+process.env.KILL);
    await A.fr(2);await B.fr(2);
    if(process.env.LIMBO&&t<30*18){const n=await B.page.evaluate(()=>window.__game.fighters.filter(f=>f.pos.z<-400).map(f=>f.name+(f.alive?'':'(dead)')).join(','));if(n)limbo.push(t+':'+n);}
    if(t%30===29){await new Promise(r=>setTimeout(r,30));const [a,b]=await Promise.all([A.page.evaluate(probe),B.page.evaluate(probe)]);nan+=a.nan+b.nan;last=[a,b];
      const am=new Map(a.fs.map(f=>[f.n,f]));for(const f of b.fs){const h=am.get(f.n);if(!h){miss++;continue;}const d=Math.hypot(h.x-f.x,h.z-f.z);if(h.a&&f.a){if(d>worst){worst=d;wn=f.n+' H('+h.x+','+h.z+') F('+f.x+','+f.z+') t'+(t/30|0);}sum+=d;cnt++;}if(h.a!==f.a&&t>90)miss+=.01;}
      const me=a.fs.find(f=>f.n===b.me);if(me){if(t===30*5-1)p0=me;if(t===30*9-1&&p0)moved=Math.hypot(me.x-p0.x,me.z-p0.z);}
      await A.page.evaluate(()=>{const g=window.__game;for(const f of g.fighters)if(f.alive&&(f.isPlayer||f.remote))f.hp=Math.max(f.hp,70);});}
  }
  if(limbo.length)console.log('LIMBO',limbo.join(' '));
  const [a,b]=last;let rw=0,rn=0;{const am=new Map(a.fs.map(f=>[f.n,f]));for(const f of b.fs){const h=am.get(f.n);if(h&&h.rh&&f.rh){rn++;rw=Math.max(rw,Math.hypot(h.rh[0]-f.rh[0],h.rh[1]-f.rh[1],h.rh[2]-f.rh[2]));}else if(h&&(!!h.rh)!==(!!f.rh))rw=99;}}let ld=0,lw=0;{const used=new Set();for(const l of b.lpos){let best=9,bi=-1;a.lpos.forEach((h,i)=>{if(used.has(i)||h[0]!==l[0])return;const d=Math.hypot(h[1]-l[1],h[2]-l[2]);if(d<best){best=d;bi=i;}});if(bi>=0)used.add(bi);lw=Math.max(lw,best);}ld=a.lpos.length-b.lpos.length;}const bn=await A.page.evaluate(()=>window.__netBytes);
  console.log(`${mode}@${map}: host ${a.state}/${a.mode} n ${a.n}, friend ${b.state} n ${b.n} me ${b.me} alive ${b.meA} | pos diff mean ${(sum/Math.max(1,cnt)).toFixed(2)} m, worst ${worst.toFixed(2)} [${wn}] | friend walked ${moved.toFixed(1)} m on W | nan ${nan}, missing ${miss.toFixed(1)} | loot H ${a.loot} (ghost ${a.ghost}) F ${b.loot}, worst loot offset ${lw.toFixed(2)} m | bodies down ${rn}, worst head offset ${rw.toFixed(2)} m | host sends ${((bn-bn0)/SECS/1024).toFixed(0)} kB/s | hud H[${a.hud}] F[${b.hud}]${a.err?' HOSTERR '+a.err:''}${b.err?' FRIENDERR '+b.err:''}`);
}
console.log('BREAKDOWN',JSON.stringify(await A.page.evaluate(()=>{const r=o=>Object.fromEntries(Object.entries(o||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,Math.round(v/1024)]));return {top:r(window.__netK),f:r(window.__netF)};})));console.log('HOST',A.logs.slice(0,6).join('\n')||'no errors');console.log('FRIEND',B.logs.slice(0,6).join('\n')||'no errors');
await A.browser.close();await B.browser.close();process.exit(0);
