# Bloodmoor: notes for Claude Code

A browser sword-fighting game: battle royale plus Duel, Tournament and Gauntlet modes, with peer-to-peer multiplayer. Hosted on GitHub Pages straight from `main` (no build step), so anything merged to `main` goes live within a minute or two.

## Layout
- `index.html`: the whole game: HTML, CSS and one ES module. Sections are marked with `// ====… section name` banners. Search those rather than reading the file top to bottom (it's ~3,000 dense lines).
- `fighters.json`: the fighter models as glTF JSON with an embedded buffer (textures included). It's rebuilt into a GLB in memory at load; don't fetch it as a data: URL. It holds the Quaternius CC0 bodies, outfits and hair rebound to the Mixamo X Bot skeleton (the game's bone names, `mixamorig*`), plus idle/walk/run. Each fighter keeps only the meshes of its look (`dressModel`, `LOOK`). Regenerate with `node tools/build-fighters.mjs`; don't hand-edit it.
- `sfx/`, `music/`: CC0 recordings. Every source is listed in `CREDITS.md`. Only add audio whose licence you've checked, and credit it there.
- `tools/`: headless test harness (Playwright). Not needed to play.

## How the game works (the parts people change most)
- **Sim loop:** `logic(dt)` runs fixed steps of `H = 1/240` through `sim(h)`, then `animate(dt)` per fighter. `frame()` renders and runs audio, HUD and networking.
- **Swords (classic engine):** `class Sword` is a hand point `H` pulled toward `Fighter.handTarget()` by a clamped spring, plus a verlet tip `T` steered by `guideDir()`. Per-weapon handling lives in the `HANDLING` table (one row per weapon, documented above it); `Sword.step` only reads it. Damage multipliers stay on `WEAPONS`. Hits are blade sample points against limb capsules (`CAPS`), resolved in `resolveHit` (cut, thrust, flat, haft and blunt modes, armour, severing).
- **Rigid-body engine** (menu switch "Rigid body"): Rapier, loaded on demand. Weapons are compound rigid bodies (`wepParts`) driven by a grip force plus wrist torque (`physStep`, tuned via `PT`). Limbs are capsule bodies sprung to the animation. A contact-free "shadow" copy runs the same spring, so only real shoves get drawn (`physParts` and `physVisual`). Damage comes from solver contacts in `physCombat`.
- **Looks:** `look = {o: outfit, h: hair, bd: beard, hc: hair colour, sk: skin}` lives on each fighter, in `PROFILE`, in the join hello and in rosters. Team colours (`pal`) dye the undyed cloth through `tintMaterial`. Armour was shaped for a slimmer body and is widened per bone by `ARMOR_FIT`/`ARMOR_OFF`.
- **Grip and pose:** `gripHand()` puts the hands on the weapon; the guard height is set in `handTarget()`. Check pose changes with screenshots, not just numbers.
- **Modes:** the `// modes` section. The training yard (`yardStart`, `yardHit`, `yardTick`) is the quickest place to feel a weapon change; its readout shows tip speed and every hit. `RUN` holds mode state. `modeKill()` decides round ends and `modeTick()` runs timers. `startCountdown()` runs at every match or round start.
- **Grip:** `gripHand(...,wrap)` lines the hand up with the forearm and lays the haft across the palm (`GRIP_IN`, `GRIP_UP`), since a round grip turns freely in the fist. Don't rotate the hand to follow the edge, which bends the wrist. The wrist joint limit (`WR_MAX`/`WR_MIN`, against `Fighter.foreF`) keeps the blade between 12° and 112° of the forearm in both engines. In the rigid-body engine the wrist torque scales with hand spread (`Sword.lever`).
- **Aiming and view:** with a sword, the mouse moves the hand in a box. Past its side, without LMB, the overshoot goes into `turnPush`, an eased turn; with LMB the hand just stops at the edge. Vertical mouse movement never pitches the view, unarmed included. Scrolling the wheel puts a human's sword in a thrusting stance (`pointT`, about 0.8 s), aiming at face height, so repeated scrolls poke along the line. A human's sword guard holds the point forward (`pg` in `guideDir`). Axes and maces never thrust; the wheel changes their reach.
- **How weapons are held:** `TWO_HANDED` (longsword, greatsword, axe, spear) keeps the off hand on the haft, and `handTarget` keeps the aim within its reach (spears are exempt, since the front hand slides). One-handed weapons put the off hand up in a guarding fist. `rollLimit()` and a 400°/s roll-rate cap stop the head spinning round the haft in both engines.
- **Throwing:** holding Q winds the weapon back over the shoulder (`throwHold`); releasing drives the arm through for `THROW_T` and then `throwWeapon()` launches it from the hand. A spear flies point-first; other weapons tumble.
- **Grabbing** (unarmed humans): `grabStep`/`grabTry`. A slow open hand on a body part closes on it and pulls a standing fighter off balance (`balV`), or drags a ragdoll particle. Reaching low sets `stoop`, which crouches the body and goes out in snapshots as `cr`.
- **The Pit map:** `PIT` (shaft radius, depth, bridge half-width). Every floor check uses `groundY(x,z,y)`, plus `pitWall()` for points below the rim. In the rigid-body engine the ground is a trimesh ring with the shaft wall, floor and bridge (`physStatic`). Fighters over the edge go to `pitFall()` and die when they hit the bottom; bots steer away from the edge.
- **Smoothness:** the sim only advances in whole 1/240 s steps, so never freeze or crawl it for effect: `hitstop()` eases to half speed. The camera code is deliberately the Build 33 version (the player asked for it back), so don't add follow smoothing or rig blending without asking. `beginRecover()` eases a fighter from ragdoll pose back into animation. Walk and run share one stride (measured clip speeds: walk 1.51 m/s, run 3.62 m/s). On clients, `snapAt()` starts each snapshot blend from what's on screen, and late packets extrapolate briefly.
- **Multiplayer:** the `// multiplayer` section. The host's browser runs the whole sim. Friends (`NET.mode==='client'`) send input about 30 times a second (`clientSendInput`) and render 20 Hz snapshots (`netSnap` → `clientFrame`). Effects and sounds are replayed from `netEv` events. Anything that changes the world on the host must reach clients through the snapshot or an event. Clients never run `Fighter.step`.

## Testing
```
cd tools && npm install && npx playwright install chromium
node smoke.mjs                  # a minute of battle royale plus each arena mode; prints page errors
Q='?physics' node smoke.mjs     # same on the rigid-body engine
```
`boot()` in `tools/harness.mjs` gives you `page`, and `window.__game` exposes the internals (`fighters`, `player`, `logic`, `startGame`, `PT`, `NET`, `MODEHUD`, …). Set `window.__pause=true` and step `g.logic(1/60)` yourself for deterministic tests. Pass `render:false` when you only need logic; rendering in headless Chrome is slow.

Measure feel changes instead of guessing: tip speed (`player.sword.tipVel`), hand lag (`handTarget()` versus `sword.H`), and damage against a bot standing in front of you. Before/after numbers are what tell you whether a change helped.

## House rules
- **Commit as `misterpigger <misterpigger@users.noreply.github.com>`** (or your own GitHub noreply address). Never commit a personal email; this repo is public.
- Keep it a single static `index.html` plus assets: no bundler and no server.
- Work on a branch and open a pull request rather than pushing straight to `main`, because `main` is the live site.
- Merge pull requests locally with a fast-forward (`git checkout main && git merge --ff-only <branch> && git push`), not with GitHub's merge or squash button. GitHub's buttons sign the merge with the merging account's email, which leaks it unless that account has "Keep my email addresses private" turned on.
