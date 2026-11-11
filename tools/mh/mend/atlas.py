import os
# the lock atlas: 8 columns, each one lock of hair seen flat: a full band of strands at the root that draws in to a pointed, wispy tip.
# Root at the BOTTOM of the image (three.js flips images, so v=0 is the bottom row).
import numpy as np,math
from PIL import Image,ImageDraw,ImageFilter
def make(path,W=1024,H=1024,cols=8,seed=5):
    os.makedirs(os.path.dirname(os.path.abspath(path)),exist_ok=True)
    rng=np.random.default_rng(seed);cw=W//cols;SS=4;out=Image.new('LA',(W,H),(0,0))
    for c in range(cols):
        lay=Image.new('LA',(cw*SS,H*SS),(0,0));d=ImageDraw.Draw(lay)
        n=150;tipx=rng.uniform(.38,.62);lean=rng.uniform(-.06,.06);blunt=[.0,.12,.0,.2,.05,.0,.15,.08][c]   # how square the end is
        tone=np.interp(np.linspace(0,1,n),np.linspace(0,1,11),rng.uniform(.72,1.0,11))   # strands in clumps of a dozen share a shade: streaks you can see from across a room
        order=rng.permutation(n)
        for s in order:
            u=(s+.5)/n+rng.normal(0,.004);u=min(.995,max(.005,u))
            # strands near the middle run the whole length; outer ones stop sooner, so the lock ends in a point
            edge=abs(u-tipx)/max(tipx,1-tipx);ln=1-(1-blunt)*(.42*edge**2.0)-rng.uniform(0,.26)**1.6-(.25 if rng.random()<.08 else 0);ln=max(.35,min(1,ln))
            if rng.random()<.04:ln=min(1.0,ln+.12)   # a few flyaways
            lum=int(np.clip(rng.normal(225,14)*tone[s],120,255));wd=int(rng.choice([5,6,6,7,8]))
            wav=rng.uniform(0,.012);ph=rng.uniform(0,6.28);fr=rng.uniform(2,6)
            pts=[]
            for t in np.linspace(0,ln,48):
                conv=.5*(t**1.6)                      # the strands draw together toward the tip
                x=u+(tipx-u)*conv+lean*t*t+math.sin(ph+t*fr)*wav*(.3+t)
                pts.append((x*cw*SS,(1-t)*H*SS))
            for i in range(len(pts)-1):
                t=i/(len(pts)-1)*ln;a=255
                if t>ln-.1:a=int(255*max(0,(ln-t)/.1)**.7)   # each strand thins out over its last tenth
                d.line([pts[i],pts[i+1]],fill=(lum,a),width=max(2,int(wd*(1-.45*t))))
        lay=lay.resize((cw,H),Image.LANCZOS);out.paste(lay,(c*cw,0))
    a=np.array(out).astype(np.float32);L=a[...,0];A=a[...,1]
    v=np.linspace(1,0,H)[:,None]                      # 0 at the root (bottom row) .. 1 at the tip
    L=L*(.92+.08*np.clip(v/.3,0,1))                   # only a touch darker at the roots: a strong fade drew every lock as a pale leaf on a dark one, like scales
    # the sides of each column fade out, so no card shows a straight edge
    x=(np.arange(W)%cw+.5)/cw;side=np.clip(np.minimum(x,1-x)/.07,0,1)[None,:];A=A*(.25+.75*side)
    # where there is no strand, carry the nearest strand's shade, so the edges don't filter toward black
    Lf=np.array(Image.fromarray(np.where(A>20,L,0).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))).astype(np.float32);L=np.where(A>20,L,Lf)
    rgba=np.dstack([L,L,L,A]).clip(0,255).astype(np.uint8);Image.fromarray(rgba,'RGBA').save(path,'WEBP',quality=90,method=6)
    return rgba
if __name__=='__main__':
    import sys;r=make(sys.argv[1] if len(sys.argv)>1 else 'locks_d.webp');im=Image.fromarray(r,'RGBA');bg=Image.new('RGBA',im.size,(40,90,40,255));bg.alpha_composite(im);bg.convert('RGB').resize((1024,512)).save('atlas_preview.jpg',quality=88);print('ok',r.shape,(r[...,3]>128).mean())
