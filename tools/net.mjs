// Two browsers, a host and a friend, joined through a stand-in for PeerJS that this script relays: does a friend's game hold together?
// Both run in real time. Once a second the friend's fighters, loot and fallen bodies are compared with the host's.
//   node net.mjs                                  every mode, 20 s each
//   RUNS='[["raid","arena"]]' SECS=60 node net.mjs
// Prints, per mode: how far the friend's picture is from the host's, whether the friend's W key moves their fighter on the host,
// how much the host sends (as JSON; PeerJS packs it differently, but in proportion), and any page errors on either side.
import {boot} from './harness.mjs';
const RUNS=JSON.parse(process.env.RUNS||'[["br","village"],["duel","colosseum"],["team","tavern"],["team","ship"],["team","road"],["team","breach"],["raid","arena"],["gauntlet","pit"]]'),SECS=+(process.env.SECS||20);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const A=await boot({W:320,HH:200,render:false}),B=await boot({W:320,HH:200,render:false});
const FAKE=()=>{class Em{constructor(){this.h={};}on(e,f){(this.h[e]??=[]).push(f);return this;}emit(e,...a){for(const f of (this.h[e]||[]).slice())f(...a);}}
  const peers={};window.__peerRecv=m=>{const p=peers[m.to];if(p)p.recv(m);};window.__netBytes=0;
  class Conn extends Em{constructor(p,peer,cid){super();this.p=p;this.peer=peer;this.connectionId=cid;this.open=false;}
    send(d){const s=JSON.stringify(d);window.__netBytes+=s.length;window.__peerSend({k:'data',to:this.peer,from:this.p.id,cid:this.connectionId,d:s});}close(){this.open=false;}}
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
await A.page.waitForFunction(()=>window.__game.NET.conns.length&&window.__game.NET.conns[0].hello,null,{timeout:20000});
console.log('joined room',code);
const probe=()=>{const g=window.__game;let nan=0;const fs=g.fighters.map(f=>{if(!isFinite(f.pos.x+f.pos.y+f.pos.z))nan++;const H=f.ragdoll&&f.ragdoll.P.Head;
    return {n:f.name,x:f.pos.x,z:f.pos.z,a:f.alive?1:0,rh:H?[H.x,H.y,H.z]:null};});
  return {state:g.state,n:g.fighters.length,nan,fs,me:g.player?g.player.name:null,hud:(g.MODEHUD||[]).join(' | '),err:(document.getElementById('errbox')||{}).textContent||'',bytes:window.__netBytes,
    loot:g.loot.map(it=>it.sword?[it.def.id,it.sword.H.x,it.sword.H.z]:it.obj?[it.def.id,it.obj.position.x,it.obj.position.z]:[it.def.id,0,0])};};
let bad=0;
for(const [mode,map] of RUNS){
  await A.page.evaluate(async([mode,map])=>{const g=window.__game,md=document.querySelector(`.mode[data-mode="${mode}"]`),mb=document.querySelector(`.map[data-map=${map}]`);if(md)md.click();await new Promise(r=>setTimeout(r,150));if(mb){mb.click();await new Promise(r=>setTimeout(r,400));}g.startGame();},[mode,map]);
  let worst=0,sum=0,cnt=0,nan=0,moved=0,p0=null,lw=0,rw=0,last=null;const b0=await A.page.evaluate(()=>window.__netBytes);
  for(let t=1;t<=SECS;t++){await sleep(1000);
    if(t===5)await B.page.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',key:'w'})));
    if(t===9)await B.page.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW',key:'w'})));
    const [a,b]=await Promise.all([A.page.evaluate(probe),B.page.evaluate(probe)]);nan+=a.nan+b.nan;last=[a,b];
    const am=new Map(a.fs.map(f=>[f.n,f]));for(const f of b.fs){const h=am.get(f.n);if(!h)continue;if(h.a&&f.a&&t>3){const d=Math.hypot(h.x-f.x,h.z-f.z);worst=Math.max(worst,d);sum+=d;cnt++;}
      if(h.rh&&f.rh&&!h.a)rw=Math.max(rw,Math.hypot(h.rh[0]-f.rh[0],h.rh[1]-f.rh[1],h.rh[2]-f.rh[2]));}
    const me=a.fs.find(f=>f.n===b.me);if(me){if(t===5)p0=me;if(t===9&&p0)moved=Math.hypot(me.x-p0.x,me.z-p0.z);}
    await A.page.evaluate(()=>{const g=window.__game;for(const f of g.fighters)if(f.alive&&(f.isPlayer||f.remote))f.hp=Math.max(f.hp,70);});}
  const [a,b]=last;{const used=new Set();for(const l of b.loot){let best=9,bi=-1;a.loot.forEach((h,i)=>{if(used.has(i)||h[0]!==l[0])return;const d=Math.hypot(h[1]-l[1],h[2]-l[2]);if(d<best){best=d;bi=i;}});if(bi>=0)used.add(bi);lw=Math.max(lw,best);}}
  const kb=((await A.page.evaluate(()=>window.__netBytes))-b0)/SECS/1024;
  const ok=!nan&&!a.err&&!b.err&&b.state!=='attract'&&a.n===b.n&&a.loot.length===b.loot.length;if(!ok)bad++;
  console.log(`${ok?'ok  ':'BAD '}${mode}@${map}: fighters host ${a.n} friend ${b.n} · apart mean ${(sum/Math.max(1,cnt)).toFixed(2)} m worst ${worst.toFixed(2)} · friend's W walked ${moved.toFixed(1)} m · loot ${a.loot.length}/${b.loot.length} (worst ${lw.toFixed(2)} m) · the dead's heads within ${rw.toFixed(2)} m · NaN ${nan} · host sends ${kb.toFixed(0)} kB/s · friend's HUD: ${b.hud}${a.err?' · HOST ERROR '+a.err:''}${b.err?' · FRIEND ERROR '+b.err:''}`);
}
const real=L=>L.filter(l=>!l.includes('GPU stall'));const la=real(A.logs),lb=real(B.logs);
console.log('host:',la.slice(0,6).join('\n')||'no page errors');console.log('friend:',lb.slice(0,6).join('\n')||'no page errors');
await A.browser.close();await B.browser.close();process.exit(bad||la.length||lb.length?1:0);
