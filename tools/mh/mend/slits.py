import os
PARTS=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../assets/mhparts'))+'/'
import numpy as np,sys
from scipy.spatial import cKDTree
from parts import read
from gpose import base_tris
def loops(V,T,n0):
    Tb=T[(T<n0).all(1)];E=np.concatenate([Tb[:,[0,1]],Tb[:,[1,2]],Tb[:,[2,0]]]);Es=np.sort(E,1);ue,inv,c=np.unique(Es,axis=0,return_inverse=True,return_counts=True)
    bmask=c[inv]==1;be=E[bmask]   # directed boundary edges
    nxt={};[nxt.setdefault(a,[]).append(b) for a,b in be]
    seen=set();L=[]
    for s in list(nxt):
        if s in seen:continue
        lp=[];x=s
        while x not in seen and x in nxt:
            seen.add(x);lp.append(x);x=nxt[x][0]
        L.append(lp)
    return L
def find_slits(V,L,near=.009,far=6):
    out=[]
    for lp in L:
        n=len(lp)
        if n<12:continue
        P=V[lp];t=cKDTree(P);pairs=t.query_pairs(near)
        for i,j in pairs:
            d=min(abs(i-j),n-abs(i-j))
            if d>=far:out.append((lp[i],lp[j],d))
    return out
if __name__=='__main__':
    for gid in sys.argv[1].split(','):
        H,A=read((sys.argv[2] if len(sys.argv)>2 else PARTS)+gid+'.bin')
        for b in 'ABCD':
            V=A[b+'pos'].astype(np.float64);T=A[b+'index'].astype(np.int64);n0=int(base_tris(T,len(V)).sum());L=loops(V,T,n0);S=find_slits(V,L)
            vs=np.unique(np.array([[a,b_] for a,b_,d in S]).reshape(-1)) if S else np.array([],int)
            print(gid,b,'loops',[len(l) for l in L if len(l)>=6],'slit pairs',len(S),'verts',len(vs),('bbox %s %s'%(V[vs].min(0).round(2),V[vs].max(0).round(2))) if len(vs) else '')
