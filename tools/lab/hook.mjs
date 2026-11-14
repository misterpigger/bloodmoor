// hooking: the player reaches a hooked head past a standing dummy's neck (or arm, or leg) and hauls back. Does it catch, what happens to him
import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena',{pause:true});
const out=await page.evaluate(async(WEPS)=>{const g=window.__game,log=[];for(let k=0;k<240;k++)g.logic(1/60);const P=g.player;g.input.locked=false;
  for(const wid of WEPS)for(const [name,cy,dist] of [['neck',.3,.95],['neck',.38,1.1],['neck',.3,1.25],['arm',.05,1.0],['leg',-.8,1.0],['leg',-.9,1.2]])for(const cx of [-1,1]){
    let D=g.fighters.find(f=>f.dummy&&f.alive);if(!D||D.ragdoll){for(let k=0;k<400;k++){g.logic(1/60);D=g.fighters.find(f=>f.dummy&&f.alive&&!f.ragdoll);if(D)break;}}if(!D){log.push('no dummy');continue;}
    if(!P.sword||P.sword.def.id!==wid){g.spawnWeaponLoot(g.WEAPONS[wid],P.pos.x+.4,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
    D.bal.set(0,0,0);D.balV.set(0,0,0);D.hp=100;P.hp=100;P.stamina=100;P.pos.set(D.pos.x,0,D.pos.z-dist);P.yaw=0;P.vel.set(0,0,0);D.yaw=Math.PI;for(let k=0;k<30;k++)g.logic(1/60);
    const aim=(x,y)=>{g.input.mx=innerWidth*(.5+x*.5);g.input.my=innerHeight*(.5-y*.5);};
    // reach out past him, then draw back and step away
    let caught=-1,zone='',held=0,maxLean=0,down=false,dmg=D.hp,best={d:9};const T=g.THREE,v1=new T.Vector3(),v2=new T.Vector3(),v3=new T.Vector3();
    for(let q=0;q<200;q++){P.stamina=100;D.hp=100;
      if(q<25){aim(.85*Math.sign(cx),cy);g.input.lmb=false;P.ctrl.z=.46;}            // wind up to one side
      else if(q<55){g.input.lmb=true;aim(.85*Math.sign(cx)-(q-25)/30*1.7*Math.sign(cx),cy);g.input.keys.KeyW=q<40;}   // sweep across with the button held, stepping in
      else if(q<70){g.input.lmb=false;g.input.keys.KeyW=false;}                       // it has gone past him
      else{aim(-.3*Math.sign(cx),cy-.1);P.ctrl.z=Math.max(.2,P.ctrl.z-.03);g.input.keys.KeyS=true;}   // haul back
      g.logic(1/60);{const sw=P.sword,hk=sw.def.hook;for(const t of [hk[0],(hk[0]+hk[1])/2,hk[1]]){sw.pointAt(t,v1);for(const c of D.caps){if(!c.on||!(name==='neck'?c.zone==='neck':name==='arm'?c.zone[0]==='a':c.zone[0]==='l'))continue;v2.subVectors(c.b,c.a);const u=Math.max(0,Math.min(1,v3.subVectors(v1,c.a).dot(v2)/v2.lengthSq()));v3.copy(c.a).addScaledVector(v2,u);const dd=v1.distanceTo(v3)-c.r;if(dd<best.d){const hx=v3.x-sw.H.x,hz=v3.z-sw.H.z,hl=Math.hypot(hx,hz);best={d:+dd.toFixed(2),q,behind:+(((v1.x-v3.x)*hx+(v1.z-v3.z)*hz)/hl).toFixed(2),back:+(-(sw.Hv.z)).toFixed(1),tipY:+v1.y.toFixed(2),cz:+P.ctrl.z.toFixed(2),zone:c.zone};}}}}const K=P.sword&&P.sword.hook;if(K){if(caught<0){caught=q;zone=K.zone;window.__d0=[D.pos.x,D.pos.z];window.__drag=0;}held++;window.__drag=+Math.hypot(D.pos.x-window.__d0[0],D.pos.z-window.__d0[1]).toFixed(2);}maxLean=Math.max(maxLean,Math.hypot(D.bal.x,D.bal.z));if(D.ragdoll)down=true;}
    g.input.keys.KeyS=false;
    log.push(`${wid} ${name} cx${cx}: caught ${caught<0?'no':'f'+caught+' '+zone} held ${held}f lean ${maxLean.toFixed(2)} down ${down} drag ${caught<0?0:window.__drag} best ${JSON.stringify(best)}`);}
  return log;},(process.env.WEPS||'axe,warhammer,poleaxe').split(','));
for(const l of out)console.log(l);
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
