# Finer hair textures (Build 129): each MakeHuman hair/beard texture is doubled to 2048 px and its strands redrawn finer: the strand
# direction is read from the texture itself (structure tensor), white noise is smeared along it (line-integral convolution) into
# one-pixel strands, and that detail replaces the coarse painted strands while the large-scale shading and the cards' outlines are kept;
# the outlines break up into single strands. Reads <id>_d.webp (or the .orig.webp kept beside it), writes <id>_d.webp.
#   python3 hairtex.py assets/mhparts h_alpha7 h_cl02 ...
import sys,os,numpy as np
from PIL import Image
from scipy import ndimage as nd
def lic(field_x,field_y,noise,L=34,steps=34):
    H,W=noise.shape;yy,xx=np.mgrid[0:H,0:W].astype(np.float32);acc=noise.copy();wsum=np.ones_like(noise)
    for sgn in (1,-1):
        px,py=xx.copy(),yy.copy();dx0,dy0=field_x.copy(),field_y.copy()
        for k in range(steps):
            dx=nd.map_coordinates(field_x,[py,px],order=1,mode='nearest');dy=nd.map_coordinates(field_y,[py,px],order=1,mode='nearest')
            flip=(dx*dx0+dy*dy0)<0;dx[flip]*=-1;dy[flip]*=-1;dx0,dy0=dx,dy
            px=px+sgn*dx*(L/steps);py=py+sgn*dy*(L/steps)
            w=1-k/steps;acc+=w*nd.map_coordinates(noise,[py,px],order=1,mode='wrap');wsum+=w
    return acc/wsum
def run(path):
    # the untouched texture is kept outside the repo (HAIR_ORIG, default ./orig): run again and it starts from that, not from its own output
    od=os.environ.get('HAIR_ORIG','orig');os.makedirs(od,exist_ok=True);src=os.path.join(od,os.path.basename(path).replace('_d.webp','_d.orig.webp'))
    if not os.path.exists(src):os.rename(path,src)
    im=Image.open(src).convert('RGBA');W,H=im.size;im=im.resize((W*2,H*2),Image.BICUBIC);a=np.asarray(im).astype(np.float32)/255
    Lm=a[...,:3].mean(2);A=a[...,3]
    g=nd.gaussian_filter(Lm,1.5);gx=nd.sobel(g,1);gy=nd.sobel(g,0)
    jxx=nd.gaussian_filter(gx*gx,6);jyy=nd.gaussian_filter(gy*gy,6);jxy=nd.gaussian_filter(gx*gy,6)
    th=.5*np.arctan2(2*jxy,jxx-jyy)+np.pi/2   # along the strands: across the strongest gradient
    coh=np.sqrt((jxx-jyy)**2+4*jxy**2)/(jxx+jyy+1e-6)   # how clearly the texture has a strand direction here
    c2=nd.gaussian_filter(np.cos(2*th),10);s2=nd.gaussian_filter(np.sin(2*th),10)
    w=nd.gaussian_filter(np.clip((coh-.15)/.35,0,1),8);c2=c2*w+(-1)*(1-w);s2=s2*w   # mottled patches (the scalp cap) comb straight down the texture: cos(2*90deg)=-1
    th=.5*np.arctan2(s2,c2)
    fx,fy=np.cos(th).astype(np.float32),np.sin(th).astype(np.float32)
    rng=np.random.default_rng(7);nz=nd.gaussian_filter(rng.random(Lm.shape).astype(np.float32),.6)
    S=lic(fx,fy,nz);S=(S-nd.gaussian_filter(S,3));S/=S.std()+1e-6   # fine strands, zero mean
    base=nd.gaussian_filter(Lm,2.2)
    L2=np.clip(base*(1+.3*S)+.03*S,0,1)
    edge=np.clip(A*(1-A)*4,0,1);A2=np.clip(A+edge*.55*S*.5-(1-A)*.0,0,1);A2=np.where(A>.02,A2,0)
    out=np.dstack([L2,L2,L2,A2]);Image.fromarray((out*255).astype(np.uint8),'RGBA').save(path,'WEBP',quality=86,method=6)
    print(os.path.basename(path),out.shape,os.path.getsize(path)//1024,'KB')
if __name__=='__main__':
    d=sys.argv[1]
    for i in sys.argv[2:]:run(os.path.join(d,i+'_d.webp'))
