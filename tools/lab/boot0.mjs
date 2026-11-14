import {boot} from './harness.mjs';
const t0=Date.now();const {page,browser,logs}=await boot({render:false,query:'?nohud'});
console.log('booted',(Date.now()-t0)/1000,'s');console.log(logs.slice(0,5).join('\n'));await browser.close();process.exit(0);
