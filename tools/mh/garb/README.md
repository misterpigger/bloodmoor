# Bloodmoor: hair, beards and draped garments (Build 126)

Offline steps that make `assets/mhparts/*` (none of this runs in the game).

1. `python3 extract.py` reads `fighters.json` and writes each build's bind-pose body (positions, normals, uv, skin weights) to
   `$GARB_WORK/body_<A-D>.npz`.
2. `python3 mhmap.py`, `python3 basefull.py`: the MakeHuman base-mesh vertex behind each body vertex, and the full base mesh (with
   helpers) carried into each build's bind space (needs the MakeHuman and MPFB repos under `$MH_SRC`, as for `../build_mh.py`).
3. `python3 parts.py`, `python3 parts2.py`: MakeHuman hair, beard, brow and lash proxies (asset packs unzipped under `$MH_SRC`, see
   CREDITS.md) fitted with their `.mhclo` to each build and skinned from the nearest body vertices.
4. Garments: `garments.json` describes each one (ease, hem, flare, belt, neck, slits, cloth stiffness). `run_all.sh` runs
   `bl_garment.py` in Blender's Python module (`pip install bpy scipy`) for every garment and build: the body smoothed and blown up by
   the ease, joined with solid ellipsoids that bridge the legs for a skirt, voxel-remeshed into one closed surface, cut open at the
   neck, cuffs and hem (and slits), the belt line drawn in to the body, then a cloth simulation against the body pinned at the
   shoulders and the belt; then `gar2bin.py` (skin weights, skirt weights to hips and thighs, the body vertices each garment hides,
   uv, sway weights) and `belt.py` (a leather belt laid on the cloth at its belt line, buckle and hanging end).

`loops.py <npz>` lists a garment's open edges (neck, cuffs, hem) to check a cut.
