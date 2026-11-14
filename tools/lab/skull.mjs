import {boot} from './harness.mjs';
const OUT='../out/q218',TAG=process.env.TAG||'k';
const {browser,page,logs,fr,tick,shot}=await boot({W:700,HH:700,query:'?nohud'});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<60;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2500));
await page.evaluate(()=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player;const c=C.plan.cells[0];P.pos.set(c.cx,0,c.cz+4);P.model.visible=false;for(const f of g.fighters)if(f!==P)f.model.visible=false;
 const S=g.skullGeo(),grp=new T.Group();grp.add(new T.Mesh(S.b,g.MATS?g.MATS.bone:new T.MeshStandardMaterial({color:0xb0a080})));grp.add(new T.Mesh(S.d,new T.MeshBasicMaterial({color:0x080605})));grp.scale.setScalar(1);grp.position.set(c.cx,1.3,c.cz);g.scene.add(grp);window.__sk=grp;
 const L=new T.PointLight(0xffe0c0,3,6,1.2);L.position.set(c.cx+.5,1.7,c.cz+.8);g.scene.add(L);window.__c=c;});
const V={front:[0,.1,.42],q:[.3,.14,.3],side:[.42,.1,0],low:[.15,0,.35]};
for(const [k,v] of Object.entries(V)){await page.evaluate(v=>{const g=window.__game,T=g.THREE,c=window.__c;window.__dbgCam={p:new T.Vector3(c.cx+v[0],1.3+v[1],c.cz+v[2]),t:new T.Vector3(c.cx,1.3+.1,c.cz+.02)};},v);await tick(2);await fr(2);await shot(`${OUT}/${TAG}_${k}.jpg`,88);}
console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
