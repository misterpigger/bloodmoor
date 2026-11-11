import os
PARTS=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../assets/mhparts'))+'/'
# software picture of a garment on its body: back faces in red, the body in skin colour
import numpy as np,sys,math
from PIL import Image
from parts import read
from body import load
def rot(yaw,pitch):
    a=math.radians(yaw);b=math.radians(pitch);Ry=np.array([[math.cos(a),0,-math.sin(a)],[0,1,0],[math.sin(a),0,math.cos(a)]]);Rx=np.array([[1,0,0],[0,math.cos(b),-math.sin(b)],[0,math.sin(b),math.cos(b)]]);return Rx@Ry
def render(V,T,body,cen,win,S,yaw,pitch,mark=None):
    R=rot(yaw,pitch);img=np.zeros((S,S,3),np.float32);img[:]=(.55,.6,.66);zb=np.full((S,S),-1e9,np.float32);Ld=np.array([.3,.8,.5]);Ld/=np.linalg.norm(Ld)
    def proj(X):Y=(X-cen)@R.T;return np.stack([(Y[:,0]/win+.5)*S,(.5-Y[:,1]/win)*S,Y[:,2]],1)
    def raster(P3,TI,colfn):
        pp=proj(P3);tri=pp[TI];w3=P3[TI];fn=np.cross(w3[:,1]-w3[:,0],w3[:,2]-w3[:,0]);fn/=np.linalg.norm(fn,axis=1,keepdims=True)+1e-12;facing=(fn@R.T)[:,2]
        for t in range(len(tri)):
            p=tri[t];x0=int(max(0,math.floor(p[:,0].min())));x1=int(min(S-1,math.ceil(p[:,0].max())));y0=int(max(0,math.floor(p[:,1].min())));y1=int(min(S-1,math.ceil(p[:,1].max())))
            if x1<x0 or y1<y0:continue
            xs,ys=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5);den=(p[1,1]-p[2,1])*(p[0,0]-p[2,0])+(p[2,0]-p[1,0])*(p[0,1]-p[2,1])
            if abs(den)<1e-9:continue
            w0=((p[1,1]-p[2,1])*(xs-p[2,0])+(p[2,0]-p[1,0])*(ys-p[2,1]))/den;w1=((p[2,1]-p[0,1])*(xs-p[2,0])+(p[0,0]-p[2,0])*(ys-p[2,1]))/den;w2=1-w0-w1
            m=(w0>=-1e-4)&(w1>=-1e-4)&(w2>=-1e-4);z=w0*p[0,2]+w1*p[1,2]+w2*p[2,2];m&=z>zb[y0:y1+1,x0:x1+1]
            if not m.any():continue
            l=abs(fn[t]@Ld)*.7+.3;c=colfn(t,facing[t]>0)*l;img[y0:y1+1,x0:x1+1][m]=c;zb[y0:y1+1,x0:x1+1][m]=z[m]
    BP=body['P'];BI=body['I'];raster(BP,BI,lambda t,f:np.array([.86,.66,.55]))
    mk=set(mark) if mark is not None else set()
    raster(V,T,lambda t,f:(np.array([1.,.9,.2]) if t in mk else np.array([.9,.9,.84])) if f else np.array([.8,.15,.1]))
    return Image.fromarray((np.clip(img,0,1)*255).astype(np.uint8))
def sheet(gid,b,S=420,suffix='',A=None,mark=None):
    if A is None:H,A=read(PARTS+'%s.bin'%gid)
    V=A[b+'pos'].astype(np.float64);T=A[b+'index'].astype(np.int64);body=load(b)
    vs=[(np.array([0,1.42,0]),.62,0,0),(np.array([0,1.42,0]),.62,180,0),(np.array([.17,1.47,0]),.34,35,35),(np.array([-.17,1.47,0]),.34,150,40),(np.array([0,1.5,0]),.4,0,75)]
    ims=[render(V,T,body,c,w,S,y,p,mark) for c,w,y,p in vs];sh=Image.new('RGB',(S*len(ims),S));[sh.paste(o,(i*S,0)) for i,o in enumerate(ims)];sh.save('g_%s_%s%s.jpg'%(gid,b,suffix),quality=90);return sh
if __name__=='__main__':
    sheet(sys.argv[1],sys.argv[2]);print('saved')
