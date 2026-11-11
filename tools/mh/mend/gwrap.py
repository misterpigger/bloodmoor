# carry a garment from one build's body onto another's (all four builds are the same mesh, vertex for vertex): each cloth vertex keeps
# its place over the body triangle under it (barycentric), its height off the skin and its small sideways offset in that triangle's
# own frame. Used where a build's own cloth simulation went wrong (the aketon on build A hung in tatters under the arms with a slit down
# the back; on C a cuff was torn).
#   python3 gwrap.py aketon D A C      (SRC / DST as gfix.py)
import numpy as np,sys,os
from scipy.spatial import cKDTree
from parts import read,write
from body import load
PARTS=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../assets/mhparts'))+'/'
def samples(B,n=400000,seed=2):
    P=B['P'];I=B['I'];rng=np.random.default_rng(seed);a,b,c=P[I[:,0]],P[I[:,1]],P[I[:,2]];ar=np.linalg.norm(np.cross(b-a,c-a),axis=1)*.5
    ti=rng.choice(len(I),n,p=ar/ar.sum());u=rng.random(n);v=rng.random(n);fl=u+v>1;u[fl]=1-u[fl];v[fl]=1-v[fl];return ti,u,v
def frame(B,ti,u,v):
    P=B['P'];N=B['N'];N=N/np.linalg.norm(N,axis=1,keepdims=True);I=B['I'];a,b,c=P[I[ti,0]],P[I[ti,1]],P[I[ti,2]]
    q=a+(b-a)*u[:,None]+(c-a)*v[:,None];n=N[I[ti,0]]*(1-u-v)[:,None]+N[I[ti,1]]*u[:,None]+N[I[ti,2]]*v[:,None];n/=np.linalg.norm(n,axis=1,keepdims=True)
    e1=b-a;e1-=n*np.einsum('ij,ij->i',e1,n)[:,None];e1/=np.linalg.norm(e1,axis=1,keepdims=True)+1e-12;e2=np.cross(n,e1);return q,n,e1,e2
def wrap(V,src,dst):
    Bs,Bd=load(src),load(dst);ti,u,v=samples(Bs);q,n,e1,e2=frame(Bs,ti,u,v);j=cKDTree(q).query(V)[1];d=V-q[j]
    h=np.einsum('ij,ij->i',d,n[j]);r1=np.einsum('ij,ij->i',d,e1[j]);r2=np.einsum('ij,ij->i',d,e2[j])
    q2,n2,f1,f2=frame(Bd,ti[j],u[j],v[j]);return (q2+n2*h[:,None]+f1*r1[:,None]+f2*r2[:,None]).astype(np.float32)
if __name__=='__main__':
    gid,src=sys.argv[1],sys.argv[2];SRC=os.environ.get('SRC',PARTS);H,A=read(SRC+gid+'.bin')
    for dst in sys.argv[3:]:
        for k in('si','sw','uv','index','loose','cov','nor'):
            if src+k in A:A[dst+k]=A[src+k].copy()
        A[dst+'pos']=wrap(A[src+'pos'].astype(np.float64),src,dst);H['builds'][dst]=H['builds'][src];print(gid,src,'->',dst,len(A[dst+'pos']),'verts')
    write(os.environ.get('DST',PARTS)+gid+'.bin',H,A)
