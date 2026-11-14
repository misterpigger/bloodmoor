import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud&cdepth=2'+(process.env.Q||'')});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;for(let k=0;k<120;k++)g.logic(1/60);
  const P=g.player,F=g.fighters,I=g.input;for(const f of F)if(f!==P)f.pos.set(900,0,900);
  const press=c=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));};
  const ds=g.DYN.filter(d=>!d.wep&&!d.gone&&d.body&&d.m<=14&&!d.heavy&&!d.lad);out.push('candidates '+ds.length+' e.g. '+ds.slice(0,6).map(d=>d.m.toFixed(1)).join(','));
  const d=ds.find(d=>d.m>1)||ds[0];const px=P.pos.x,pz=P.pos.z;d.body.setTranslation({x:px,y:.15,z:pz+.3},true);d.body.setLinvel({x:0,y:0,z:0},true);d.obj.position.set(px,.15,pz+.3);
  P.grabMode=false;for(let k=0;k<30;k++)g.logic(1/60);press('KeyG');
  let t=0;const gr=()=>P.fists&&P.fists.R&&P.fists.R.grab;for(;t<240&&!gr();t++){P.pos.set(px,0,pz);P.yaw=0;if(t>10&&t<60)g.aimMove(0,14);I.lmb=true;g.logic(1/60);}
  out.push('grabbed '+!!gr()+' after '+t+' kind '+(gr()&&gr().k)+' mass '+d.m.toFixed(1));
  I.lmb=false;let mx=0,sum=0,n=0;const t0=d.obj.position.clone();
  for(let k=0;k<240;k++){P.yaw+=.01;if(k>60)I.keys.KeyW=true;g.logic(1/60);const a=P.fists.R;if(!a.grab)break;g.scene.updateMatrixWorld(true);const gp=a.grab.loc.clone().applyMatrix4(d.obj.matrixWorld);const e=gp.distanceTo(a.pos);mx=Math.max(mx,e);sum+=e;n++;}
  I.keys.KeyW=false;out.push('held '+n+' frames, hand-to-grip mean '+(sum/Math.max(n,1)*100).toFixed(1)+' cm max '+(mx*100).toFixed(1)+' cm, moved '+d.obj.position.distanceTo(t0).toFixed(2)+' m, y '+d.obj.position.y.toFixed(2));
  press('KeyG');for(let k=0;k<120;k++)g.logic(1/60);out.push('after let go: grab '+!!gr()+' y '+d.obj.position.y.toFixed(2)+' body y '+d.body.translation().y.toFixed(2)+' kinematic '+d.body.isKinematic()+' sleep '+d.body.isSleeping()+' ground '+g.groundY(d.obj.position.x,d.obj.position.z,2).toFixed(2));
  return out.join('\n');});
console.log(r);console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
