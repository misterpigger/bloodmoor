import os
PARTS=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../assets/mhparts'))+'/'
import numpy as np,sys
from parts import read
from body import load
def wmat(A,b,nb):
    si=A[b+'si'].astype(int);sw=A[b+'sw'].astype(np.float64)/255;sw/=sw.sum(1,keepdims=True)+1e-12;W=np.zeros((len(si),nb))
    for k in range(4):np.add.at(W,(np.arange(len(si)),si[:,k]),sw[:,k])
    return W
def edges(T):
    E=np.concatenate([T[:,[0,1]],T[:,[1,2]],T[:,[2,0]]]);E.sort(1);return np.unique(E,axis=0)
if __name__=='__main__':
    gid=sys.argv[1]
    H,A=read(PARTS+'%s.bin'%gid)
    for b in 'ABCD':
        names=list(load(b)['names']);W=wmat(A,b,len(names));V=A[b+'pos'];T=A[b+'index'].astype(int);E=edges(T)
        d=np.abs(W[E[:,0]]-W[E[:,1]]).sum(1)/2
        bad=E[d>.45];print(gid,b,'edges',len(E),'weight jump >.45:',len(bad),' >.25:',int((d>.25).sum()),'max %.2f'%d.max())
        if len(bad):
            p=V[bad.reshape(-1)];print('   bbox',p.min(0).round(2),p.max(0).round(2))
            for e in bad[:6]:
                i,j=e;ti=np.argsort(-W[i])[:3];tj=np.argsort(-W[j])[:3]
                print('   ',V[i].round(3),[(names[k],round(W[i,k],2)) for k in ti if W[i,k]>.02],'|',V[j].round(3),[(names[k],round(W[j,k],2)) for k in tj if W[j,k]>.02])
