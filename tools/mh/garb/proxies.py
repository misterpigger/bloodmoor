# MakeHuman proxies (hair, beards, brows, lashes; CC0 / CC-BY packs, see CREDITS.md) fitted onto the four fighter builds in the
# game's bind space, skinned from the nearest body vertices, written as one small binary per part plus its textures.
#   bin: 'BMP1', u32 json length, json header, then the arrays it lists (little endian, 4-byte aligned)
import os
import json,os,sys,struct,numpy as np
from PIL import Image
from scipy.spatial import cKDTree
SC=os.environ.get('MH_SRC','src')+'/';OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../')+'assets/mhparts/'
G1=os.environ.get('MH_SRC','src')+'/makehuman_system_assets_cc0/';G2=os.environ.get('MH_SRC','src')+'/'
sys.path.insert(0,SC+'garb');from mhmap import load_obj
FULL={b:np.load(SC+'garb/full_%s.npy'%b) for b in 'ABCD'};BODY={b:np.load(SC+'garb/body_%s.npz'%b) for b in 'ABCD'}
TREE={b:cKDTree(BODY[b]['P']) for b in 'ABCD'}
def load_mhclo(path):
    ref,scl,on=[],{},False
    for line in open(path,encoding='utf8',errors='ignore'):
        p=line.split()
        if not p or p[0].startswith('#'):continue
        if p[0] in('x_scale','y_scale','z_scale'):scl[p[0][0]]=(int(p[1]),int(p[2]),float(p[3]))
        elif p[0]=='verts':on=True
        elif on and len(p)==9:ref.append([float(x) for x in p])
        elif on and len(p)==1 and p[0].lstrip('-').isdigit():ref.append([int(p[0]),0,0,1,0,0,0,0,0])
        elif on and p[0] in('delete_verts','weights'):on=False
    return np.array(ref),scl
def fit(V,ref,scl):
    scl={**{'x':(5399,11998,1.4340),'z':(962,5320,2.0001),'y':(791,881,2.4098)},**scl}
    s=np.array([abs(V[scl[a][0]][i]-V[scl[a][1]][i])/scl[a][2] for i,a in enumerate('xyz')])
    idx=ref[:,:3].astype(int);return (V[idx]*ref[:,3:6][:,:,None]).sum(1)+ref[:,6:9]*s
def skin(b,P):
    d,j=TREE[b].query(P,k=4);w=1/(d+1e-4)**2;w/=w.sum(1,keepdims=True)
    J=BODY[b]['J'][j];W=BODY[b]['W'][j]*w[:,:,None];acc={}
    out_j=np.zeros((len(P),4),np.uint8);out_w=np.zeros((len(P),4),np.float32)
    for i in range(len(P)):
        m={}
        for a in range(4):
            for c in range(4):
                if W[i,a,c]>0:m[J[i,a,c]]=m.get(J[i,a,c],0)+W[i,a,c]
        top=sorted(m.items(),key=lambda x:-x[1])[:4];s=sum(v for _,v in top) or 1
        for c,(jj,ww) in enumerate(top):out_j[i,c]=jj;out_w[i,c]=ww/s
    return out_j,np.round(out_w*255).astype(np.uint8)
def normals(P,T):
    n=np.zeros_like(P);a,b,c=P[T[:,0]],P[T[:,1]],P[T[:,2]];fn=np.cross(b-a,c-a)
    for k in range(3):np.add.at(n,T[:,k],fn)
    return n/(np.linalg.norm(n,axis=1,keepdims=True)+1e-12)
def write(pid,objp,mhclo,tex,kind,extra={}):
    V0,VT,F,FT,_=load_obj(objp);ref,scl=load_mhclo(mhclo);assert len(ref)==len(V0),(pid,len(ref),len(V0))
    key={};rv=[];rt=[];T=[]
    for f,t in zip(F,FT):
        ids=[]
        for v,vt in zip(f,t):
            k=(v,vt)
            if k not in key:key[k]=len(rv);rv.append(v);rt.append(max(vt,0))
            ids.append(key[k])
        for j in range(1,len(ids)-1):T.append([ids[0],ids[j],ids[j+1]])
    rv=np.array(rv);T=np.array(T,np.uint32);uv=VT[np.array(rt)].astype(np.float32) if len(VT) else np.zeros((len(rv),2),np.float32)
    arrs=[];H={'id':pid,'kind':kind,'nv':len(rv),'ni':int(T.size),'builds':{},**extra}
    def add(name,a):
        arrs.append((name,np.ascontiguousarray(a)))
    add('uv',uv);add('index',T.astype(np.uint16 if len(rv)<65536 else np.uint32))
    for b in 'ABCD':
        P=fit(FULL[b],ref,scl)[rv].astype(np.float32);N=normals(P,T.astype(int));j,w=skin(b,P)
        add(b+'pos',P);add(b+'nor',np.round(N*127).astype(np.int8));add(b+'si',j);add(b+'sw',w)
    # layout
    off=0;lay={}
    for n,a in arrs:
        lay[n]=[off,str(a.dtype),list(a.shape)];off+=a.nbytes;off+=(-off)%4
    H['layout']=lay;H['tex']=tex;hj=json.dumps(H).encode();hj+=b' '*((-len(hj))%4)
    with open(OUT+pid+'.bin','wb') as fo:
        fo.write(b'BMP1'+struct.pack('<I',len(hj))+hj)
        for n,a in arrs:
            fo.write(a.tobytes());fo.write(b'\0'*((-a.nbytes)%4))
    print(pid,len(rv),'verts',T.shape[0],'tris',os.path.getsize(OUT+pid+'.bin')//1024,'KB')
def texout(src,dst,size=1024,alpha=True):
    im=Image.open(src);im=im.convert('RGBA' if alpha else 'RGB')
    if max(im.size)>size:im=im.resize((size,size),Image.LANCZOS)
    im.save(OUT+dst,'WEBP',quality=88,method=6);return dst
