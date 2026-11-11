# Bloodmoor: hair as locks, and mending the draped garments (Build 201)

Offline; none of this runs in the game. Needs numpy, scipy and Pillow. Everything reads the bodies straight from `fighters.json`
(`body.py`, cached as `body_<A-D>.npz` in the working directory) and the parts from `assets/mhparts`.

## Hair (`hs_crop`, `hs_long`, `hs_tousle`, `hs_bowl`, and `locks_d.webp`)

    python3 atlas.py out/locks_d.webp      # the lock atlas: 8 locks, root at the bottom of the image
    python3 gen.py [ids...]                # out/<id>.bin, grown on build A
    python3 prev.py hs_crop hs_long        # a quick software picture (front, three-quarter, side, back) to check before the game
    cp out/hs_*.bin out/locks_d.webp ../../../assets/mhparts/

A head of hair is 600-1,200 locks: ribbons 1.5-3 cm wide with a pointed, wispy end (the atlas), rooted evenly over the scalp
(Poisson-disc), combed along a flow per style, lifted like shingles from the nape up, with their own normals (rounded toward the
head's ball so the light falls across the hair in one sweep). Each vertex is tied to the body vertex under it (`anchor`, `off`), so the
game lays the same hair on any build. Things that went wrong on the way, so you don't repeat them:
- thousands of 1 cm ribbons read as corduroy at game distance: what you see from 2 m is the silhouette and broad streaks, not strands;
- a strong root-to-tip darkening in the atlas drew every lock as a pale leaf on a dark one, like scales;
- the ear stands at z .025-.075, out past x .076 (build A's bind space); masking "the ear" behind that left a bald patch on the skull;
- normals taken from the nearest body vertex lit hair that hangs clear of the head in facets;
- a cap under the hair showed as a black rim wherever it reached past the locks (the game no longer makes one).

## Garments (`shirt`, `cote`, `doublet`, `aketon`)

    python3 gwrap.py aketon D A C          # carry a garment from one build's body to others (same mesh, vertex for vertex)
    python3 gfix.py shirt cote doublet aketon
    python3 gpose.py shirt D guard         # skin it offline to arms-down / a guard and count the folded edges; writes gp_*.jpg
    python3 gdiag.py shirt ; python3 wdiag.py shirt

`gfix.py` mends what the cloth simulation left round the shoulders and collar: the cloth there stood 1-4 cm off the skin in wrinkles,
and skinned from the T-pose to arms-down it folded over itself across the front of the shoulder (a crack) while the rolled hem round
the neck kinked into horns. It draws that cloth in to an even 7-12 mm, smooths it, evens the collar's edge and rebuilds the rolled
hems on it. Folded edges with the arms in a guard, before -> after: shirt 88 -> 42, doublet 111 -> 43, aketon (build A) 623 -> 36.
`gwrap.py` replaced the aketon on builds A and C with build D's: A's own simulation had left it hanging in tatters under the arms with a
slit down the back, C's had a torn cuff. It also zips shut slits where the neck's cut ran on down a shoulder (the shirt on build A, the doublet on C: `slits.py` lists them)
and evens the skin weights over the mended cloth (the collar's edge drew as a saw when a shoulder was raised).
`SRC`/`DST` point either script at other folders than `assets/mhparts`. The parts in the repository are already mended: the
simulation's own output is the version of `assets/mhparts/*.bin` at Build 200 (`git show 1c04d86:assets/mhparts/shirt.bin`), and
`gfix.py` should be run on that, not on its own output.
