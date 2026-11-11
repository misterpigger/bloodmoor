# Draped garments, mended (Build 201). The cloth simulation left the shoulders and collar of every garment wrinkled and standing well off
# the skin; skinned from the T-pose to arms-down, that loose, creased cloth folds over itself across the front of the shoulder (a crack)
# and the rolled hem round the neck kinks into horns. Here, round each shoulder and the collar, the cloth is drawn in to an even 7-12 mm
# off the skin and smoothed, the neck's edge is evened along its length, and the rolled hems are rebuilt on the mended edge.
#   python3 gfix.py shirt cote doublet aketon      (reads and rewrites assets/mhparts/<id>.bin; SRC=dir to read originals from)
import numpy as np,sys,os
from scipy.spatial import cKDTree
from scipy.sparse import coo_matrix,diags
from parts import read,write
from body import load
from pose import skel
from gdiag import dense_body
PARTS=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../assets/mhparts'))+'/'
def sstep(a,b,x):t=np.clip((x-a)/(b-a),0,1);return t*t*(3-2*t)
def vnormals(V,T):
    fn=np.cross(V[T[:,1]]-V[T[:,0]],V[T[:,2]]-V[T[:,0]]);vn=np.zeros_like(V)
    for k in range(3):np.add.at(vn,T[:,k],fn)
    return vn/(np.linalg.norm(vn,axis=1,keepdims=True)+1e-12)
def seg_dist(P,a,b):
    ab=b-a;t=np.clip(((P-a)@ab)/(ab@ab),0,1);return np.linalg.norm(P-(a+t[:,None]*ab),axis=1)
def wmat(si,sw,nb):
    sw=sw.astype(np.float64)/255;sw/=sw.sum(1,keepdims=True)+1e-12;W=np.zeros((len(si),nb))
    for k in range(4):np.add.at(W,(np.arange(len(si)),si[:,k].astype(int)),sw[:,k])
    return W
def top4(W):
    idx=np.argsort(-W,1)[:,:4];w=np.take_along_axis(W,idx,1);w/=w.sum(1,keepdims=True);q=np.round(w*255).astype(int);q[:,0]+=255-q.sum(1);return idx.astype(np.uint8),q.astype(np.uint8)
def mend(V,T,b,si,sw,log=print):
    V=V.astype(np.float64).copy();nv=len(V);n0=None
    # the cloth is the largest connected piece (a prefix of the vertices); the hems are rings of six after it
    par=np.arange(nv)
    def find(x):
        while par[x]!=x:par[x]=par[par[x]];x=par[x]
        return x
    for a_,b_,c_ in T:
        ra,rb,rc=find(a_),find(b_),find(c_);par[rb]=ra;par[rc]=ra
    root=np.array([find(i) for i in range(nv)]);u,c=np.unique(root,return_counts=True);isb=root==u[np.argmax(c)];n0=int(isb.sum());assert isb[:n0].all() and (nv-n0)%6==0
    Tb=T[(T<n0).all(1)];V0=V.copy()
    # boundary of the cloth
    E=np.concatenate([Tb[:,[0,1]],Tb[:,[1,2]],Tb[:,[2,0]]]);Es=np.sort(E,1);ue,cnt=np.unique(Es,axis=0,return_counts=True);be=ue[cnt==1]
    nb=[[] for _ in range(n0)]
    for a_,b_ in be:nb[a_].append(b_);nb[b_].append(a_)
    isbd=np.array([len(x)>0 for x in nb])
    names,BW,jp=skel(b);J=lambda n:BW[names.index(n)][:3,3];W=wmat(si,sw,len(names))
    # slits: where the neck was cut open the cut sometimes ran on down the shoulder as a hairpin in the cloth's edge. Its two sides lie
    # together in the T-pose and gape when the arm comes down, the rolled hem standing up along them like horns. Zip each one shut: from
    # the hairpin's tip outward the two sides are paired off, brought to their midpoint and given the same weights
    dirE=E[cnt[np.unique(Es,axis=0,return_inverse=True)[1]]==1];nx={a_:b_ for a_,b_ in dirE};zipped=np.zeros(n0,bool);nz=0
    seen=set()
    for s0 in list(nx):
        if s0 in seen:continue
        lp=[];x=s0
        while x not in seen and x in nx:seen.add(x);lp.append(x);x=nx[x]
        n=len(lp)
        if n<16:continue
        P=V[lp].copy();up=(P[:,1]>J('Spine2')[1]+.06)&(np.abs(P[:,0])<.22)
        if not up.any():continue
        # two stretches of the same edge lying within 9 mm of each other, six or more vertices apart along it: the sides of a slit.
        # Its tip is half way between them along the edge
        tips={}
        for i,j in cKDTree(P).query_pairs(.009):
            d=j-i
            if d>n/2:i,j=j,i+n;d=j-i
            if d<6 or d>60 or not(up[i%n] and up[j%n]):continue
            m=((i+j)//2)%n;key=min(tips,key=lambda t:min(abs(t-m),n-abs(t-m))) if tips else None
            if key is not None and min(abs(key-m),n-abs(key-m))<=4:tips[key]=max(tips[key],d)
            else:tips[m]=d
        for m,dm in tips.items():
            k=1;did=0
            while k<=30 and 2*k<n-2:
                i,j=lp[(m-k)%n],lp[(m+k)%n];d=np.linalg.norm(V[i]-V[j])
                if d>(.03 if k<4 else .046) or zipped[i] or zipped[j]:break
                mid=.5*(V[i]+V[j]);V[i]=mid;V[j]=mid;w=.5*(W[i]+W[j]);W[i]=w;W[j]=w;zipped[i]=zipped[j]=True;k+=1;did+=1
            if did>2:zipped[lp[m]]=True;nz+=1
    # body under the cloth
    DP,DN=dense_body(b);tr=cKDTree(DP)
    def under(P):
        d,j=tr.query(P,k=6);w=1/(d+1e-4)**2;w/=w.sum(1,keepdims=True);q=(DP[j]*w[...,None]).sum(1);n=(DN[j]*w[...,None]).sum(1);n/=np.linalg.norm(n,axis=1,keepdims=True);return q,n
    reg=np.zeros(n0)
    for s in('Left','Right'):
        S,Aj,Fj=J(s+'Shoulder'),J(s+'Arm'),J(s+'ForeArm');ext=Aj+(Fj-Aj)/np.linalg.norm(Fj-Aj)*.09
        d=np.minimum(seg_dist(V[:n0],S,Aj),seg_dist(V[:n0],Aj,ext));reg=np.maximum(reg,1-sstep(.085,.165,d))
    neck=isbd&~zipped&(V[:n0,1]>J('Spine2')[1]+.06)&(np.abs(V[:n0,0])<.2)        # the collar's edge
    # rings out from the collar: the cloth near it is drawn in too
    A=coo_matrix((np.ones(len(ue)*2),(np.r_[ue[:,0],ue[:,1]],np.r_[ue[:,1],ue[:,0]])),shape=(n0,n0)).tocsr()
    near=neck.astype(float);x=near.copy()
    for k in range(5):x=np.clip(A@x,0,1);near=np.maximum(near,x*(1-.17*(k+1)))
    reg=np.maximum(reg,near*.9)
    # draw the cloth in to an even clearance, then smooth it there
    q,n=under(V[:n0]);s=np.einsum('ij,ij->i',V[:n0]-q,n);tgt=q+n*np.clip(s,.007,.012)[:,None]
    V[:n0]+=(tgt-V[:n0])*reg[:,None]
    deg=np.asarray(A.sum(1)).ravel();deg[deg==0]=1;M=diags(1/deg)@A
    Bn=coo_matrix((np.ones(len(be)*2),(np.r_[be[:,0],be[:,1]],np.r_[be[:,1],be[:,0]])),shape=(n0,n0)).tocsr();bdeg=np.asarray(Bn.sum(1)).ravel();bdeg[bdeg==0]=1;MB=diags(1/bdeg)@Bn
    isbd=isbd&~zipped        # a zipped seam is cloth like any other now
    lam=.55*reg;lamb=np.where(neck,.5,.5*reg)        # the collar's whole edge is evened; other edges only inside the shoulder's reach
    for it in range(14):
        P=V[:n0];L=M@P-P;LB=MB@P-P
        mv=np.where(isbd[:,None],LB*lamb[:,None],L*lam[:,None]);P=P+mv
        if it%2==1:P=P-(np.where(isbd[:,None],(MB@P-P)*lamb[:,None],(M@P-P)*lam[:,None]))*.35      # a little back, so it doesn't shrink
        q,n=under(P);s=np.einsum('ij,ij->i',P-q,n);lo=np.where(reg>.05,.0065,.004);push=np.clip(lo-s,0,None);P=P+n*push[:,None]
        hi=.013+.03*(1-reg);over=np.clip(s-hi,0,None)*(reg>.3);P=P-n*over[:,None]
        V[:n0]=P
    # the rolled hems, rebuilt ring by ring on the edge as it is now
    N0=vnormals(V0[:n0],Tb);N1=vnormals(V[:n0],Tb);bi=np.flatnonzero(isbd);bt=cKDTree(V0[bi]);r=.0042;ang=np.linspace(0,2*np.pi,6,endpoint=False);moved=0
    for ri in range((nv-n0)//6):
        ids=n0+ri*6+np.arange(6);R=V0[ids];cen=R.mean(0);src=bi[bt.query(cen)[1]]
        if zipped[src]:V[ids]=V[src]-N1[src]*.003;continue          # no hem along a seam that has been zipped: its ring is folded away under the cloth
        if len(nb[src])!=2:V[ids]=R+(V[src]-V0[src]);continue
        on=(R[0]-R[3]);on/=np.linalg.norm(on)+1e-12;ob=(R[1]+R[2]-R[4]-R[5]);ob/=np.linalg.norm(ob)+1e-12;ot=np.cross(on,ob)
        a_,b_=nb[src];t=V[b_]-V[a_];t/=np.linalg.norm(t)+1e-12
        if t@ot<0:t=-t
        nn=N1[src]*(1 if N0[src]@on>=0 else -1);nn=nn-t*(nn@t);nn/=np.linalg.norm(nn)+1e-12;bb=np.cross(t,nn)
        V[ids]=V[src]+r*(np.cos(ang)[:,None]*nn+np.sin(ang)[:,None]*bb)-nn*r*.6;moved+=1
    # weights evened over the mended cloth: along the collar, neighbours a few hundredths apart in their shoulder's share drew the edge
    # as a saw when the shoulder was raised
    Wd=W.copy();m=np.clip(reg*1.5,0,1)
    for _ in range(14):Wd[:n0]=Wd[:n0]+(.5*m)[:,None]*(M@Wd[:n0]-Wd[:n0])
    Wd/=Wd.sum(1,keepdims=True)
    # zipped pairs share one weight again after the evening
    zt=cKDTree(V[:n0][zipped]) if zipped.any() else None
    if zt is not None:
        zi=np.flatnonzero(zipped);pr=zt.query_pairs(1e-6)
        for i,j in pr:w=.5*(Wd[zi[i]]+Wd[zi[j]]);Wd[zi[i]]=w;Wd[zi[j]]=w
    for ri in range((nv-n0)//6):
        ids=n0+ri*6+np.arange(6);src=bi[bt.query(V0[ids].mean(0))[1]];Wd[ids]=Wd[src]
    nsi,nsw=top4(Wd)
    Nn=vnormals(V,T)
    log('  %s: %d cloth verts, %d in the shoulders/collar (>.3), moved mean %.1f mm max %.1f mm; %d hem rings rebuilt; %d slits zipped (%d verts)'%(b,n0,int((reg>.3).sum()),np.linalg.norm(V[:n0]-V0[:n0],axis=1)[reg>.3].mean()*1000,np.linalg.norm(V[:n0]-V0[:n0],axis=1).max()*1000,moved,nz,int(zipped.sum())))
    return V.astype(np.float32),np.round(np.clip(Nn,-1,1)*127).astype(np.int8),nsi,nsw
if __name__=='__main__':
    SRC=os.environ.get('SRC',PARTS)
    for gid in sys.argv[1:]:
        H,A=read(SRC+gid+'.bin');print(gid)
        for b in H['builds']:
            V,Nn,nsi,nsw=mend(A[b+'pos'],A[b+'index'].astype(np.int64),b,A[b+'si'],A[b+'sw']);A[b+'pos']=V;A[b+'nor']=Nn;A[b+'si']=nsi;A[b+'sw']=nsw
        write(os.environ.get('DST',PARTS)+gid+'.bin',H,A)
