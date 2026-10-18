# Downloads candidate CC0 (public domain) ambience recordings from OpenGameArt into assets/cand_audio/ for review:
# an arena crowd, a fire loop, night crickets, daytime birds and wind, and a wind loop. Run by .github/workflows/fetch-cc0.yml.
import os, json, urllib.request
UA = {"User-Agent": "bloodmoor-asset-fetch (CC0 game audio)"}
OUT = "assets/cand_audio"; os.makedirs(OUT, exist_ok=True)
FILES = {
  "crowd_shouting.ogg": ("https://opengameart.org/sites/default/files/crowd_shouting_0.ogg", "https://opengameart.org/content/crowd-shoutingspeaking-ambience", "StarNinjas"),
  "fire.wav": ("https://opengameart.org/sites/default/files/fire.wav", "https://opengameart.org/content/fireplace-sound-loop", "PagDev"),
  "crickets.mp3": ("https://opengameart.org/sites/default/files/crickets_1.mp3", "https://opengameart.org/content/crickets-ambient-noise-loopable", "Wolfgang_"),
  "birds_wind.ogg": ("https://opengameart.org/sites/default/files/Birds%20and%20Wind%20-%20Ambient_1.ogg", "https://opengameart.org/content/birds-and-wind-ambient-birds-wind-and-synth", "Spring Spring"),
  "wind_loop.ogg": ("https://opengameart.org/sites/default/files/wind%20woosh%20loop.ogg", "https://opengameart.org/content/wind-whoosh-loop", "SketchMan3"),
}
log = {"license": "CC0 (opengameart.org)", "got": {}, "miss": []}
for name, (url, page, who) in FILES.items():
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r: data = r.read()
        open(f"{OUT}/{name}", "wb").write(data); log["got"][name] = {"page": page, "author": who, "bytes": len(data)}; print("ok", name, len(data))
    except Exception as e: print("fail", name, e); log["miss"].append(name)
open(f"{OUT}/cand.json", "w").write(json.dumps(log, indent=1))
