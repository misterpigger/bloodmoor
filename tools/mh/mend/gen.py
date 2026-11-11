# hair as locks (Build 201): a few hundred to a thousand overlapping locks, each a ribbon 1.5-3 cm wide with a pointed, wispy end,
# laid like shingles from the nape up to the crown along a combed flow. Replaces the thousands of 1 cm ribbons, which read as corduroy.
#   python3 gen.py [ids...]   ->  out/<id>.bin (+ locks_d.webp via atlas.py)
import os,sys,json,struct,math,numpy as np
from scipy.spatial import cKDTree
from body import load
OUT=os.environ.get('OUT','out/');os.makedirs(OUT,exist_ok=True)
B=load('A');P=B['P'];N=B['N'];N=N/np.linalg.norm(N,axis=1,keepdims=True);I=B['I'];tree=cKDTree(P)
CEN=np.array([0,1.68,.045]);CROWN=np.array([0,1.778,-.012]);UP=np.array([0,1,0.])
# a dense sampling of the head, neck and shoulders: the surface as points with smooth normals
def dense(n=140000,seed=1):
    rng=np.random.default_rng(seed);a,b,c=P[I[:,0]],P[I[:,1]],P[I[:,2]];cen=(a+b+c)/3;ok=(cen[:,1]>1.33)&(np.abs(cen[:,0])<.3)
    ar=np.linalg.norm(np.cross(b-a,c-a),axis=1)*.5*ok;ti=rng.choice(len(I),n,p=ar/ar.sum());u=rng.random(n);v=rng.random(n);fl=u+v>1;u[fl]=1-u[fl];v[fl]=1-v[fl]
    pts=a[ti]+(b[ti]-a[ti])*u[:,None]+(c[ti]-a[ti])*v[:,None];nn=N[I[ti,0]]*(1-u-v)[:,None]+N[I[ti,1]]*u[:,None]+N[I[ti,2]]*v[:,None];nn/=np.linalg.norm(nn,axis=1,keepdims=True)
    C=B['COL'][:,0].astype(np.float64);sc=C[I[ti,0]]*(1-u-v)+C[I[ti,1]]*u+C[I[ti,2]]*v
    return pts,nn,sc
DP,DN,DS=dense();DT=cKDTree(DP)
def surf(p,k=8):
    d,j=DT.query(p,k=k);w=1/(d+1e-4)**2;w/=w.sum();q=(DP[j]*w[:,None]).sum(0);n=(DN[j]*w[:,None]).sum(0);n/=np.linalg.norm(n);return q,n
def keep_out(p,off):
    q,n=surf(p);s=(p-q)@n
    return (p+n*(off-s) if s<off else p),n
def hairline(p):   # the scalp: above a hairline high over the brow, down the temples, low at the nape, round the ears
    x,y,z=p[...,0],p[...,1],p[...,2];az=np.arctan2(x,z-CEN[2]);aa=np.abs(az)
    # (the ear stands at z .025-.075, out past x .076; round az 1.25-1.8 from the front)
    yl=np.interp(aa,[0,.35,.7,.95,1.05,1.13,1.20,1.26,1.80,1.92,2.5,3.15],[1.741,1.739,1.728,1.714,1.690,1.672,1.672,1.697,1.697,1.655,1.622,1.598])
    ear=(np.abs(x)>.074)&(y<1.70)&(z>.02)&(z<.08)
    return (y>yl)&~ear
def scalp():   # the geometric hairline, plus wherever the skin is painted as scalp (so stubble never shows bare beside the hair), less the ears
    x,y,z=DP[:,0],DP[:,1],DP[:,2];ear=(np.abs(x)>.074)&(y<1.70)&(z>.02)&(z<.08)
    return (hairline(DP)|((DS>.5)&(y>1.60)))&~ear
_HM=None
def edge_dist(p):
    global _HM
    if _HM is None:
        m=scalp();_HM=cKDTree(DP[(~m)&(DP[:,1]>1.55)])
    return _HM.query(p)[0]
def poisson(mask,r,rng,jit=None):
    idx=np.flatnonzero(mask);rng.shuffle(idx);acc=[];cell={};inv=1/r
    for i in idx:
        p=DP[i];k=tuple(np.floor(p*inv).astype(int));ok=True
        for dx in(-1,0,1):
            for dy in(-1,0,1):
                for dz in(-1,0,1):
                    for j in cell.get((k[0]+dx,k[1]+dy,k[2]+dz),()):
                        if np.sum((DP[j]-p)**2)<r*r:ok=False;break
                    if not ok:break
                if not ok:break
            if not ok:break
        if ok:acc.append(i);cell.setdefault(k,[]).append(i)
    return np.array(acc)
def sn(x,y,z,f,s=0.):return math.sin(x*f+1.3+s)*math.sin(y*f*1.1+2.1+s*1.7)*math.sin(z*f*.9+.4+s*.6)   # a smooth wander by place
def tang(d,n):
    d=d-n*(d@n);l=np.linalg.norm(d)
    if l<1e-6:d=np.cross(n,[1,0,0]);l=np.linalg.norm(d)
    return d/l
def flow(style,p,n):
    x,y,z=p;rad=p-CROWN;rl=np.linalg.norm(rad)+1e-6;r=rad/rl
    whorl=np.cross(UP,r)*.45*math.exp(-(rl/.05)**2)           # the crown turns
    if style=='long':
        if y>1.715 and z>-.02:d=np.array([np.sign(x+1e-4)*(.25+.5*min(1,abs(x)/.05)),-.12,-1.])      # swept back off the brow, opening a little to each side
        else:d=np.array([np.sign(x+1e-4)*.05,-1.,-.3 if z>-.03 else -.05])                         # then down behind the ears
        return tang(d,n)
    d=r+whorl+np.array([0,-.55,0.])
    if style=='crop':
        f=np.clip((z-.02)/.06,0,1)*np.clip((y-1.72)/.03,0,1);d=d+f*np.array([.55,-.1,.5])           # the front combed forward and across to one side
    elif style=='tousle':
        f=np.clip((z-.02)/.06,0,1)*np.clip((y-1.72)/.03,0,1);d=d+f*np.array([-.4,-.1,.4])
    d=tang(d,n)
    if style=='tousle':
        a=1.1*sn(x,y,z,38)+.5*sn(x,y,z,90,2.);c,s=math.cos(a),math.sin(a);d=d*c+np.cross(n,d)*s
    elif style=='crop':
        a=.35*sn(x,y,z,45);c,s=math.cos(a),math.sin(a);d=d*c+np.cross(n,d)*s
    return d
def bowl_line(p):   # where a bowl cut ends: across the forehead well above the brows, over the tops of the ears, a little lower round the back
    az=abs(math.atan2(p[0],p[2]-CEN[2]));return float(np.interp(az,[0,.6,1.2,1.7,2.4,3.15],[1.722,1.718,1.700,1.688,1.672,1.668]))
def grow(style,root,n0,rng):
    x,y,z=root;top=np.clip((y-1.70)/.06,0,1)
    if style=='crop':L=rng.uniform(.032,.044)*(.66+.34*top);seg=4;tip=.0035;grav=.0;bend=.6;sl=L/seg
    elif style=='tousle':L=rng.uniform(.045,.07)*(.6+.4*top);seg=5;tip=rng.uniform(.004,.009);grav=.12;bend=.55;sl=L/seg
    elif style=='bowl':seg=60;tip=.006;grav=.35;bend=.7;sl=.011;L=9
    else:seg=60;tip=.007;grav=.9;bend=.72;sl=.02;L=9
    if style in('crop','tousle') and abs(x)>.058 and y<1.722 and .012<z<.088:sl*=.5   # over the ear the hair is cut close, or it rides out over the ear's top
    d=flow(style,root,n0);j=rng.normal(0,.1 if style!='tousle' else .22);d=tang(d*math.cos(j)+np.cross(n0,d)*math.sin(j),n0)
    # the root stands off the scalp, over the painted cap beneath (4-7 mm), except at the hairline, where the hair starts at the skin
    lift0=min(.0075,.003+.5*edge_dist(root))+rng.uniform(0,.0012);pts=[root+n0*lift0];p=pts[0].copy();ns=[n0]
    cut=None
    if style=='bowl':cut=bowl_line(root)+rng.normal(0,.0012)
    if style=='long':cut=1.515+rng.normal(0,.012)+.02*abs(sn(x,y,z,25))
    k=0
    while k<seg:
        k+=1;q0,nn=surf(p);f=flow(style,p,nn)
        free=style in('long','bowl') and ((p-q0)@nn>.02 or p[1]<1.60)
        g=np.array([0,-1.,0])*(grav*min(1,k/4) if not free else 2.5)
        d=d*bend+f*(1-bend)*(0 if free else 1)+g*(1-bend);d/=np.linalg.norm(d)
        t=k/(seg if style in('crop','tousle') else max(4,min(seg,12)))
        off=lift0+tip*min(1,t)+(.004 if style=='long' and p[1]<1.66 else 0)
        q,nn=keep_out(p+d*sl,off)
        if cut is not None and q[1]<cut:
            a=(p[1]-cut)/max(1e-6,p[1]-q[1]);q=p+(q-p)*a
            if a>.15:pts.append(q.copy());ns.append(nn)
            break
        if style in('crop','tousle') and k>1 and abs(q[0])>.073 and q[1]<1.697 and .02<q[2]<.08:break   # short hair stops at the ear, it doesn't lie over it
        d=(q-p);d/=np.linalg.norm(d)+1e-9;p=q;pts.append(p.copy());ns.append(nn)
    ns=np.array(ns);pts=np.array(pts)
    for i in range(len(pts)):
        q,nn=surf(pts[i]);h=(pts[i]-q)@nn;t=np.clip((h-.012)/.03,0,1)
        rr=pts[i]-np.array([0,1.69,.04]);rr/=np.linalg.norm(rr)+1e-9;m=nn*.55+rr*.45;ns[i]=m/np.linalg.norm(m)   # rounded toward the head's own ball, so light falls across the hair in one sweep and not lock by lock
        nn=ns[i]
        if t>0:
            r=np.array([pts[i][0],0,pts[i][2]-CEN[2]+.03]);r=r/(np.linalg.norm(r)+1e-9)+np.array([0,.25,0]);r/=np.linalg.norm(r);m=nn*(1-t)+r*t;ns[i]=m/np.linalg.norm(m)
    return pts,ns
def card(pts,ns,w0,col,rng,cols=8,vmax=1.):
    V=[];UV=[];T=[];NR=[];k=len(pts);tilt=rng.uniform(-.0012,.0012)
    cum=np.concatenate([[0],np.cumsum(np.linalg.norm(np.diff(pts,axis=0),axis=1))]);tot=cum[-1]+1e-9
    for i,p in enumerate(pts):
        d=pts[min(i+1,k-1)]-pts[max(i-1,0)];d/=np.linalg.norm(d)+1e-9;n=ns[i];s=np.cross(d,n);s/=np.linalg.norm(s)+1e-9
        v=cum[i]/tot;w=w0*(.8+.2*min(1,v/.25))
        V+=[p-s*w*.5-n*tilt,p+s*w*.5+n*tilt];nl=n-s*.05;nr_=n+s*.05;NR+=[nl/np.linalg.norm(nl),nr_/np.linalg.norm(nr_)];UV+=[[(col+.02)/cols,v*vmax],[(col+.98)/cols,v*vmax]]
    for i in range(k-1):a=2*i;T+=[[a,a+1,a+2],[a+1,a+3,a+2]]
    return np.array(V),np.array(UV),np.array(T),np.array(NR)
#        style  spacing  width
STY={'hs_crop':('crop',.0058,.015),'hs_tousle':('tousle',.0068,.019),'hs_bowl':('bowl',.0062,.026),'hs_long':('long',.0080,.027)}
def build(pid):
    style,sp,w0=STY[pid];rng=np.random.default_rng(sum(map(ord,pid))*7919%2**31)
    m=scalp()
    if style=='bowl':m&=np.array([p[1]>bowl_line(p)+.004 for p in DP])
    roots=poisson(m,sp,rng);Vs=[];UVs=[];Ts=[];NRs=[];off=0;loose=[];nl=0
    order=np.argsort(DP[roots][:,1])          # from the nape up, so higher locks lie over lower ones
    for ri in roots[order]:
        r=DP[ri];nn=DN[ri];pts,ns=grow(style,r,nn,rng)
        if len(pts)<2:continue
        # (a cut end uses the lock short of its point)
        V,UV,T,NR=card(pts,ns,w0*rng.uniform(.8,1.25),int(rng.integers(0,8)),rng,vmax={'bowl':.55,'long':.86}.get(style,1.));Vs.append(V);NRs.append(NR);UVs.append(UV);Ts.append(T+off);off+=len(V);nl+=1
        loose.append(np.clip((1.63-V[:,1])/.13,0,1) if style=='long' else np.clip((1.70-V[:,1])/.10,0,1)*.3 if style=='bowl' else np.zeros(len(V)))
    V=np.concatenate(Vs);UV=np.concatenate(UVs);T=np.concatenate(Ts);lo=np.concatenate(loose);NR=np.concatenate(NRs)
    anc=tree.query(V)[1];offv=(V-P[anc]).astype(np.float32)
    arrs=[('anchor',anc.astype(np.uint16)),('off',offv),('uv',np.round(np.clip(UV,0,1)*65535).astype(np.uint16)),('index',T.astype(np.uint32 if len(V)>65535 else np.uint16)),('loose',lo.astype(np.float32)),('nor',np.round(np.clip(NR,-1,1)*127).astype(np.int8))]
    Hd={'id':pid,'kind':'hair','tex':{'d':'locks_d.webp'},'strands':True,'locks':True,'nv':len(V)}
    o_=0;lay={}
    for nm,a_ in arrs:lay[nm]=[o_,str(a_.dtype),list(a_.shape)];o_+=a_.nbytes;o_+=(-o_)%4
    Hd['layout']=lay;hj=json.dumps(Hd).encode();hj+=b' '*((-len(hj))%4)
    with open(OUT+pid+'.bin','wb') as fo:
        fo.write(b'BMP1'+struct.pack('<I',len(hj))+hj)
        for nm,a_ in arrs:fo.write(a_.tobytes());fo.write(b'\0'*((-a_.nbytes)%4))
    np.savez(OUT+pid+'_dbg.npz',V=V,UV=UV,T=T,NR=NR)
    print(pid,nl,'locks',len(V),'verts',len(T),'tris',os.path.getsize(OUT+pid+'.bin')//1024,'KB')
if __name__=='__main__':
    for pid in (sys.argv[1:] or list(STY)):build(pid)
