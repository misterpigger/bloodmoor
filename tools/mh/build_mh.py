#!/usr/bin/env python3
"""Builds the MakeHuman (CC0) fighter bodies for Bloodmoor: base mesh + morph targets + the Mixamo rig and weights
from MPFB, written as plain arrays (mh_bodies.json) for the browser step (build.js) that binds them to the game's
X Bot skeleton and exports fighters.json. Also bakes the skin texture set from the mesh itself.

  python3 build_mh.py <makehuman repo>/makehuman/data <mpfb repo>/src/mpfb/data  out_dir

Everything used here is CC0 (MakeHuman assets, MPFB rigs and weights)."""
import sys, os, json, math, random
import numpy as np

MH, MPFB, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- base mesh
def load_obj(path):
    V, VT, F, FT, G = [], [], [], [], []
    g = None
    for line in open(path):
        if line.startswith('v '):
            V.append([float(x) for x in line.split()[1:4]])
        elif line.startswith('vt '):
            VT.append([float(x) for x in line.split()[1:3]])
        elif line.startswith('g '):
            g = line.split()[1]
        elif line.startswith('f '):
            a = [p.split('/') for p in line.split()[1:]]
            F.append([int(p[0]) - 1 for p in a])
            FT.append([int(p[1]) - 1 if len(p) > 1 and p[1] else -1 for p in a])
            G.append(g)
    return np.array(V), np.array(VT), F, FT, G

V0, VT, F, FT, G = load_obj(os.path.join(MH, '3dobjs/base.obj'))
groups = json.load(open(os.path.join(MPFB, 'mesh_metadata/basemesh_vertex_groups.json')))
def grp(name):
    out = []
    for a, b in groups[name]:
        out.extend(range(a, b + 1))
    return np.array(out)

def load_target(rel):
    d = np.zeros_like(V0)
    for line in open(os.path.join(MH, 'targets', rel)):
        if not line.strip() or line[0] == '#':
            continue
        p = line.split()
        d[int(p[0])] = [float(p[1]), float(p[2]), float(p[3])]
    return d

TC = {}
def T(rel):
    if rel not in TC:
        TC[rel] = load_target(rel)
    return TC[rel]

def macro(muscle, weight, race):
    """MakeHuman's macro mix for a young man: muscle and weight in 0..1 (0.5 average), race weights."""
    d = np.zeros_like(V0)
    def axis(v, lo, mid, hi):
        return [(lo, max(0, (.5 - v) * 2)), (mid, 1 - abs(v - .5) * 2), (hi, max(0, (v - .5) * 2))]
    for mn, mw in axis(muscle, 'minmuscle', 'averagemuscle', 'maxmuscle'):
        for wn, ww in axis(weight, 'minweight', 'averageweight', 'maxweight'):
            if mw * ww > 0:
                d += mw * ww * T('macrodetails/universal-male-young-%s-%s.target' % (mn, wn))
    for r, w in race.items():
        if w > 0:
            d += w * T('macrodetails/%s-male-young.target' % r)
    return d

def pairs(dirname):
    """target pairs (decr/incr, in/out ...) in a folder, as (negative, positive) file names"""
    fs = sorted(f for f in os.listdir(os.path.join(MH, 'targets', dirname)) if f.endswith('.target'))
    out = {}
    for f in fs:
        base, _, end = f[:-7].rpartition('-')
        out.setdefault(base, []).append(f)
    return [(dirname + '/' + v[0], dirname + '/' + v[1]) for v in out.values() if len(v) == 2]

FACE = pairs('nose') + pairs('chin') + pairs('mouth') + pairs('cheek') + pairs('forehead') + pairs('eyebrows') + pairs('ears') + pairs('head') + pairs('neck')

def face_variation(seed, amt):
    rnd = random.Random(seed)
    d = np.zeros_like(V0)
    for neg, pos in FACE:
        v = rnd.gauss(0, amt)
        if abs(v) < .05:
            continue
        d += abs(v) * T(pos if v > 0 else neg)
    return d

# a few bodies: same height (they share one skeleton), different build and face
BODIES = [
    dict(name='MH_Body_A', muscle=.68, weight=.48, race={'caucasian': 1}, seed=3, extra=[]),
    dict(name='MH_Body_B', muscle=.6, weight=.72, race={'caucasian': .8, 'asian': .2}, seed=11, extra=[]),
    dict(name='MH_Body_C', muscle=.75, weight=.5, race={'african': .85, 'caucasian': .15}, seed=29, extra=[]),
    dict(name='MH_Body_D', muscle=.55, weight=.38, race={'caucasian': .6, 'asian': .4}, seed=47, extra=[]),
]

HEIGHT = 1.78
body_idx = grp('body')
body_set = set(body_idx.tolist())
# faces wholly on the body
bf = [i for i, f in enumerate(F) if G[i] == 'body' and all(v in body_set for v in f)]

# ---------------------------------------------------------------- rig and weights
rig = json.load(open(os.path.join(MPFB, 'rigs/standard/rig.mixamo.json')))['bones']
wts = json.load(open(os.path.join(MPFB, 'rigs/standard/weights.mixamo.json')))['weights']
bones = sorted(rig)

def cube_center(V, name):
    return V[grp(name)].mean(0)

def joint(V, spec):
    if spec['strategy'] == 'CUBE':
        return cube_center(V, spec['cube_name'])
    return V[spec['vertex_indices']].mean(0)

# per vertex: top 4 bone weights
vw = [[] for _ in range(len(V0))]
for b, lst in wts.items():
    for vi, w in lst:
        vw[vi].append((w, b))

# ---------------------------------------------------------------- split into render vertices (position + uv pairs), triangulate
key = {}
rv_v, rv_t, tris = [], [], []
for fi in bf:
    f, t = F[fi], FT[fi]
    ids = []
    for v, vt in zip(f, t):
        k = (v, vt)
        if k not in key:
            key[k] = len(rv_v)
            rv_v.append(v)
            rv_t.append(vt)
        ids.append(key[k])
    for j in range(1, len(ids) - 1):
        tris.append([ids[0], ids[j], ids[j + 1]])
rv_v = np.array(rv_v)
rv_t = np.array(rv_t)
tris = np.array(tris)
print('render verts', len(rv_v), 'tris', len(tris))

skin_i, skin_w = [], []
for v in rv_v:
    l = sorted(vw[v], reverse=True)[:4]
    s = sum(w for w, _ in l) or 1
    l = l + [(0, 'mixamorig:Hips')] * (4 - len(l))
    skin_i.append([b for _, b in l])
    skin_w.append([w / s for w, _ in l])

uv = VT[rv_t]

def normals(P, tris):
    n = np.zeros_like(P)
    a, b, c = P[tris[:, 0]], P[tris[:, 1]], P[tris[:, 2]]
    fn = np.cross(b - a, c - a)
    for k in range(3):
        np.add.at(n, tris[:, k], fn)
    # weld normals across uv seams: average over the same position index
    acc = np.zeros((len(V0), 3))
    np.add.at(acc, rv_v, n)
    n = acc[rv_v]
    return n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-12)

# ---------------------------------------------------------------- eyes (high-poly proxy fitted with its mhclo)
def load_mhclo(path):
    ref, scl = [], {}
    on = False
    for line in open(path):
        p = line.split()
        if not p or p[0].startswith('#'):
            continue
        if p[0] in ('x_scale', 'y_scale', 'z_scale'):
            scl[p[0][0]] = (int(p[1]), int(p[2]), float(p[3]))
        elif p[0] == 'verts':
            on = True
        elif on and len(p) == 9:
            ref.append([float(x) for x in p])
        elif on and len(p) == 1:
            ref.append([int(p[0]), 0, 0, 1, 0, 0, 0, 0, 0])
    return np.array(ref), scl

def fit_proxy(V, ref, scl):
    s = np.array([abs(V[scl[a][0]][i] - V[scl[a][1]][i]) / scl[a][2] for i, a in enumerate('xyz')])
    idx = ref[:, :3].astype(int)
    w = ref[:, 3:6]
    off = ref[:, 6:9] * s
    return (V[idx] * w[:, :, None]).sum(1) + off

eyeV, eyeVT, eyeF, eyeFT, _ = load_obj(os.path.join(MH, 'eyes/high-poly/high-poly.obj'))
eref, escl = load_mhclo(os.path.join(MH, 'eyes/high-poly/high-poly.mhclo'))
ekey = {}
e_v, e_t, e_tris = [], [], []
for f, t in zip(eyeF, eyeFT):
    ids = []
    for v, vt in zip(f, t):
        k = (v, vt)
        if k not in ekey:
            ekey[k] = len(e_v)
            e_v.append(v)
            e_t.append(vt)
        ids.append(ekey[k])
    for j in range(1, len(ids) - 1):
        e_tris.append([ids[0], ids[j], ids[j + 1]])
e_v = np.array(e_v)
e_t = np.array(e_t)

out = {'bones': bones, 'parents': {b: rig[b]['parent'] for b in bones}, 'bodies': [],
       'uv': np.round(uv, 5).ravel().tolist(), 'index': tris.ravel().tolist(),
       'skinIndex': [bones.index(b) for row in skin_i for b in row], 'skinWeight': np.round(np.array(skin_w), 4).ravel().tolist(),
       'eyes': {'uv': np.round(eyeVT[e_t], 5).ravel().tolist(), 'index': np.array(e_tris).ravel().tolist()}}

for B in BODIES:
    V = V0 + macro(B['muscle'], B['weight'], B['race']) + face_variation(B['seed'], .28)
    # stand it on the ground and bring every body to the same height, so they can share one skeleton
    vb = V[body_idx]
    lo, hi = vb[:, 1].min(), vb[:, 1].max()
    c = np.array([0, lo, 0])
    V = (V - c) * (HEIGHT * 10 / (hi - lo))
    P = V[rv_v] * .1   # decimetres -> metres
    N = normals(P, tris)
    J = {b: (joint(V, rig[b]['head']) * .1).round(5).tolist() for b in bones}
    JT = {b: (joint(V, rig[b]['tail']) * .1).round(5).tolist() for b in bones}
    EP = fit_proxy(V, eref, escl)[e_v] * .1
    out['bodies'].append({'name': B['name'], 'pos': P.round(5).ravel().tolist(), 'nor': N.round(4).ravel().tolist(),
                          'heads': J, 'tails': JT, 'eyes': EP.round(5).ravel().tolist()})
    print(B['name'], 'height', round(P[:, 1].max() - P[:, 1].min(), 3), 'hips', J['mixamorig:Hips'])

json.dump(out, open(os.path.join(OUT, 'mh_bodies.json'), 'w'))
print('wrote', os.path.join(OUT, 'mh_bodies.json'), os.path.getsize(os.path.join(OUT, 'mh_bodies.json')))
