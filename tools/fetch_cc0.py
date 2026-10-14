# Downloads CC0 (public domain) photo-scanned textures and an HDRI from Poly Haven into assets/.
# Run by .github/workflows/fetch-cc0.yml on GitHub's machines (the dev sandbox can't reach polyhaven.com).
import json, os, sys, urllib.request
API = "https://api.polyhaven.com"
UA = {"User-Agent": "bloodmoor-asset-fetch (CC0 game textures)"}
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()
# candidates per role: the first that exists is used. 2k for big surfaces, 1k for props.
ROLES = {
  "ground":  (["rocky_trail", "gravelly_sand", "coast_sand_rocks_02", "aerial_rocks_02", "brown_mud_rocks_01"], "2k"),
  "ground2": (["gravelly_sand", "dry_ground_rocks", "aerial_ground_rock", "sandy_gravel"], "2k"),
  "wall":    (["castle_wall_slates", "medieval_blocks_02", "castle_brick_07", "stone_wall_04", "medieval_blocks_05"], "2k"),
  "plaster": (["rough_plaster_brick", "beige_wall_001", "plastered_wall_04", "rough_plaster_03"], "1k"),
  "wood":    (["weathered_planks", "wood_planks_grey", "old_planks_02", "brown_planks_03"], "1k"),
  "timber":  (["bark_willow", "wood_cabinet_worn_long", "rough_wood", "wood_table_worn"], "1k"),
  "metal":   (["rusty_metal_02", "rust_coarse_01", "metal_plate", "corrugated_iron"], "1k"),
  "cloth":   (["fabric_pattern_07", "jute_fabric", "denim_fabric", "fabric_leather_02"], "1k"),
  "leather": (["leather_red_03", "brown_leather", "fabric_leather_02"], "1k"),
}
MAPS = {"diff": ["Diffuse"], "nor": ["nor_gl"], "rough": ["Rough", "rough"], "ao": ["AO"]}
out = {"license": "CC0 (polyhaven.com)", "textures": {}}
for role, (cands, res) in ROLES.items():
    for aid in cands:
        try:
            files = json.loads(get(f"{API}/files/{aid}"))
        except Exception as e:
            print("skip", aid, e); continue
        got = {}
        for key, names in MAPS.items():
            for n in names:
                f = files.get(n, {}).get(res, {}).get("jpg") or files.get(n, {}).get(res, {}).get("png")
                if f:
                    ext = f["url"].rsplit(".", 1)[-1]
                    path = f"assets/tex/{role}_{key}.{ext}"
                    os.makedirs(os.path.dirname(path), exist_ok=True)
                    open(path, "wb").write(get(f["url"])); got[key] = path; break
        if "diff" in got:
            out["textures"][role] = {"asset": aid, "res": res, "maps": got, "page": f"https://polyhaven.com/a/{aid}"}
            print("ok", role, aid, list(got)); break
for hid in ["kloofendal_48d_partly_cloudy_puresky", "kloofendal_43d_clear_puresky", "spruit_sunrise", "venice_sunset"]:
    try:
        f = json.loads(get(f"{API}/files/{hid}"))["hdri"]["1k"]["hdr"]
        os.makedirs("assets/hdri", exist_ok=True); open("assets/hdri/sky_1k.hdr", "wb").write(get(f["url"]))
        out["hdri"] = {"asset": hid, "page": f"https://polyhaven.com/a/{hid}"}; print("ok hdri", hid); break
    except Exception as e:
        print("skip hdri", hid, e)
open("assets/cc0.json", "w").write(json.dumps(out, indent=1))
