# Downloads candidate CC0 (public domain) material scans from ambientCG and Poly Haven into assets/cand/ for review:
# steel, mail, quilted and plain cloth, leather. Run by .github/workflows/fetch-cc0.yml on GitHub's machines.
import json, os, io, zipfile, urllib.request
UA = {"User-Agent": "bloodmoor-asset-fetch (CC0 game textures)"}
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
        return r.read()
OUT = "assets/cand"; os.makedirs(OUT, exist_ok=True)
log = {"license": "CC0 (ambientcg.com, polyhaven.com)", "got": {}, "miss": []}
KEEP = {"Color": "d", "NormalGL": "n", "Roughness": "r", "Metalness": "m", "AmbientOcclusion": "ao", "Opacity": "a", "Displacement": "h"}
ACG = ["Metal049A", "Metal046B", "Metal032", "Metal041A", "Metal012", "Metal035", "Metal053C", "Metal009",
       "Chainmail001", "Chainmail002", "Chainmail003", "Chainmail004",
       "Fabric004", "Fabric026", "Fabric030", "Fabric045", "Fabric062", "Fabric032", "Fabric051",
       "Leather008", "Leather011", "Leather026", "Leather037", "Wood049", "Wood066"]
for aid in ACG:
    data = None
    for url in [f"https://ambientcg.com/get?file={aid}_1K-JPG.zip"]:
        try: data = get(url); break
        except Exception as e: print("fail", aid, url, e)
    if data is None:
        try:
            j = json.loads(get(f"https://ambientcg.com/api/v2/full_json?id={aid}&include=downloadData"))
            for d in j["foundAssets"][0]["downloadFolders"]["default"]["downloadFiletypeCategories"]["zip"]["downloads"]:
                if d["attribute"] == "1K-JPG": data = get(d["fullDownloadPath"]); break
        except Exception as e: print("api fail", aid, e)
    if not data: log["miss"].append(aid); continue
    try:
        z = zipfile.ZipFile(io.BytesIO(data)); got = []
        for n in z.namelist():
            for k, s in KEEP.items():
                if n.endswith(f"_{k}.jpg") or n.endswith(f"_{k}.png"):
                    ext = n.rsplit(".", 1)[-1]; open(f"{OUT}/{aid}_{s}.{ext}", "wb").write(z.read(n)); got.append(s)
        log["got"][aid] = {"maps": got, "page": f"https://ambientcg.com/view?id={aid}"}; print("ok", aid, got)
    except Exception as e: print("zip fail", aid, e); log["miss"].append(aid)
PH = ["worn_shiny_metal", "metal_plate_02", "rusty_metal_04", "fabric_pattern_05", "jute_fabric", "hessian_230", "leather_red_02", "brown_leather", "denim_fabric_02", "quilted_fabric"]
API = "https://api.polyhaven.com"
for aid in PH:
    try: files = json.loads(get(f"{API}/files/{aid}"))
    except Exception as e: print("skip", aid, e); log["miss"].append(aid); continue
    got = []
    for key, names in {"d": ["Diffuse"], "n": ["nor_gl"], "r": ["Rough", "rough"], "m": ["Metal", "metal"], "ao": ["AO"]}.items():
        for n in names:
            f = files.get(n, {}).get("1k", {}).get("jpg") or files.get(n, {}).get("1k", {}).get("png")
            if f:
                ext = f["url"].rsplit(".", 1)[-1]; open(f"{OUT}/ph_{aid}_{key}.{ext}", "wb").write(get(f["url"])); got.append(key); break
    if got: log["got"]["ph_" + aid] = {"maps": got, "page": f"https://polyhaven.com/a/{aid}"}; print("ok", aid, got)
    else: log["miss"].append(aid)
open(f"{OUT}/cand.json", "w").write(json.dumps(log, indent=1))
