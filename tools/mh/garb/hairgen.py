# Hair and beards as strand cards grown from each build's scalp and face (Build 127): thousands of narrow tapered ribbons, each a
# clump of strands from a generated texture, combed by a per-style flow field, kept off the head and hung by gravity where long.
# Written as parts like the MakeHuman proxies (assets/mhparts/<id>.bin, per build), plus the strand atlas.
#   python3 hairgen.py [ids...]
import os,sys,json,struct,math,numpy as np
from scipy.spatial import cKDTree
from PIL import Image,ImageDraw,ImageFilter
SC=os.environ.get('GARB_WORK','work')+'/'
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../assets/mhparts/') if 'tools' in os.path.abspath(__file__) else 'assets/mhparts/'
BUILDS='ABCD'
def smooth(x,a,b):t=np.clip((x-a)/(b-a),0,1);return t*t*(3-2*t)
# ---------------------------------------------------------------- the strand atlas: 4 columns, each a clump of fine strands
def atlas(path,W=1024,H=2048,seed=3):
    # (Build 129) finer: four columns of 1024 px tall clumps, each 560-700 single strands about 1-2 px wide once downsampled, every strand
    # its own shade and wave, thinning to wisps at the tips; the clump's edges sparse so the cards' borders never show
    rng=np.random.default_rng(seed);img=Image.new('LA',(W,H),(0,0));cw=W//4;SS=3
    for col in range(4):
        layer=Image.new('LA',(cw*SS,H),(0,0));d=ImageDraw.Draw(layer)
        n=560+col*45
        for s in range(n):
            u=rng.beta(2.2,2.2);x0=(.04+.92*u)*cw*SS;wav=rng.uniform(0,7);ph=rng.uniform(0,6.28);fr=rng.uniform(1.5,4.5);ln=rng.uniform(.6,1.0);lum=int(rng.uniform(175,255));wd=int(rng.choice([3,3,4,4,5]))
            dr=rng.uniform(-18,18);pts=[(x0+math.sin(ph+t*fr)*wav+(t-.5)*dr,t*H) for t in np.linspace(0,ln,60)]
            for i in range(len(pts)-1):
                t=i/len(pts);a=int(255*min(1,(1-t)*2.6)*(.55+.45*rng.random()));d.line([pts[i],pts[i+1]],fill=(lum,a),width=wd)
        layer=layer.resize((cw,H),Image.LANCZOS)
        img.paste(layer,(col*cw,0),layer)
    a=np.array(img).astype(np.float32);L=a[...,0];A=a[...,1]
    v=np.linspace(0,1,H)[:,None];L=L*(.82+.18*smooth(v,0,.2))   # roots a little darker
    out=np.dstack([L,L,L,A]).clip(0,255).astype(np.uint8);Image.fromarray(out,'RGBA').save(path,'WEBP',quality=88,method=6)
# ---------------------------------------------------------------- per build: the head
def headinfo(b):
    d=np.load(SC+'body_%s.npz'%b);P=d['P'];N=d['N'];I=d['I'];names=list(d['names']);W=d['W'];J=d['J']
    def bw(ns):
        idx=[names.index(n) for n in ns];w=np.zeros(len(P))
        for k in range(4):w+=W[:,k]*np.isin(J[:,k],idx)
        return w
    return dict(P=P,N=N/np.linalg.norm(N,axis=1,keepdims=True),I=I,names=names,W=W,J=J,head=bw(['Head','HeadTop_End','Neck']),col=d['COL'],tree=cKDTree(P))
def sample(H,mask_fn,n,rng):
    P,I=H['P'],H['I'];a,b_,c=P[I[:,0]],P[I[:,1]],P[I[:,2]];cen=(a+b_+c)/3;ok=mask_fn(cen)
    area=np.linalg.norm(np.cross(b_-a,c-a),axis=1)*.5*ok;pr=area/area.sum();ti=rng.choice(len(I),n,p=pr)
    u=rng.random(n);v=rng.random(n);fl=u+v>1;u[fl]=1-u[fl];v[fl]=1-v[fl]
    A,B,C=P[I[ti,0]],P[I[ti,1]],P[I[ti,2]];pts=A+(B-A)*u[:,None]+(C-A)*v[:,None]
    N=H['N'];nn=N[I[ti,0]]+(N[I[ti,1]]-N[I[ti,0]])*u[:,None]+(N[I[ti,2]]-N[I[ti,0]])*v[:,None];nn/=np.linalg.norm(nn,axis=1,keepdims=True)
    return pts,nn
def keep_out(H,p,off):
    d,j=H['tree'].query(p);q=H['P'][j];n=H['N'][j];s=(p-q)@n
    if s<off:p=p+n*(off-s)
    return p
CEN=np.array([0,1.68,.045])
def hairline(p):   # the scalp: above a hairline high over the brow, down the temples, low at the nape, round the ears
    x,y,z=p[...,0],p[...,1],p[...,2];az=np.arctan2(x,z-CEN[2]);aa=np.abs(az)
    yl=np.interp(aa,[0,.5,1.0,1.45,1.75,2.2,3.15],[1.738,1.732,1.705,1.70,1.70,1.635,1.592])
    ear=(np.abs(x)>.062)&(y<1.705)&(z>-.04)&(z<.07)
    return (y>yl)&~ear
# ---------------------------------------------------------------- styles
def flow(style,p,n,rng):
    up=np.array([0,1,0.]);x,y,z=p
    if style in('crop','tousle','bowl'):
        crown=np.array([0,1.775,-.025]);d=p-crown
        if z>.06 and style!='bowl':d=d+np.array([0,0,.04])   # the front combed forward
    elif style=='long':
        d=np.array([np.sign(x+1e-4)*.35,-.15,-.9]) if y>1.72 else np.array([np.sign(x+1e-4)*.15,-1,-.25])   # swept back from a parting over the crown, then down
    d=d-n*(d@n);l=np.linalg.norm(d)
    if l<1e-5:d=np.cross(n,[1,0,0]);l=np.linalg.norm(d)
    return d/l
def grow(H,style,root,n,rng):
    if style=='crop':L=rng.uniform(.016,.026);seg=4;lift=.0025;grav=0.;bend=.85
    elif style=='tousle':L=rng.uniform(.035,.06);seg=5;lift=.004;grav=.15;bend=.55
    elif style=='bowl':L=1.0;seg=7;lift=.004;grav=.25;bend=.8
    else:L=rng.uniform(.17,.22)*(.35 if root[2]>.07 and abs(root[0])<.045 else .7 if root[2]>.09 else 1.);seg=7;lift=.005;grav=.6;bend=.6   # (Build 134) to the shoulders
    d=flow(style,root,n,rng);d=d+rng.normal(0,.12 if style!='tousle' else .35,3);d=d-n*(d@n)*.7;d/=np.linalg.norm(d)
    pts=[root+n*lift*.4];p=pts[0].copy();sl=L/seg if style!='bowl' else .012
    cut=None
    if style=='bowl':cut=1.700 if root[2]>.07 else 1.655+.01*rng.random()
    for i in range(seg if style!='bowl' else 40):
        gn=np.array([0,-1,0.])*grav*(i/seg)
        d=d*bend+(flow(style,p,H['N'][H['tree'].query(p)[1]],rng))*(1-bend)+gn;d/=np.linalg.norm(d)
        q=p+d*sl;q=keep_out(H,q,lift+(.002*i if style=='long' else .0006*i))
        if cut is not None and q[1]<cut:break
        d=(q-p)/np.linalg.norm(q-p);p=q;pts.append(p.copy())
    return np.array(pts)
def card(H,pts,w0,col,taper=.25):
    # a ribbon along the strand, lying across the surface under it (side = strand x surface normal)
    V=[];UV=[];T=[];k=len(pts)
    for i,p in enumerate(pts):
        d=pts[min(i+1,k-1)]-pts[max(i-1,0)];d/=np.linalg.norm(d)+1e-9;n=H['N'][H['tree'].query(p)[1]];s=np.cross(d,n);s/=np.linalg.norm(s)+1e-9
        w=w0*(1-(1-taper)*i/(k-1));v=i/(k-1)
        V+=[p-s*w*.5,p+s*w*.5];UV+=[[col*.25+.01,v],[col*.25+.24,v]]
    for i in range(k-1):a=2*i;T+=[[a,a+1,a+2],[a+1,a+3,a+2]]
    return np.array(V),np.array(UV),np.array(T)
STY={'hs_crop':('crop',6500,.007),'hs_tousle':('tousle',6500,.009),'hs_bowl':('bowl',6000,.01),'hs_long':('long',6500,.011),
     'bs_short':('bshort',3800,.006),'bs_full':('bfull',4300,.0055),'bs_mous':('bmous',900,.005)}
def beard_mask(H,kind):
    def m(p):
        d,j=H['tree'].query(p);w=H['col'][j,1];x,y,z=p[...,0],p[...,1],p[...,2]
        lip=(y>1.592)&(y<1.612)&(np.abs(x)<.026)&(z>.12)
        mouth=(y>1.585)&(y<1.596)&(np.abs(x)<.022)&(z>.13)
        if kind=='bmous':return lip&~mouth
        return ((w>.22)|lip)&~mouth&(y<1.66)
    return m
def grow_beard(H,kind,root,n,rng):
    up=np.array([0,1,0.]);x,y,z=root
    if kind=='bmous':L=rng.uniform(.012,.02);seg=4;d=np.array([np.sign(x+1e-5)*.9,-1,.15])
    elif kind=='bshort':L=rng.uniform(.012,.018);seg=4;d=np.array([0,-1,.3])
    elif y>1.588 and z>.1 and abs(x)<.04:L=rng.uniform(.012,.02);seg=4;d=np.array([np.sign(x+1e-5)*.9,-1,.15])   # over the lip: a moustache to the mouth's corners
    else:L=rng.uniform(.035,.065)*(1.25 if y<1.575 else .75);seg=6;d=np.array([0,-1,.25])
    d=d-n*(d@n)*.6;d/=np.linalg.norm(d)
    pts=[root];p=root.copy();sl=L/seg
    for i in range(seg):
        g=np.array([0,-1,0.])*(.3 if kind=='bfull' else .1)*i/seg;d=d*.8+g+rng.normal(0,.06,3);d/=np.linalg.norm(d)
        q=keep_out(H,p+d*sl,.0015+.001*i);d=(q-p)/np.linalg.norm(q-p);p=q;pts.append(p.copy())
    return np.array(pts)
def build(pid,b='A'):
    # grown once on build A; each vertex keeps the body vertex under it (anchor) and its offset from it, so the game can lay the same
    # hair on any build (or reshaped head) from that body's own vertices
    style,n,w0=STY[pid];H=headinfo(b);rng=np.random.default_rng(abs(hash(pid))%2**32)
    if pid.startswith('hs'):roots,nr=sample(H,hairline,n,rng);fn=lambda r,nn:grow(H,style,r,nn,rng)
    else:roots,nr=sample(H,beard_mask(H,style),n,rng);fn=lambda r,nn:grow_beard(H,style,r,nn,rng)
    Vs=[];UVs=[];Ts=[];off=0;loose=[]
    for r,nn in zip(roots,nr):
        if style=='long' and r[2]>.06 and r[1]<1.78 and abs(r[0])<.05:continue   # (Build 134) no locks from the hairline over the brow: they fell across the face; the cap covers it, swept back
        pts=fn(r,nn)
        if len(pts)<2:continue
        V,UV,T=card(H,pts,w0*rng.uniform(.75,1.25),int(rng.integers(0,4)));Vs.append(V);UVs.append(UV);Ts.append(T+off);off+=len(V)
        loose.append(np.clip((1.64-V[:,1])/.18,0,1) if style=='long' else np.clip((1.70-V[:,1])/.12,0,1)*.4 if style=='bowl' else np.zeros(len(V)))
    V=np.concatenate(Vs);UV=np.concatenate(UVs);T=np.concatenate(Ts);lo=np.concatenate(loose)
    anc=H['tree'].query(V)[1];offv=(V-H['P'][anc]).astype(np.float32)
    arrs=[('anchor',anc.astype(np.uint16)),('off',offv),('uv',np.round(np.clip(UV,0,1)*65535).astype(np.uint16)),('index',T.astype(np.uint32 if len(V)>65535 else np.uint16))]
    arrs.append(('loose',lo.astype(np.float32)))
    Hd={'id':pid,'kind':'hair' if pid.startswith('hs') else 'beard','tex':{'d':'strands_d.webp'},'strands':True,'nv':len(V)}
    o_=0;lay={}
    for nm,a_ in arrs:lay[nm]=[o_,str(a_.dtype),list(a_.shape)];o_+=a_.nbytes;o_+=(-o_)%4
    Hd['layout']=lay;hj=json.dumps(Hd).encode();hj+=b' '*((-len(hj))%4)
    with open(OUT+pid+'.bin','wb') as fo:
        fo.write(b'BMP1'+struct.pack('<I',len(hj))+hj)
        for nm,a_ in arrs:fo.write(a_.tobytes());fo.write(b'\0'*((-a_.nbytes)%4))
    print(pid,len(V),'verts',os.path.getsize(OUT+pid+'.bin')//1024,'KB')
if __name__=='__main__':
    ids=sys.argv[1:] or list(STY)
    if not os.path.exists(OUT+'strands_d.webp') or 'atlas' in ids:atlas(OUT+'strands_d.webp')
    for i in ids:
        if i in STY:build(i)
