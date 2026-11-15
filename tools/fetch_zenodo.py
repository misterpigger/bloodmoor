# Searches Zenodo's 3DBigDataSpace community (CC-licensed models from Sketchfab via Objaverse)
# and saves each hit's metadata and thumbnail, or downloads chosen records' GLBs (IDS=...).
# Run by .github/workflows/fetch-models.yml on GitHub's machines.
import json, os, sys, time, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
UA = {"User-Agent": "bloodmoor-asset-fetch"}
def get(url, tries=4):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                return r.read()
        except Exception as e:
            print("retry", url[:90], e); time.sleep(8 + 10 * k)
    return None
ids = os.environ.get("IDS", "").split()
if ids:
    for rid in ids:
        b = get(f"https://zenodo.org/api/records/{rid}")
        if not b: continue
        r = json.loads(b)
        for f in r.get("files", []):
            if f["key"].endswith(".glb"):
                d = get(f["links"]["self"])
                if d: open(f"{out}/{rid}.glb", "wb").write(d); print("ok", rid, len(d))
        m = r["metadata"]
        json.dump({"id": rid, "title": m.get("title"), "creators": m.get("creators"), "license": m.get("license"), "description": m.get("description"), "related": m.get("related_identifiers"), "notes": m.get("notes")}, open(f"{out}/{rid}.json", "w"), indent=1)
        time.sleep(1.5)
    sys.exit(0)
seen = {}
for q in os.environ.get("QUERIES", "").split("|"):
    q = q.strip()
    if not q: continue
    for page in (1, 2, 3):
        url = "https://zenodo.org/api/records?" + urllib.parse.urlencode({"communities": "3dbigdataspace", "q": q, "size": 25, "page": page})
        b = get(url)
        if not b: break
        hits = json.loads(b).get("hits", {}).get("hits", [])
        print(q, page, len(hits))
        for r in hits:
            rid = str(r["id"])
            if rid in seen: continue
            m = r["metadata"]; fs = r.get("files", [])
            glb = [f for f in fs if f["key"].endswith(".glb")]
            seen[rid] = {"id": rid, "q": q, "title": m.get("title"), "creators": [c.get("name") for c in m.get("creators", [])], "license": (m.get("license") or {}).get("id"), "desc": (m.get("description") or "")[:400], "glb": glb[0]["size"] if glb else 0}
            th = [f for f in fs if f["key"] == "thumb0.jpeg"] or [f for f in fs if f["key"].startswith("thumb")]
            if th:
                d = get(th[0]["links"]["self"])
                if d: open(f"{out}/{rid}.jpg", "wb").write(d)
            time.sleep(1.1)
        if len(hits) < 25: break
        time.sleep(2)
json.dump(list(seen.values()), open(f"{out}/index.json", "w"), indent=1)
print("records", len(seen))
