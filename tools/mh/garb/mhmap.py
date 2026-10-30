# rebuild build_mh.py's render-vertex order: for each body vertex in fighters.json, its MakeHuman base-mesh vertex index
import os
import json,os,numpy as np
SC=os.environ.get('MH_SRC','src')+'/'
MH=SC+'mh/mh/makehuman/data';MPFB=SC+'mh/mpfb/src/mpfb/data'
def load_obj(path):
    V,VT,F,FT,G=[],[],[],[],[];g=None
    for line in open(path):
        if line.startswith('v '):V.append([float(x) for x in line.split()[1:4]])
        elif line.startswith('vt '):VT.append([float(x) for x in line.split()[1:3]])
        elif line.startswith('g '):g=line.split()[1]
        elif line.startswith('f '):
            a=[p.split('/') for p in line.split()[1:]];F.append([int(p[0])-1 for p in a]);FT.append([int(p[1])-1 if len(p)>1 and p[1] else -1 for p in a]);G.append(g)
    return np.array(V),np.array(VT),F,FT,G
def build():
    V0,VT,F,FT,G=load_obj(MH+'/3dobjs/base.obj')
    groups=json.load(open(MPFB+'/mesh_metadata/basemesh_vertex_groups.json'))
    body=set();[body.update(range(a,b+1)) for a,b in groups['body']]
    key={};rv_v=[];rv_t=[]
    for i,f in enumerate(F):
        if G[i]!='body' or not all(v in body for v in f):continue
        for v,vt in zip(f,FT[i]):
            k=(v,vt)
            if k not in key:key[k]=len(rv_v);rv_v.append(v);rv_t.append(vt)
    return np.array(rv_v),VT[np.array(rv_t)],V0
if __name__=='__main__':
    rv,uv,V0=build();d=np.load(SC+'garb/body_A.npz');print(len(rv),d['P'].shape,np.abs(uv-d['UV']).max())
    np.save(SC+'garb/rv_v.npy',rv)
