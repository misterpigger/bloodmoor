import os
PARTS=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../assets/mhparts'))+'/'
import numpy as np,sys
from parts import read
from body import load
from pose import deltas,skin,POSES,body_w
from wdiag import wmat
from gprev import render
from PIL import Image
def folded(V,T,th=-.2):
    fn=np.cross(V[T[:,1]]-V[T[:,0]],V[T[:,2]]-V[T[:,0]]);fn/=np.linalg.norm(fn,axis=1,keepdims=True)+1e-12
    E={}
    for f,(i,j,k) in enumerate(T):
        for a,b in((i,j),(j,k),(k,i)):E.setdefault((min(a,b),max(a,b)),[]).append(f)
    return [e for e,fs in E.items() if len(fs)==2 and fn[fs[0]]@fn[fs[1]]<th]
def base_tris(T,nv):
    # the cloth itself is the largest connected piece; the rolled hems are separate tubes
    par=np.arange(nv)
    def find(x):
        while par[x]!=x:par[x]=par[par[x]];x=par[x]
        return x
    for a,b,c in T:
        ra,rb,rc=find(a),find(b),find(c);par[rb]=ra;par[rc]=ra
    root=np.array([find(i) for i in range(nv)]);u,c=np.unique(root,return_counts=True);big=u[np.argmax(c)];return root==big
def run(gid,b,pose='down',A=None,tag='',S=420):
    if A is None:H,A=read(PARTS+'%s.bin'%gid)
    B=load(b);names,D=deltas(b,POSES[pose](1));V=A[b+'pos'].astype(np.float64);T=A[b+'index'].astype(np.int64);W=wmat(A,b,len(names))
    Vp=skin(V,W,D);Bp=skin(B['P'],body_w(B),D);isb=base_tris(T,len(V));Tb=T[isb[T[:,0]]]
    f0=folded(V,Tb);f1=folded(Vp,Tb);print(gid,b,pose,'folded edges on the cloth: bind',len(f0),'posed',len(f1))
    body={'P':Bp,'I':B['I']}
    vs=[(np.array([0,1.40,0]),.62,0,10),(np.array([0,1.40,0]),.62,180,10),(np.array([.17,1.45,0]),.34,35,35),(np.array([-.17,1.45,0]),.34,150,40),(np.array([.17,1.45,0]),.34,150,40)]
    ims=[render(Vp,T,body,c,w,S,y,p) for c,w,y,p in vs];sh=Image.new('RGB',(S*len(ims),S));[sh.paste(o,(i*S,0)) for i,o in enumerate(ims)];sh.save('gp_%s_%s_%s%s.jpg'%(gid,b,pose,tag),quality=90)
    return len(f1)
if __name__=='__main__':
    run(sys.argv[1],sys.argv[2],sys.argv[3] if len(sys.argv)>3 else 'down')
