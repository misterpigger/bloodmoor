# Downloads Quaternius' Universal Animation Library 1 and 2 (Standard, CC0) from OpenGameArt into assets/cand/anim/ for retargeting.
import os, io, zipfile, urllib.request
UA = {"User-Agent": "bloodmoor-asset-fetch (CC0 game assets)"}
OUT = "assets/cand/anim"; os.makedirs(OUT, exist_ok=True)
for name, url in [("ual1", "https://opengameart.org/sites/default/files/universal_animation_librarystandard.zip"),
                  ("ual2", "https://opengameart.org/sites/default/files/universal_animation_library_2standard.zip")]:
    try:
        data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
        z = zipfile.ZipFile(io.BytesIO(data))
        names = z.namelist(); open(f"{OUT}/{name}_list.txt", "w").write("\n".join(names))
        for n in names:
            low = n.lower()
            if low.endswith(".glb") or low.endswith(".gltf") or low.endswith(".bin") or "license" in low or low.endswith(".txt"):
                dst = f"{OUT}/{name}_" + n.replace("/", "__")
                open(dst, "wb").write(z.read(n))
        print("ok", name, len(names))
    except Exception as e:
        print("fail", name, e)
