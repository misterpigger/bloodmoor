# draped garments (gar_<g>_<b>.npz from bl_garment.py) -> assets/mhparts/<g>.bin like the other parts, but with per-build topology:
# each build's mesh is its own (the drape differs), so uv and index are per build too. Skin weights from the nearest body vertices;
# below the hips a skirt's weights go to the hips and both thighs (more its own side), so it hangs round both legs; aLoose 0..1 for sway.
import os
import sys,os,json,struct,numpy as np
sys.path.insert(0,'$(dirname $0)')
from proxies import BODY,TREE,skin,normals,OUT
SC=os.environ.get('GARB_WORK','work')+'/'
def smooth_edges(V,F,it=16):
    # open edges (hem, cuffs, neck) laid smooth along their own line: the sim and the decimation leave them ragged
    from collections import defaultdict
    ec=defaultdict(int)
    for t in F:
        for a,b in ((t[0],t[1]),(t[1],t[2]),(t[2],t[0])):ec[(min(a,b),max(a,b))]+=1
    nb=defaultdict(list)
    for (a,b),c in ec.items():
        if c==1:nb[a].append(b);nb[b].append(a)
    V=V.copy();ks=[k for k,v in nb.items() if len(v)==2]
    for n_ in range(it*2):   # Taubin: shrink then grow, so a hem doesn't pull in like a drawstring
        lam=.5 if n_%2==0 else -.53;V2=V.copy()
        for k in ks:a,b=nb[k];V2[k]=V[k]+lam*((V[a]+V[b])*.5-V[k])
        V=V2
    return V
def cover(b,V,F):
    # body vertices hidden under the garment (so skin can't poke through it when the two bend a little differently): those whose
    # nearest garment point is close and on the outside of them, and not near one of the garment's openings
    from scipy.spatial import cKDTree
    from collections import defaultdict
    Pb=BODY[b]['P'];Nb=BODY[b]['N'];t=cKDTree(V);d,j=t.query(Pb)
    ec=defaultdict(int)
    for tri in F:
        for a,c in ((tri[0],tri[1]),(tri[1],tri[2]),(tri[2],tri[0])):ec[(min(a,c),max(a,c))]+=1
    bnd=np.array(sorted({a for (a,c),k in ec.items() if k==1}|{c for (a,c),k in ec.items() if k==1}))
    db,_=cKDTree(V[bnd]).query(Pb) if len(bnd) else (np.full(len(Pb),9.),None)
    out=((V[j]-Pb)*Nb).sum(1)>-.002
    return np.nonzero((d<.06)&out&(db>.035))[0]
def uvs(V,F):
    # box mapping in metres (the cloth texture tiles by world size): pick the projection axis per face by its normal
    n=normals(V,F);ax=np.abs(n).argmax(1);uv=np.zeros((len(V),2),np.float32)
    for i in range(len(V)):
        a=ax[i];uv[i]=(V[i,[2,1]] if a==0 else V[i,[0,2]] if a==1 else V[i,[0,1]])
    return uv*.57   # (cloth maps repeat 22 times: a weave tile is about 8 cm)
def write(g,builds='ABCD',kind='cloth',extra={}):
    arrs=[];H={'id':g,'kind':kind,'builds':{},'perBuild':True,**extra}
    def add(n,a):arrs.append((n,np.ascontiguousarray(a)))
    for b in builds:
        d=np.load(SC+'gar_%s_%s.npz'%(g,b));V=d['V'].astype(np.float32);F=d['F'].astype(np.int64)
        V=smooth_edges(V,F)
        N=normals(V,F);j,w=skin(b,V)
        B=BODY[b];names=list(B['names']);IBM=B['IBM'];hy=np.linalg.inv(IBM[names.index('Hips')])[1,3]
        # skirt weights: below the crotch blend toward Hips + UpLegs
        iH,iL,iR=names.index('Hips'),names.index('LeftUpLeg'),names.index('RightUpLeg')
        crotch=hy-.09;loose=np.zeros(len(V),np.float32)
        for i in range(len(V)):
            y=V[i,1]
            if y<crotch:
                t=min(1,(crotch-y)/.3);side=np.clip(V[i,0]/.12,-1,1);wl=.5+.5*side
                wl=float(np.clip(.5+V[i,0]/(.03 if extra.get('slit') else .14),0,1));tgt={iH:.3,iL:.7*wl,iR:.7*(1-wl)};cur={int(j[i,k]):w[i,k]/255 for k in range(4) if w[i,k]}
                mix={k:cur.get(k,0)*(1-t)+tgt.get(k,0)*t for k in set(cur)|set(tgt)};top=sorted(mix.items(),key=lambda x:-x[1])[:4];s=sum(v for _,v in top)
                j[i]=0;w[i]=0
                for k,(jj,ww) in enumerate(top):j[i,k]=jj;w[i,k]=round(ww/s*255)
                loose[i]=min(1,(crotch-y)/max(.05,crotch-V[:,1].min()))
        add(b+'pos',V);add(b+'nor',np.round(N*127).astype(np.int8));add(b+'si',j);add(b+'sw',w);add(b+'uv',uvs(V,F));add(b+'index',F.astype(np.uint16 if len(V)<65536 else np.uint32));add(b+'loose',loose)
        if kind=='cloth':add(b+'cov',cover(b,V,F).astype(np.uint16))
        H['builds'][b]=len(V)
    off=0;lay={}
    for n,a in arrs:lay[n]=[off,str(a.dtype),list(a.shape)];off+=a.nbytes;off+=(-off)%4
    H['layout']=lay;H['tex']={};hj=json.dumps(H).encode();hj+=b' '*((-len(hj))%4)
    with open(OUT+g+'.bin','wb') as fo:
        fo.write(b'BMP1'+struct.pack('<I',len(hj))+hj)
        for n,a in arrs:fo.write(a.tobytes());fo.write(b'\0'*((-a.nbytes)%4))
    print(g,builds,os.path.getsize(OUT+g+'.bin')//1024,'KB')
if __name__=='__main__':
    G=json.load(open(SC+'garments.json'))[sys.argv[1]] if sys.argv[1] in json.load(open(SC+'garments.json')) else {}
    write(sys.argv[1],sys.argv[2] if len(sys.argv)>2 else 'ABCD',extra={'slit':G.get('slit',0)})
