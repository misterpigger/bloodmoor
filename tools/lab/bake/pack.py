# Packs trace.mjs's output into the PNG the game loads: python3 pack.py bake.bin out.png [skyGain bounceGain scale]
import sys,struct,numpy as np
from PIL import Image
f=open(sys.argv[1],'rb').read();NX,NY,NZ=struct.unpack('<3I',f[:12]);B=struct.unpack('<6f',f[12:36])
d=np.frombuffer(f[40:],dtype=np.float32).reshape(NY,NZ,NX,37).copy()
kS=float(sys.argv[3]) if len(sys.argv)>3 else 1.;kB=float(sys.argv[4]) if len(sys.argv)>4 else 1.;SC=float(sys.argv[5]) if len(sys.argv)>5 else 4.
import os;T=np.array([float(x) for x in os.environ.get('SKYTINT','1,1,1').split(',')],np.float32);bn=d[...,18:36].reshape(NY,NZ,NX,6,3);sat=float(os.environ.get('BNCSAT','1'));g=bn.mean(axis=-1,keepdims=True);bn=(g+(bn-g)*sat).reshape(NY,NZ,NX,18);E=kS*d[...,:18]*np.tile(T,6)+kB*bn;ok=(d[...,36]<.2).astype(np.float32)
def nb(a):   # sum over the six neighbours (edges repeat)
    p=np.pad(a,((1,1),(1,1),(1,1))+((0,0),)*(a.ndim-3),mode='edge');return p[2:,1:-1,1:-1]+p[:-2,1:-1,1:-1]+p[1:-1,2:,1:-1]+p[1:-1,:-2,1:-1]+p[1:-1,1:-1,2:]+p[1:-1,1:-1,:-2]
E*=ok[...,None]
for it in range(12):   # cells inside solid things take their light from the open cells beside them, so surfaces never sample black
    s=nb(E);w=nb(ok);fill=(ok==0)&(w>0);E[fill]=s[fill]/w[fill][:,None];ok[fill]=1
s=nb(E)+2*E;E=s/8.   # a light smoothing takes the sampling noise out
print('cells',NX,NY,NZ,'bounds',B,'max',E.max(),'open-top mean',E[-1,:,:,6:9].mean(axis=(0,1)),'filled',int(ok.sum()),'of',ok.size)
img=np.clip(np.sqrt(np.clip(E,0,None)/SC),0,1);cols=12;rows=(6*NY+cols-1)//cols;A=np.zeros((rows*NZ,cols*NX,3),np.uint8)
for k in range(6):
    for y in range(NY):
        L=k*NY+y;r,c=divmod(L,cols);A[r*NZ:(r+1)*NZ,c*NX:(c+1)*NX]=(img[y,:,:,k*3:k*3+3]*255+.5).astype(np.uint8)
Image.fromarray(A).save(sys.argv[2],optimize=True)
