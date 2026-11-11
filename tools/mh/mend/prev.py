import os
# a quick software picture of a generated head of hair: front, three-quarter, side, back
import numpy as np,sys,math
from PIL import Image
from body import load
B=load('A');P=B['P'];N=B['N'];N=N/np.linalg.norm(N,axis=1,keepdims=True);I=B['I']
def views(pid,S=440,win=.40,col=(.34,.22,.13)):
    d=np.load(os.environ.get('OUT','out/')+'%s_dbg.npz'%pid);V=d['V'];UV=d['UV'];T=d['T'];at=np.array(Image.open(os.environ.get('OUT','out/')+'locks_d.webp').convert('RGBA')).astype(np.float32)/255;AH,AW=at.shape[:2]
    hm=(P[I].mean(1)[:,1]>1.40);HI=I[hm]
    # hair normals: the head's own, from the nearest body vertex
    from scipy.spatial import cKDTree
    hn=d['NR'] if 'NR' in d.files else N[cKDTree(P).query(V)[1]]
    out=[]
    for yaw in (0,40,90,180,-140):
        a=math.radians(yaw);R=np.array([[math.cos(a),0,-math.sin(a)],[0,1,0],[math.sin(a),0,math.cos(a)]])   # camera looks down -z after turning the head
        img=np.zeros((S,S,3),np.float32);img[:]=(.55,.6,.66);zb=np.full((S,S),-1e9,np.float32)
        Ld=np.array([.35,.75,.55]);Ld/=np.linalg.norm(Ld)
        def proj(X):
            Y=(X-np.array([0,1.665,.03]))@R.T;return np.stack([(Y[:,0]/win+.5)*S,(.5-Y[:,1]/win)*S,Y[:,2]],1)
        def raster(tri_xyz,shade_fn):
            for t in range(len(tri_xyz)):
                p=tri_xyz[t];x0=int(max(0,math.floor(p[:,0].min())));x1=int(min(S-1,math.ceil(p[:,0].max())));y0=int(max(0,math.floor(p[:,1].min())));y1=int(min(S-1,math.ceil(p[:,1].max())))
                if x1<x0 or y1<y0:continue
                xs,ys=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5);den=(p[1,1]-p[2,1])*(p[0,0]-p[2,0])+(p[2,0]-p[1,0])*(p[0,1]-p[2,1])
                if abs(den)<1e-9:continue
                w0=((p[1,1]-p[2,1])*(xs-p[2,0])+(p[2,0]-p[1,0])*(ys-p[2,1]))/den;w1=((p[2,1]-p[0,1])*(xs-p[2,0])+(p[0,0]-p[2,0])*(ys-p[2,1]))/den;w2=1-w0-w1
                m=(w0>=-1e-4)&(w1>=-1e-4)&(w2>=-1e-4)
                if not m.any():continue
                z=w0*p[0,2]+w1*p[1,2]+w2*p[2,2];c,keep=shade_fn(t,w0,w1,w2);m&=keep&(z>zb[y0:y1+1,x0:x1+1])
                sub=img[y0:y1+1,x0:x1+1];sub[m]=c[m] if c.ndim==3 else c;zb[y0:y1+1,x0:x1+1][m]=z[m]
        # head
        hp=proj(P);tri=hp[HI];nn=(N@R.T);lam=np.clip(N@Ld,0,1)*.75+.3
        def sh_head(t,w0,w1,w2):
            i=HI[t];l=w0*lam[i[0]]+w1*lam[i[1]]+w2*lam[i[2]];c=np.stack([l*.86,l*.66,l*.55],-1);return c,np.ones_like(w0,bool)
        raster(tri,sh_head)
        vp=proj(V);tri=vp[T];hl=np.clip(hn@Ld,0,1)*.8+.3
        def sh_hair(t,w0,w1,w2):
            i=T[t];u=w0*UV[i[0],0]+w1*UV[i[1],0]+w2*UV[i[2],0];v=w0*UV[i[0],1]+w1*UV[i[1],1]+w2*UV[i[2],1]
            px=np.clip((u*AW).astype(int),0,AW-1);py=np.clip(((1-v)*AH).astype(int),0,AH-1);s=at[py,px];l=(w0*hl[i[0]]+w1*hl[i[1]]+w2*hl[i[2]])*s[...,0]
            return np.stack([l*col[0],l*col[1],l*col[2]],-1)*2.2,s[...,3]>.4
        raster(tri,sh_hair)
        out.append(Image.fromarray((np.clip(img,0,1)*255).astype(np.uint8)))
    sh=Image.new('RGB',(S*len(out),S));[sh.paste(o,(i*S,0)) for i,o in enumerate(out)];return sh
if __name__=='__main__':
    ids=sys.argv[1:];ims=[views(p) for p in ids];W=ims[0].width;sh=Image.new('RGB',(W,ims[0].height*len(ims)));[sh.paste(o,(0,i*o.height)) for i,o in enumerate(ims)];sh.save('prev_%s.jpg'%'_'.join(ids),quality=90);print('saved')
