import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:640,HH:360,render:false,query:'?nohud'});
await start('yard','arena',{pause:true});
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,out=[];for(let k=0;k<200;k++)g.logic(1/60);
  const give=(f,id)=>{if(f.sword)f.dropSword(true);g.spawnWeaponLoot(g.WEAPONS[id],f.pos.x+.3,f.pos.z);g.pickUp(f,g.loot[g.loot.length-1]);};
  const run=(label,zoneAim,back)=>{
    const B=g.fighters.find(f=>f!==P&&f.alive&&!f.ragdoll);if(!B)return out.push([label,'no dummy']);
    give(P,'arming');if(!B.sword||B.sword.def.kind==='fist')give(B,'arming');
    P.pos.set(0,0,0);P.yaw=0;P.pitch=zoneAim;P.vel.set(0,0,0);B.pos.set(0,0,.8);B.yaw=Math.PI;B.vel.set(0,0,0);B.stamina=100;P.stamina=100;B.hp=100;
    for(let k=0;k<30;k++){P.clutchT=0;g.logic(1/60);}
    g.input.keys.KeyG=true;let gr=null,t0=null;for(let k=0;k<50;k++){P.clutchT=0;g.logic(1/60);if(P.offG.grab&&!gr){gr=P.offG.grab;t0=k;}}
    const G=P.offG;const desc=gr?gr.k+':'+(gr.bone?gr.bone.name.replace('mixamorig',''):gr.u!=null?'u'+gr.u.toFixed(2):gr.n):'none';
    let down=-1,dis=-1,hv=0;if(back)g.input.keys.KeyS=true;for(let k=0;k<150;k++){P.clutchT=0;g.logic(1/60);if(B.ragdoll&&down<0)down=k;if(!B.sword&&dis<0)dis=k;if(B.sword)hv=Math.max(hv,B.sword.Hv.length());}g.input.keys.KeyS=false;
    out.push([label,desc,'t'+t0,'down@'+down,'disarm@'+dis,'foeHand'+hv.toFixed(1),'still:'+(P.offG.grab?P.offG.grab.k:'-')]);
    g.input.keys.KeyG=false;for(let k=0;k<60;k++)g.logic(1/60);if(B.ragdoll){B.ragdoll&&0;}
  };
  window.__ogdbg=[];run('level, hold',0,false);run('level, back',0,true);window.__ogdbg=[];run('down, back',-.5,true);out.push(JSON.stringify(window.__ogdbg.filter(x=>x.length===3).filter((x,i)=>i%10==0)));window.__ogdbg=[];run('up, back',.35,true);out.push(JSON.stringify(window.__ogdbg.filter(x=>x.length===3).filter((x,i)=>i%8==0)));
  return out;});
for(const l of r)console.log(JSON.stringify(l));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
