#!/usr/bin/env python3
"""Bakes the MakeHuman bodies' skin texture set from the mesh itself (no photo sources needed, all procedural):

  skin_d.jpg  colour variation (multiplied by the fighter's skin tone in the game): blood-flushed cheeks, nose, ears,
              knuckles, elbows and knees, darker creases, lips, nails, nipples, faint veins on the forearms
  skin_n.jpg  tangent-space normal map: pores, fine wrinkles at the knuckles, brow and neck, coarser creases
  skin_m.png  masks: R scalp hair, G beard, B cavity (ambient occlusion-like darkening in creases), A eyebrows
  (and per-vertex scalp/beard/brow weights written back into mh_bodies.json for the hair shells)

  python3 bake_skin.py mh_bodies.json <mpfb>/src/mpfb/data/textures out_dir"""
import sys, os, json, math
import numpy as np
from PIL import Image, ImageFilter

SRC, MPFB_TEX, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
S = int(os.environ.get('SIZE', 2048))
d = json.load(open(SRC))
B = d['bodies'][0]
P = np.array(B['pos']).reshape(-1, 3)
N = np.array(B['nor']).reshape(-1, 3)
UV = np.array(d['uv']).reshape(-1, 2)
I = np.array(d['index']).reshape(-1, 3)
J = {k.replace('mixamorig:', ''): np.array(v) for k, v in B['heads'].items()}
JT = {k.replace('mixamorig:', ''): np.array(v) for k, v in B['tails'].items()}

# ---------------------------------------------------------------- rasterize: per texel, 3D position and normal
pos = np.zeros((S, S, 3), np.float32)
nor = np.zeros((S, S, 3), np.float32)
cov = np.zeros((S, S), bool)
uvp = UV * [S, S]
uvp[:, 1] = S - uvp[:, 1]   # image rows run down, v runs up
for t in I:
    a, b, c = uvp[t]
    x0, y0 = np.floor(np.minimum(np.minimum(a, b), c)).astype(int) - 1
    x1, y1 = np.ceil(np.maximum(np.maximum(a, b), c)).astype(int) + 1
    x0, y0 = max(x0, 0), max(y0, 0)
    x1, y1 = min(x1, S - 1), min(y1, S - 1)
    if x1 < x0 or y1 < y0:
        continue
    xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + .5, np.arange(y0, y1 + 1) + .5)
    den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
    if abs(den) < 1e-12:
        continue
    w0 = ((b[1] - c[1]) * (xs - c[0]) + (c[0] - b[0]) * (ys - c[1])) / den
    w1 = ((c[1] - a[1]) * (xs - c[0]) + (a[0] - c[0]) * (ys - c[1])) / den
    w2 = 1 - w0 - w1
    m = (w0 >= -.02) & (w1 >= -.02) & (w2 >= -.02)
    if not m.any():
        continue
    W = np.stack([w0[m], w1[m], w2[m]], 1)
    yy, xx = ys[m].astype(int), xs[m].astype(int)
    pos[yy, xx] = W @ P[t]
    nor[yy, xx] = W @ N[t]
    cov[yy, xx] = True
nor /= np.linalg.norm(nor, axis=2, keepdims=True) + 1e-9
print('covered texels', cov.mean().round(3))

# ---------------------------------------------------------------- 3D noise on the texel positions
def hash3(ix, iy, iz, seed):
    h = (ix * 73856093) ^ (iy * 19349663) ^ (iz * 83492791) ^ (seed * 2654435761)
    h = (h ^ (h >> 13)) * 1274126177
    return ((h ^ (h >> 16)) & 0xffffff) / float(0xffffff)

def vnoise(p, f, seed=0):
    q = p * f
    i = np.floor(q).astype(np.int64)
    r = q - i
    r = r * r * (3 - 2 * r)
    out = 0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (r[..., 0] if dx else 1 - r[..., 0]) * (r[..., 1] if dy else 1 - r[..., 1]) * (r[..., 2] if dz else 1 - r[..., 2])
                out = out + w * hash3(i[..., 0] + dx, i[..., 1] + dy, i[..., 2] + dz, seed)
    return out

def fbm(p, f, oct, seed=0, g=.5):
    s, a, t = 0, 1, 0
    for o in range(oct):
        s = s + a * vnoise(p, f * 2 ** o, seed + o * 7)
        t += a
        a *= g
    return s / t

def blob(c, r):
    """soft sphere mask round a point"""
    return np.exp(-np.sum((pos - c) ** 2, axis=2) / (r * r))

def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)

def mpfb(name):
    im = Image.open(os.path.join(MPFB_TEX, name)).convert('L').resize((S, S), Image.BILINEAR)
    return np.asarray(im, np.float32) / 255

# ---------------------------------------------------------------- anatomy landmarks
head, neck = J['Head'], J['Neck']
headtop = JT['Head']
hc = head + (headtop - head) * .45            # centre of the skull
hr = np.linalg.norm(headtop - head) * .55
L, R = 'Left', 'Right'
rel = pos - hc
dist_h = np.linalg.norm(rel, axis=2)
on_head = (dist_h < hr * 1.6) & (pos[..., 1] > neck[1] + .02)
fwd = rel[..., 2] / (dist_h + 1e-6)          # +1 facing front
up = rel[..., 1]

# scalp: above a hairline that rises at the forehead and drops to the nape; not the ears or face
hairline = .035 + .045 * np.clip(fwd, 0, 1) - .075 * np.clip(-fwd, 0, 1)
side = np.abs(rel[..., 0]) / (dist_h + 1e-6)
hairline -= .012 * side * (fwd > -.2)
edge_noise = (fbm(pos, 90, 3, 5) - .5) * .018
scalp = smooth(-.006, .01, up - hairline + edge_noise) * on_head
# keep the ears bare
for s in (L, R):
    ear = hc + np.array([.075 if s == L else -.075, -.01, -.005])
    scalp *= 1 - blob(ear, .03)
# beard: the lower face and jaw, under the chin, and a moustache
chin_y = hc[1] - .13
mouth_y = hc[1] - .085
beard = on_head * (fwd > .05) * smooth(chin_y - .03, chin_y + .005, pos[..., 1]) * (1 - smooth(hc[1] - .055, hc[1] - .035, pos[..., 1]))
beard *= smooth(.08, .3, fwd + .25 * (pos[..., 1] < mouth_y))
beard = np.maximum(beard, on_head * smooth(chin_y + .02, chin_y - .01, pos[..., 1]) * smooth(.4, .7, rel[..., 2] / hr + .6) * (pos[..., 1] > neck[1] + .03))
lips = mpfb('mpfb_lips.jpg')
beard *= 1 - smooth(.1, .5, lips)
beard *= smooth(.3, .6, fbm(pos, 70, 3, 9) + .2)
# eyebrows: an arch of hair above each eye, thick at the inner end and thinning outward
EYE = np.array(B['eyes']).reshape(-1, 3)
brows = np.zeros((S, S), np.float32)
for sg in (1, -1):
    e = EYE[EYE[:, 0] * sg > 0]
    ec = e.mean(0)
    er = np.abs(e[:, 0] - ec[0]).max()
    lat = (pos[..., 0] - ec[0]) * sg                        # outward from the nose
    t = np.clip((lat + er * 1.2) / (er * 3.0), 0, 1)        # 0 inner end .. 1 outer end
    arch = ec[1] + er * 1.55 + er * .45 * np.sin(np.clip(t, 0, 1) * math.pi) - er * .4 * t
    half = er * (.78 - .38 * t)
    inside = (lat > -er * 1.25) & (lat < er * 1.5) & (pos[..., 2] > ec[2] - er * 1.5) & on_head
    brows = np.maximum(brows, inside * smooth(half, half * .45, np.abs(pos[..., 1] - arch)) * smooth(-er * 1.25, -er * .9, lat) * (1 - smooth(er * 1.05, er * 1.5, lat)))
brows *= .6 + .4 * fbm(pos, 160, 2, 51)

# ---------------------------------------------------------------- colour variation (around 1, multiplied by skin tone)
col = np.ones((S, S, 3), np.float32)
def tint(mask, rgb, k=1):
    global col
    col = col * (1 - mask[..., None] * k) + col * np.array(rgb, np.float32) * mask[..., None] * k

mott = fbm(pos, 22, 4, 1)
tint(np.clip((mott - .45) * 1.6, 0, 1), [1.04, .95, .93], .55)       # blotchy warmth
tint(np.clip((fbm(pos, 9, 3, 2) - .5) * 2, 0, 1), [.96, .97, 1.0], .4)  # cooler patches
flush = [1.08, .86, .82]
for s, sg in ((L, 1), (R, -1)):
    tint(blob(hc + np.array([.045 * sg, -.05, .075]), .028), flush, .6)       # cheeks
    tint(blob(hc + np.array([.078 * sg, -.01, -.005]), .028), flush, .7)       # ears
    tint(blob(J[s + 'ForeArm'], .045), [1.05, .9, .87], .5)                    # elbows
    tint(blob(J[s + 'Leg'], .06), [1.05, .9, .87], .5)                          # knees
    tint(blob(J[s + 'Hand'] + (JT[s + 'Hand'] - J[s + 'Hand']) * 1.0, .05), [1.06, .88, .85], .55)   # knuckles
    tint(blob(J[s + 'Foot'] + np.array([0, -.04, .05]), .07), [1.04, .9, .88], .5)
    tint(blob(J[s + 'Arm'] + np.array([-.03 * sg, -.06, 0]), .05), [.88, .84, .82], .5)   # armpit
    # faint veins on the forearm and the back of the hand
    fa, ha = J[s + 'ForeArm'], J[s + 'Hand']
    t = np.clip(np.sum((pos - fa) * (ha - fa), axis=2) / np.sum((ha - fa) ** 2), 0, 1.15)
    near = np.linalg.norm(pos - (fa + t[..., None] * (ha - fa)), axis=2) < .07
    vein = np.abs(fbm(pos, 26, 2, 13 + (sg > 0)) - .5) < .022
    tint(near * vein * (t > .25), [.86, .9, 1.02], .55)
tint(blob(hc + np.array([0, -.035, .1]), .02), flush, .55)        # nose
tint(on_head * smooth(.1, .4, -fwd) * 0, [1, 1, 1], 0)
tint(smooth(.15, .6, lips), [.96, .74, .72], .85)
tint(smooth(.15, .6, mpfb('mpfb_aureolae.jpg')), [.78, .58, .52], .9)
tint(smooth(.15, .6, mpfb('mpfb_eyelids.jpg')), [.92, .8, .8], .5)
tint(smooth(.1, .5, mpfb('mpfb_fingernails.jpg') + mpfb('mpfb_toenails.jpg')), [1.12, 1.0, .98], .8)
tint(smooth(.1, .5, mpfb('mpfb_crotch.jpg') + mpfb('mpfb_genitals.jpg')), [.82, .72, .7], .7)
tint(scalp, [.93, .9, .92], .6)   # shaved scalp has a slightly blue-grey cast even before hair
tint(beard, [.9, .88, .9], .5)
# freckles / small marks
spots = vnoise(pos, 260, 21) > .93
tint(spots * (fbm(pos, 5, 2, 22) > .5), [.85, .72, .66], .35)

# ---------------------------------------------------------------- cavity: concave creases darken (from mesh curvature)
import collections
nv = len(P)
lap = np.zeros((nv, 3)); cnt = np.zeros(nv)
for a, b in ((0, 1), (1, 2), (2, 0)):
    np.add.at(lap, I[:, a], P[I[:, b]]); np.add.at(cnt, I[:, a], 1)
    np.add.at(lap, I[:, b], P[I[:, a]]); np.add.at(cnt, I[:, b], 1)
lap = lap / np.maximum(cnt, 1)[:, None] - P
curv = np.sum(lap * N, axis=1)       # >0 concave
cv = np.zeros((S, S), np.float32)
# splat per-vertex curvature through the same raster (cheap: reuse barycentric by re-rasterizing scalar)
for t in I:
    a, b, c = uvp[t]
    x0, y0 = np.floor(np.minimum(np.minimum(a, b), c)).astype(int)
    x1, y1 = np.ceil(np.maximum(np.maximum(a, b), c)).astype(int)
    x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, S - 1), min(y1, S - 1)
    if x1 < x0 or y1 < y0:
        continue
    xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + .5, np.arange(y0, y1 + 1) + .5)
    den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
    if abs(den) < 1e-12:
        continue
    w0 = ((b[1] - c[1]) * (xs - c[0]) + (c[0] - b[0]) * (ys - c[1])) / den
    w1 = ((c[1] - a[1]) * (xs - c[0]) + (a[0] - c[0]) * (ys - c[1])) / den
    w2 = 1 - w0 - w1
    m = (w0 >= -.02) & (w1 >= -.02) & (w2 >= -.02)
    cv[ys[m].astype(int), xs[m].astype(int)] = w0[m] * curv[t[0]] + w1[m] * curv[t[1]] + w2[m] * curv[t[2]]
cav = np.clip(cv / (np.percentile(np.abs(cv[cov]), 97) + 1e-9), 0, 1)
cav = np.asarray(Image.fromarray((cav * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(S / 512)), np.float32) / 255

# ---------------------------------------------------------------- height: pores, fine wrinkles, creases
pores = 1 - np.clip((vnoise(pos, 900, 31) - .35) * 3, 0, 1)                  # small pits
fine = fbm(pos, 380, 2, 33)
h = .3 * pores * (1 - .6 * scalp) + .18 * fine + .35 * fbm(pos, 70, 3, 35)
# horizontal brow lines and neck creases
brow = on_head * (fwd > .45) * smooth(hc[1] + .005, hc[1] + .02, pos[..., 1]) * (1 - smooth(hc[1] + .05, hc[1] + .07, pos[..., 1]))
h -= .35 * brow * (np.sin(pos[..., 1] * 520 + fbm(pos, 30, 2, 40) * 6) > .75)
neckband = (pos[..., 1] > neck[1] - .02) & (pos[..., 1] < head[1] + .01) & (dist_h < hr * 2)
h -= .3 * neckband * (np.sin(pos[..., 1] * 260 + fbm(pos, 20, 2, 41) * 5) > .85)
for s in (L, R):   # knuckle wrinkles across the finger joints
    for f in ('Index', 'Middle', 'Ring', 'Pinky'):
        for k in (1, 2, 3):
            n = s + 'Hand' + f + str(k)
            if n in J:
                h -= .45 * blob(J[n], .011) * (np.sin(np.linalg.norm(pos - J[n], axis=2) * 900) > .3)
h -= .25 * cav
h = np.where(cov, h, np.nan)

# dilate everything past the uv islands so mip-mapping and filtering never pick up black
def dilate(a, it=8):
    a = a.copy()
    msk = ~np.isnan(a[..., 0] if a.ndim == 3 else a)
    for _ in range(it):
        acc = np.zeros_like(np.nan_to_num(a)); c = np.zeros(msk.shape)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sh = np.roll(np.roll(np.nan_to_num(a), dy, 0), dx, 1)
            sm = np.roll(np.roll(msk, dy, 0), dx, 1)
            acc += sh * (sm[..., None] if a.ndim == 3 else sm); c += sm
        new = ~msk & (c > 0)
        fill = acc / np.maximum(c, 1)[..., None] if a.ndim == 3 else acc / np.maximum(c, 1)
        a[new] = fill[new]; msk = msk | new
    return np.nan_to_num(a, nan=np.nanmean(a) if a.ndim == 2 else 1)

col = np.where(cov[..., None], col, np.nan)
col = dilate(col, 10)
h = dilate(h, 10)
# normal map from the height field (in uv space; three.js builds the tangent frame from uv derivatives)
k = 1.7
gy, gx = np.gradient(h)
nm = np.stack([-gx * k, gy * k, np.ones_like(h)], 2)
nm /= np.linalg.norm(nm, axis=2, keepdims=True)
masks = np.stack([np.where(cov, scalp, 0), np.where(cov, beard, 0), np.where(cov, cav, 0), np.where(cov, brows, 0)], 2)
masks = dilate(np.where(cov[..., None], masks, np.nan), 10)

os.makedirs(OUT, exist_ok=True)
Image.fromarray((np.clip(col / 1.15, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, 'skin_d.jpg'), quality=88)
Image.fromarray(((nm * .5 + .5) * 255).astype(np.uint8)).save(os.path.join(OUT, 'skin_n.jpg'), quality=82)
Image.fromarray((np.clip(masks, 0, 1) * 255).astype(np.uint8), 'RGBA').resize((S // 2, S // 2), Image.BILINEAR).save(os.path.join(OUT, 'skin_m.png'), optimize=True)
# the same masks per vertex (scalp, beard, brows), for the hair shells the game grows on the head
px = np.clip((UV[:, 0] * S).astype(int), 0, S - 1); py = np.clip(((1 - UV[:, 1]) * S).astype(int), 0, S - 1)
vm = np.stack([scalp[py, px] * cov[py, px], beard[py, px] * cov[py, px], brows[py, px] * cov[py, px]], 1)
d['vmask'] = np.round(vm, 3).ravel().tolist()
json.dump(d, open(SRC, 'w'))
print('baked', S, [os.path.getsize(os.path.join(OUT, f)) for f in ('skin_d.jpg', 'skin_n.jpg', 'skin_m.png')])
