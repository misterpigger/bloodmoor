# Bloodmoor

A physics sword-fighting game that runs in the browser: battle royale with a closing ring of fire, plus duels, an eight-fighter tournament and a co-op gauntlet in the arena.

**Play:** open `index.html` from any static web host (this repo is set up for GitHub Pages).

## Your fighter
Step through the fighter card's arrows to play one of seventeen characters, each with their own look, armour, signature weapon and fighting style (you start a battle royale, the gauntlet and the training yard with their weapon): Brother Anselm, Gerold the Ox, Ingvar Red-Axe, Sir Roland, Tobin Quickstep, Old Wat, Black Kasimir, Yusuf of Toledo, Emeric Horseless and Captain Cuthbert, plus seven odd ones with silly bodies and voices to match: Big Head Barnaby, Gutbert the Vast (a pot belly and a severed leg for a club), Mitts Magnus (giant fists), Nosy Neville, Tiny Torvald, Sir Puddington and Pip the Fool. The same characters turn up as opponents: about half the bots in a battle royale, the whole tournament field, your duel opponent, and a champion leading every gauntlet wave from wave 3.

Or make your own: a name, team colours, a build, garb, head covering, footwear, hair, beard, face marks, hair colour and skin tone. Friends see your fighter as you made it.

## Music
Each place has its own theme: the battle theme in the village, a darbuka-driven theme in the Arena, a slow bell-tolling one in the Pit and on Mutiny, a tense one for duels and tournament bouts, and a jig in the training yard and the Tavern. Winning or losing a match plays a short fanfare or dirge. M turns the music on and off.

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
