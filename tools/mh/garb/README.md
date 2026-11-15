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

## Folds (Build 305)

The drape used to have the same stiffness against squeezing as against stretching (`tens` for both) and only as much cloth as the
body needed, so the spare cloth squeezed in its own plane and the folds came out as long shallow flutes. `garments.json` now sets
`comp` (compression stiffness, low so the cloth buckles) and `grow` / `growk`: a weighted group that grows the cloth's rest size by up
to `growk` round the belt (`body`: it bags over the belt), in the skirt (`skirt`: fuller, deeper flutes) and down the forearms
(`sleeve`: the sleeves bunch toward the cuff). Blender keeps `shrink_max >= shrink_min` and blends min (weight 0) to max (weight 1),
so the growth is `shrink_min = -growk` at weight 0 and every vertex gets weight `1 - growth`. Spare girth pushed out round the belt
(`blouse`) was tried too and tears the cloth at the armpits: don't use it. The whole chain, in order:

    pip install bpy scipy                                  # Blender 5.3's Python module, ~430 MB
    GARB_WORK=work python3 extract.py                      # body_A-D.npz
    GARB_WORK=work python3 bl_garment.py cote A            # x4 garments x4 builds, ~2 min each
    MH_SRC=src GARB_WORK=work GARB_OUT=out/ python3 gar2bin.py cote ABCD    # (MH_SRC only needs garb/body_*.npz and dummy full_*.npy)
    SRC=out/ DST=out/ python3 ../mend/gwrap.py aketon D A C                  # A's and C's own aketon drapes tear under the arms
    SRC=out/ DST=final/ python3 ../mend/gfix.py cote shirt doublet aketon
    GARB_WORK=work GARB_OUT=final/ python3 belt.py cote .97 ABCD   # and shirt .97, doublet .93
