# Bloodmoor: hand-off plan (written after Build 246)

For the next Claude picking this up. Read `CLAUDE.md` first (house rules at "## House rules", then the notes for Builds 241–246, which are the current state). This file is the work list, in the order the player wants it. Delete items as they ship; keep the file until it is empty.

## Who you are working for and how
- The player directs and plays; he doesn't code. His benchmark is Half Sword. He judges by playing and by pictures, and he is blunt: "done but not done well" is his usual complaint. Do fewer things per build and finish them. Don't do side work he didn't ask for.
- Every build: branch from `origin/main`, next `const BUILD`, a note in `CLAUDE.md`, measure or render what you changed, run the smoke test (12 lines of `nan 0, mxBad 0` and `no page errors`), privacy grep, commit as `misterpigger <misterpigger@users.noreply.github.com>`, fast-forward merge to `main`, push. Never force-push. Send him pictures of anything visual.
- Before every commit, run the privacy check the player set up (search the files you're committing for his email, name, town and any local machine paths; it must find nothing). The exact pattern is not written in this public repo on purpose: ask him for it, or build it from what he tells you. Never write those words into any committed file, including inside a search pattern.
- Don't bring back anything on the rejected list without asking: motes, footprints, scanned rocks, haycocks, tabards in team modes, fight commentary, physical gait, jointed body by default, parchments, the hole-drop descent, a dark fade between floors, painted crypt stone canvases, proud wall blocks, talking to people with E, starting with a candle, the camera fill light, the scanned china jug, and the six Build 243 weapons (see item 6). Don't change the camera or aim without asking.
- Mechanics that trip people up: a `//` comment added inside one of `index.html`'s long lines comments out the rest of the line (use `/* */`); never toggle `visible` on lights; one headless browser job at a time; renders with many heavy meshes run the browser out of memory; foreground commands time out at about two minutes, so run the smoke test in the background.

## Test tools
`tools/lab/` holds the scratch scripts used through Build 246 (copied as they were; not tidied). They import `./harness.mjs`, which serves the repo two levels up (`BM_ROOT=` overrides, `INDEX=` picks another html). They need `node_modules` with `playwright` and `three` reachable from `tools/` (see `tools/package.json`); the copy was **not** re-run from its new place, so expect to fix a path or two first.
- `smoke.mjs` every mode. `desc236.mjs` five crypt floors. `bad.mjs` (`S0=` seed start) counts crypt floors with a doorway shut off. `pitup.mjs` falls into the dug-out hall. `trap246.mjs` walks onto the floor trap. `tbl.mjs` shoves tables.
- `cryptshot.mjs` renders the crypt: `Q='&ckinds=plain&shape=oct' SCN='clear,lamp,k_plain' OUT=dir TAG=x`. Scenes `k_<kind>`, `start`, `trap`, `trapopen`, `pitv`, `sunkb`; suffix `:fp` or `:d x_y_z_tx_ty_tz` (camera and target relative to the player). URL switches: `?cdepth=N ?sunk ?sv=0..3 ?shape=oct|under ?ckinds= ?ctraps=pit|swing|spikes|blade ?noarc`.
- Combat: `duel.mjs` (bot v bot: hit speed, damage, hit gap), `handle.mjs` (scripted player cuts at a dummy per weapon), `strip.mjs` (a film strip of a fight from the side), `fightp.mjs` (player v live bot), `react.mjs`, `stab.mjs`, `armcheck.mjs`-style scripts. `look.mjs` and `wshow.mjs` for close-ups of fighters and weapons.

## The work, in order

### 1. Check Build 246 as the player will see it (short)
- Not yet seen in a render: the open floor trap from a clear angle, rotunda versions of the plain, slab and hanged rooms, a domed junction, the candle wheel in an ordinary room, the store start room, the charnel mound after its UV fix.
- The dome render showed a dark hatched object high on the dome wall: find what it is (a wall candle bracket placed above the springing is the likely cause) and fix it.
- Undercroft columns show a dark vertical strip where an arch panel passes through them.
- Ask the player whether the two pits being lethal (with the automatic edge catch) is what he wants. It follows his own call for the Pit map, but he hasn't said so for the crypt.
- If he still finds a table that won't move, get the room kind from him; every loose table moved in `tbl.mjs`.

### 2. Combat: "night and day" beside Half Sword (the big one)
He agreed all four of these are wrong, and added "use real proportions". Work one at a time, each with before/after numbers and a film strip (`strip.mjs`) sent to him.
1. **Swings follow the hand.** The weapon still reads as steered by a spring, not carried by a body. Measure hand lag and how the blade trails the aim through a full cut for each weapon class; look at the shoulder and hip turn (`swTw`, Build 114) and weight shift (Build 212) during the cut in a strip, because the arms do most of the work on screen now.
2. **Hits connect.** Build 241 made contact precise (p50 1.7 cm off the skin). What's still missing is the moment after: the blade stopping in or dragging through, the body giving where it was struck, the sound. Compare a strip of one clean cut to the chest against his Half Sword clips.
3. **Enemy behaviour.** Bots land mostly slow contacts and reset the same way every exchange. Look at measure, feints, follow-ups after a landed hit, and what they do when hurt (`painT`, Build 230; `stabReact`, Build 243).
4. **Footwork and body.** Feet under a moving fight: stepping into a cut, recovering, not sliding. `lean3.mjs` and `strip.mjs` from the side.
- "Real proportions": check weapon lengths and masses against real ones (`WEAPONS` `len`, `WMASS`), the fighter's height and limb lengths (`FSCALE` 1.07, about 1.74 m in stance), and reach at which each weapon lands. Ask him what looked wrong if this doesn't find it.
- `FIRM` (Build 243) and `stabReact` were never looked at in motion. Do that first; they're part of this.

### 3. Rooms, second pass ("in major need of improvement")
Build 246 added rotundas, undercrofts, candle wheels and flagstone floors. Still to do, from his free-camera recording of a Half Sword level (described in the Build 242 note):
- Rooms at different heights: steps down into a room, a raised dais, a gallery. `cryptGround`, `cryptCeil`, `cryptWall` and the way-finding all have to know (the dug-out hall, `c.sunk`, is the worked example).
- Long rooms and rooms joined at angles, so a floor stops reading as a grid of cells 15.5 m apart (`cryptPlan`).
- A marked key room: when the gate is locked, the turnkey's room should look like his (a table, his lamp, keys on a board).
- "Make sure the things that are placed are somewhat intentional": go through each room kind and each helper that scatters (`odd`, `rubble`, `stoolC`, `onTable`, `leanPlanks`, `propLadder`) and make every piece belong to something: against a wall, at a table, in a group. The reach check at the end of `buildCrypt` catches blocked doors but not clutter in the middle of a walkway.
- Everything movable: chests, coffins, rubble, wall candles, the altar and slab are still fixed.

### 4. The character: "close, needs a slight polish" in shape and movement (not the skin)
- Shape: look at the bare body and the shirt in the crypt's stance from his camera (`look.mjs`); shoulders, neck, waist and how the shirt hangs (its flared hem and bagged body have been on the open list since Build 237).
- Movement: the idle and walk as seen from behind in the crypt, the stance (Build 200), arms when carrying the lantern.
- New hair shapes and draped tunic folds need the offline tools (`tools/mh/garb`, Blender's Python module, not installed in the cloud container).

### 5. Getting up
Build 246 shortens it by damage taken. He also asked for "depending on how you fell or stumbled": a stumble caught on hands and knees should skip the push-up stage and the roll altogether. Look at `startRise` (stages P, A, B, C and `roll`).

### 6. The six pulled weapons
Cudgel, hayfork, billhook, rusted sword, knightly sword, gilt mace (Build 243; defs and makers still in the file, out of all loot). Rebuild each from the proper parts (`bladeP`, `crossP`, `hiltP`, `flatBlade`, the lathed hafts) to the standard of the Build 168 swords, render them with `wshow.mjs` (`IDX` 12–17 in `YARD_W`), and **send him pictures before putting any back in play**.

### 7. Smaller things carried over
- Clothes: more poor and fancy options; poor cloth, barred cloth, the fur collar and the narrowed rayed stripes have never been checked in a render.
- The grave robbers' breach and daylight blood decals, also never seen in a render.
- `tools/net.mjs` (two browsers) hasn't been run since Build 226, and `die()`, loot and the crypt have changed since. Run it before the next multiplayer-facing change.
- Bots still open chest lids the old way.

### Later (his words, not yet)
A castle to explore the way the crypt is explored, after the crypt is right. The physical fighter stays its own switch in Options.
