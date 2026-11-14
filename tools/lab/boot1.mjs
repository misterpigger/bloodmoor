import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
console.log(logs.slice(0,8).join('\n')||'no errors', await page.evaluate(()=>!!window.__game));await browser.close();process.exit(0);
