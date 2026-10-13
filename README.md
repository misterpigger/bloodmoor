# Bloodmoor

A physics sword-fighting game that runs in the browser: battle royale with a closing ring of fire, plus duels, an eight-fighter tournament and a co-op gauntlet in the arena.

**Play:** open `index.html` from any static web host (this repo is set up for GitHub Pages).

## Your fighter
Pick a name, team colours, and a look: bare-chested, peasant or ranger garb, hair, beard, hair colour and skin tone. Friends see your fighter as you made it.

## Modes
- **Battle royale**: everyone for themselves in the village or the arena; loot weapons and armor, stay inside the fire.
- **Duel**: 1v1, best of three, both fighters get the same fresh kit each round.
- **Tournament**: eight fighters, single elimination. Bouts between two bots are settled off stage.
- **Gauntlet**: survive waves of arena fighters together; the fallen return between waves.
- **Training yard**: three dummies (bare, mail, plate). Keys 1–7 switch weapons, G makes the dummies stand still, hold a guard or spar. A readout lists every blow: type, body part, damage, speed and what the armour stopped.

## Multiplayer
One player clicks **Host for friends** and shares the 5-letter room code; friends type it under **Join**. The host's browser runs the match and friends' browsers connect to it directly (WebRTC via the free PeerJS service). Empty slots are filled by bots.

Note: browser-to-browser connections let players in the same room see each other's IP address, as with most peer-to-peer games. Only share room codes with people you know.

## Controls
Mouse moves your sword hand (hold LMB to commit to a swing, wheel to reach in and out and thrust), WASD to move, Shift sprint, C crouch or slide, Space jump, F kick, hold Q while swinging and release to throw, E to pick up, V to switch camera. Unarmed: hold LMB or RMB to take control of that fist.

## Credits
See [CREDITS.md](CREDITS.md).
