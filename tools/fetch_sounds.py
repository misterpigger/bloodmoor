# Finds and downloads CC0 sound recordings from freesound.org (the dev sandbox can't reach it; run by the fetch-models
# workflow on GitHub's machines). Two modes, both from the environment:
#   QUERIES="forest birds|crows|..."  search freesound for CC0 sounds and keep the first PER of each query
#   IDS="12345 67890"                  fetch those sounds
# Every sound kept is checked on its own page to be CC0 (the licence link must be creativecommons.org/publicdomain/zero)
# before its preview (high-quality mp3) is saved, with index.json listing id, title, author, licence, duration and page.
import json, os, re, sys, time, urllib.parse, urllib.request
OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/sounds"
UA = {"User-Agent": "Mozilla/5.0 (bloodmoor asset fetch; CC0 sounds for a free game)"}
PER = int(os.environ.get("PER", "4"))
def get(url, binary=False):
    for k in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                d = r.read(); return d if binary else d.decode("utf-8", "replace")
        except Exception as e:
            err = e; time.sleep(2 + k * 3)
    raise err
def sound(sid):
    html = get(f"https://freesound.org/s/{sid}/")
    lic = re.search(r'href="(https?://creativecommons\.org/[^"]+)"', html)
    lic = lic.group(1) if lic else ""
    title = re.search(r'<meta property="og:title" content="([^"]*)"', html)
    audio = re.search(r'(https://cdn\.freesound\.org/previews/\d+/\d+_\d+-hq\.mp3)', html)
    user = re.search(r'freesound\.org/people/([^/"]+)/sounds/' + str(sid), html) or re.search(r'/people/([^/"]+)/', html)
    dur = re.search(r'"duration"\s*:\s*"?([\d.:]+)', html) or re.search(r'(\d+:\d\d\.\d+)', html)
    return {"id": sid, "title": title.group(1) if title else "", "user": user.group(1) if user else "", "license": lic,
            "duration": dur.group(1) if dur else "", "page": f"https://freesound.org/s/{sid}/", "preview": audio.group(1) if audio else ""}
def keep(meta, tag):
    if "publicdomain/zero" not in meta["license"] or not meta["preview"]:
        print("  skip", meta["id"], meta["license"] or "no licence"); return False
    fn = f"{tag}__{meta['id']}.mp3"
    open(os.path.join(OUT, fn), "wb").write(get(meta["preview"], True)); meta["file"] = fn; meta["tag"] = tag
    print("  ok", fn, meta["title"], meta["duration"]); return True
os.makedirs(OUT, exist_ok=True)
index = []
for q in [s.strip() for s in os.environ.get("QUERIES", "").split("|") if s.strip()]:
    url = "https://freesound.org/search/?" + urllib.parse.urlencode({"q": q, "f": 'license:"Creative Commons 0"', "s": "Downloads (most first)"})
    print("search", q)
    try:
        html = get(url)
    except Exception as e:
        print("  search failed", e); continue
    ids = []
    for m in re.finditer(r'/people/[^/"]+/sounds/(\d+)/', html):
        if m.group(1) not in ids: ids.append(m.group(1))
    n = 0
    for sid in ids:
        if n >= PER: break
        try:
            meta = sound(sid)
        except Exception as e:
            print("  fail", sid, e); continue
        if keep(meta, re.sub(r"\W+", "_", q)): index.append(meta); n += 1
        time.sleep(1)
for sid in os.environ.get("IDS", "").split():
    try:
        meta = sound(sid)
        if keep(meta, "id"): index.append(meta)
    except Exception as e:
        print("fail", sid, e)
json.dump(index, open(os.path.join(OUT, "index.json"), "w"), indent=1)
print(len(index), "sounds kept")
