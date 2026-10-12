// Plays a minute of a full match with bots plus one round of each arena mode, and prints any page errors.
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:process.env.Q||''});
const r=await page.evaluate(()=>{const g=window.__game;g.startGame();g.player.hp=1e9;window.__pause=true;for(let i=0;i<3600;i++)g.logic(1/60);return `battle royale: ${g.fighters.filter(f=>f.alive).length}/${g.fighters.length} alive after 60s, physics engine ${g.physOn?'on':'off'}`;});
console.log(r);
for(const m of ['duel','tourney','gauntlet'])console.log(await page.evaluate(m=>{const g=window.__game;document.querySelector(`.mode[data-mode="${m}"]`).click();g.startGame();window.__pause=true;for(let i=0;i<600;i++)g.logic(1/60);return m+': '+g.MODEHUD.join(' | ');},m));
console.log(logs.length?'PAGE ERRORS:\n'+logs.join('\n'):'no page errors');
await browser.close();
