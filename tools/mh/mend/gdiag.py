import os
PARTS=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../assets/mhparts'))+'/'
import numpy as np,sys
from scipy.spatial import cKDTree
from parts import read
from body import load
def dense_body(b,n=200000,seed=1):
    B=load(b);P=B['P'];N=B['N'];N=N/np.linalg.norm(N,axis=1,keepdims=True);I=B['I'];rng=np.random.default_rng(seed)
    a,bb,c=P[I[:,0]],P[I[:,1]],P[I[:,2]];ar=np.linalg.norm(np.cross(bb-a,c-a),axis=1)*.5;ti=rng.choice(len(I),n,p=ar/ar.sum());u=rng.random(n);v=rng.random(n);fl=u+v>1;u[fl]=1-u[fl];v[fl]=1-v[fl]
    pts=a[ti]+(bb[ti]-a[ti])*u[:,None]+(c[ti]-a[ti])*v[:,None];nn=N[I[ti,0]]*(1-u-v)[:,None]+N[I[ti,1]]*u[:,None]+N[I[ti,2]]*v[:,None];nn/=np.linalg.norm(nn,axis=1,keepdims=True);return pts,nn
def analyse(gid,b):
    H,A=read(PARTS+'%s.bin'%gid);V=A[b+'pos'].astype(np.float64);T=A[b+'index'].astype(np.int64)
    fn=np.cross(V[T[:,1]]-V[T[:,0]],V[T[:,2]]-V[T[:,0]]);fa=np.linalg.norm(fn,axis=1);fn/=fa[:,None]+1e-12
    # edges -> faces
    E={}
    for f,(i,j,k) in enumerate(T):
        for a_,b_ in((i,j),(j,k),(k,i)):E.setdefault((min(a_,b_),max(a_,b_)),[]).append(f)
    bnd=[e for e,fs in E.items() if len(fs)==1];nonman=[e for e,fs in E.items() if len(fs)>2]
    dih=[];bad_e=[]
    for e,fs in E.items():
        if len(fs)==2:
            d=fn[fs[0]]@fn[fs[1]]
            if d<-.2:bad_e.append(e)
    el=np.array([np.linalg.norm(V[a_]-V[b_]) for a_,b_ in E.keys()])
    DP,DN=dense_body(b);tr=cKDTree(DP);d,j=tr.query(V);s=np.einsum('ij,ij->i',V-DP[j],DN[j])
    vn=np.zeros_like(V);np.add.at(vn,T[:,0],fn*fa[:,None]);np.add.at(vn,T[:,1],fn*fa[:,None]);np.add.at(vn,T[:,2],fn*fa[:,None]);vn/=np.linalg.norm(vn,axis=1,keepdims=True)+1e-12
    out=np.einsum('ij,ij->i',vn,DN[j])
    bv=np.unique(np.array(bad_e).reshape(-1)) if bad_e else np.array([],int)
    print(gid,b,'verts',len(V),'tris',len(T),'boundary edges',len(bnd),'non-manifold',len(nonman),'| folded edges (faces >100 deg apart)',len(bad_e),'| edge len median %.4f p99 %.4f max %.4f'%(np.median(el),np.percentile(el,99),el.max()),'| inside body',int((s<-.001).sum()),'| normal against body',int((out<-.2).sum()))
    if len(bv):
        p=V[bv];print('   folded verts',len(bv),'bbox',p.min(0).round(2),p.max(0).round(2));
        for nm,m in (('shoulder/neck y>1.38',p[:,1]>1.38),('arms |x|>.25',np.abs(p[:,0])>.25),('torso',(p[:,1]<=1.38)&(np.abs(p[:,0])<=.25))):print('     ',nm,int(m.sum()))
    return V,T,E,bad_e,s,out
if __name__=='__main__':
    for gid in sys.argv[1].split(','):
        for b in 'ABCD':analyse(gid,b)
