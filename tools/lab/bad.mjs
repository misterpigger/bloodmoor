import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud'});
const r=await page.evaluate(async(S0)=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;window.__keepBad=true;
  let bad=0,n=0;const t0=performance.now();for(let sd=S0;sd<S0+11;sd++)for(const d of [1,2,3,5]){const C=g.cryptBuild(d,sd*131+d);n++;if(C.bad){bad++;out.push("bad d"+d+" seed "+(sd*131+d)+" x"+C.bad+" "+C.badW.slice(0,3).map(w=>w.map(v=>typeof v==="number"?+v.toFixed(1):v).join(" ")).join(" | "));}}
  out.push(bad+' of '+n+' floors shut off; '+((performance.now()-t0)/n).toFixed(0)+' ms a floor');return out.join('\n');},+(process.env.S0||15));
console.log(r);console.log(logs.filter(l=>!/shut off/.test(l)).slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
