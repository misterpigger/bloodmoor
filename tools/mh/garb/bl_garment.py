# Builds one garment for one fighter build in Blender (bpy, headless): a smooth closed volume from metaballs laid along the body
# (torso slices, arm capsules, a flared skirt), voxel-remeshed, cut open at neck, wrists and hem, then draped with cloth simulation
# against the body (pinned at the shoulders and the belt) so the excess cloth falls into real folds. Writes positions, triangles and
# uv as npz in the game's coordinates.
#   bpyenv/bin/python bl_garment.py <garment> <build>
import os
import bpy,bmesh,numpy as np,math,sys,time,json
SC=os.environ.get('GARB_WORK','work')+'/'
GAR,BLD=sys.argv[-2],sys.argv[-1]
SPEC=json.load(open(SC+'garments.json'))[GAR]
bpy.ops.wm.read_factory_settings(use_empty=True)
d=np.load(SC+'body_%s.npz'%BLD);P=d['P'];I=d['I'];names=list(d['names']);BW=np.linalg.inv(d['IBM']);W=d['W'];J=d['J']
JP={n:BW[i][:3,3] for i,n in enumerate(names)}
def toB(V):V=np.atleast_2d(V);return np.stack([V[:,0],-V[:,2],V[:,1]],1)
def fromB(V):return np.stack([V[:,0],V[:,2],-V[:,1]],1)
def link(ob):bpy.context.scene.collection.objects.link(ob);return ob
def mesh_obj(name,V,F):
    me=bpy.data.meshes.new(name);me.from_pydata([tuple(map(float,v)) for v in V],[],[tuple(map(int,f)) for f in F]);me.update();return link(bpy.data.objects.new(name,me))
body=mesh_obj('body',toB(P),I)
body.modifiers.new('col','COLLISION');body.collision.thickness_outer=SPEC.get('col',.005);body.collision.thickness_inner=.004;body.collision.cloth_friction=SPEC.get('fric',2)
# ---- body measurements
def bw(names_):
    idx=[names.index(n) for n in names_ if n in names];w=np.zeros(len(P))
    for k in range(4):w+=W[:,k]*np.isin(J[:,k],idx)
    return w
armw=bw(['LeftArm','RightArm','LeftForeArm','RightForeArm','LeftHand','RightHand'])
legw=bw(['LeftUpLeg','RightUpLeg','LeftLeg','RightLeg'])
def slice_torso(y,h=.012):
    m=(np.abs(P[:,1]-y)<h)&(armw<.3)&(np.abs(P[:,0])<.3)
    Q=P[m];return Q[:,0].min(),Q[:,0].max(),Q[:,2].min(),Q[:,2].max()
def slice_legs(y,h=.012):
    m=(np.abs(P[:,1]-y)<h)&(np.abs(P[:,0])<.35);Q=P[m];return Q[:,0].min(),Q[:,0].max(),Q[:,2].min(),Q[:,2].max()
mb=bpy.data.metaballs.new('mb');mb.resolution=.012;mb.render_resolution=.012;mb.threshold=.6
mbo=link(bpy.data.objects.new('mbo',mb))
def ell(c,r,stiff=2.):   # c, r in game coordinates (x,y,z); an ellipsoid
    e=mb.elements.new();e.type='ELLIPSOID';cb=toB(np.array(c))[0];e.co=cb;e.radius=1;e.stiffness=stiff
    e.size_x,e.size_y,e.size_z=r[0],r[2],r[1]   # blender x,y(depth),z(up)
def cap(a,b,r,stiff=2.):
    a=np.array(a,float);b=np.array(b,float);n=max(2,int(np.linalg.norm(b-a)/(r*.6)))
    for t in np.linspace(0,1,n):
        e=mb.elements.new();e.type='BALL';e.co=toB(a+(b-a)*t)[0];e.radius=r;e.stiffness=stiff
S=SPEC;hy=JP['Hips'][1];ny=JP['Neck'][1]
ease=S['ease']
from scipy.spatial import ConvexHull
def hull_ring(Q,y,off,step=.022,r=.026):
    # balls along the slice's convex outline pushed out by `off`, so the volume encloses the body all round
    if len(Q)<5:return
    H=ConvexHull(Q[:,[0,2]]);pts=Q[H.vertices][:,[0,2]];c=pts.mean(0)
    L=np.r_[pts,pts[:1]];per=np.sum(np.linalg.norm(np.diff(L,axis=0),axis=1));n=max(12,int(per/step))
    seg=np.linalg.norm(np.diff(L,axis=0),axis=1);cum=np.r_[0,np.cumsum(seg)]
    for t in np.linspace(0,per,n,endpoint=False):
        k=np.searchsorted(cum,t,side='right')-1;u=(t-cum[k])/max(seg[k],1e-6);p=L[k]+(L[k+1]-L[k])*u
        dvec=p-c;dl=np.linalg.norm(dvec)+1e-6;p=p+dvec/dl*(off-r*.35)
        e=mb.elements.new();e.type='BALL';e.co=toB(np.array([p[0],y,p[1]]))[0];e.radius=r;e.stiffness=2.
    # and fill the middle so the volume is solid
    e=mb.elements.new();e.type='ELLIPSOID';e.co=toB(np.array([c[0],y,c[1]]))[0];e.radius=1;e.size_x=np.ptp(pts[:,0])/2*.8;e.size_y=np.ptp(pts[:,1])/2*.8;e.size_z=.03;e.stiffness=2.
# the garment's volume: the body itself, smoothed (no nipples, ribs or navel) and blown up by the ease, joined with solid
# ellipsoids that bridge the legs for a skirt; the voxel remesh unions them into one closed outer surface (no inner layer)
bpy.ops.object.select_all(action='DESELECT')
inf=body.copy();inf.data=body.data.copy();inf.name='inflated';link(inf);inf.modifiers.clear()
sm0=inf.modifiers.new('s','SMOOTH');sm0.factor=1.;sm0.iterations=S.get('bodysmooth',12)
dp=inf.modifiers.new('d','DISPLACE');dp.direction='NORMAL';dp.strength=ease;dp.mid_level=0.
bpy.context.view_layer.objects.active=inf;inf.select_set(True)
for m_ in ['s','d']:bpy.ops.object.modifier_apply(modifier=m_)
bm2=bmesh.new();bm2.from_mesh(inf.data);bmesh.ops.holes_fill(bm2,edges=bm2.edges[:],sides=0);bmesh.ops.recalc_face_normals(bm2,faces=bm2.faces[:]);bm2.to_mesh(inf.data);bm2.free()   # (eye sockets and mouth: closed, so the volume is watertight)
print('inflated',len(inf.data.vertices))
sl=S.get('sleeve','long')
if S.get('hem',hy)<hy-.03:
    hem=S['hem'];crotch=hy-.11
    mH=(np.abs(P[:,1]-(hy-.08))<.04)&(armw<.3)&(np.abs(P[:,0])<.3);Hq=P[mH];hx0,hx1,hz0,hz1=Hq[:,0].min(),Hq[:,0].max(),Hq[:,2].min(),Hq[:,2].max()
    cx,cz=(hx0+hx1)/2,(hz0+hz1)/2;rx0,rz0=(hx1-hx0)/2+ease,(hz1-hz0)/2+ease
    y=hy-.02
    while y>hem-.14:
        t=min(1.15,max(0,(crotch-y)/max(crotch-hem,.01)));fl=S['flare']*t**1.2
        ell([cx,y,cz],[rx0+fl,.06,rz0+fl*.85],stiff=4.);y-=.022
    bpy.ops.object.select_all(action='DESELECT');mbo.select_set(True);bpy.context.view_layer.objects.active=mbo;bpy.ops.object.convert(target='MESH')
    sk=bpy.context.view_layer.objects.active;inf.select_set(True);sk.select_set(True);bpy.context.view_layer.objects.active=inf;bpy.ops.object.join()
g=inf;g.name='garment'
bpy.ops.object.select_all(action='DESELECT');g.select_set(True);bpy.context.view_layer.objects.active=g
rm=g.modifiers.new('rm','REMESH');rm.mode='VOXEL';rm.voxel_size=S.get('vox',.016);bpy.ops.object.modifier_apply(modifier='rm')
print('remeshed',len(g.data.vertices),np.array([v.co[:] for v in g.data.vertices]).min(0).round(2),np.array([v.co[:] for v in g.data.vertices]).max(0).round(2))
# ---- cut it open with clean edges: planes for the hem and the cuffs, an ellipse for the neck
bm=bmesh.new();bm.from_mesh(g.data)
def gpos(v):c=v.co;return np.array([c.x,c.z,-c.y])
def cut(co,no,keep_side):   # bisect with a plane (game coords) and delete what's on the far side
    r=bmesh.ops.bisect_plane(bm,geom=bm.verts[:]+bm.edges[:]+bm.faces[:],plane_co=toB(np.array(co))[0],plane_no=toB(np.array(no))[0]-toB(np.zeros(3))[0],clear_inner=False,clear_outer=False)
    nb=toB(np.array(no))[0]-toB(np.zeros(3))[0];cb=toB(np.array(co))[0]
    kill=[f for f in bm.faces if keep_side(f) and (np.array(f.calc_center_median())-cb).dot(nb)>1e-5]
    bmesh.ops.delete(bm,geom=kill,context='FACES')
hem=S.get('hem',hy)
cut([0,hem,0],[0,-1,0],lambda f:True)
sl=S.get('sleeve','long')
for sd in (1,-1):
    a=JP['LeftArm']*[sd,1,1];e=JP['LeftForeArm']*[sd,1,1];h=JP['LeftHand']*[sd,1,1]
    x={'long':h[0]-sd*.035,'short':a[0]+(e[0]-a[0])*.5,'none':a[0]-sd*.04}[sl]
    cut([x,0,0],[sd,0,0],(lambda f:gpos(f.verts[0])[1]>hy+.15) if sl=='none' else (lambda f:True))
# neck: the head goes, then everything inside an ellipse round the neck above the shoulders, and the hole's edge is laid on the ellipse
kill=[f for f in bm.faces if np.mean([gpos(v) for v in f.verts],0)[1]>ny+.01 and abs(np.mean([gpos(v) for v in f.verts],0)[0])<.14]
bmesh.ops.delete(bm,geom=kill,context='FACES')
nk=S.get('neck',.085);nz=S.get('neckz',.07);ncz=JP['Neck'][2]+S.get('neckdz',.01);ys=JP['LeftShoulder'][1]-.05
kill=[]
for f in bm.faces:
    c=np.mean([gpos(v) for v in f.verts],0)
    if c[1]>ys and (c[0]/nk)**2+((c[2]-ncz)/nz)**2<1:kill.append(f)
    elif S.get('vneck') and c[2]>ncz and abs(c[0])<.025*(1+(c[1]-(ny-S['vneck']))/S['vneck']) and c[1]>ny-S['vneck']:kill.append(f)
bmesh.ops.delete(bm,geom=kill,context='FACES')
# slits up the front and back of the skirt (as riding and fighting cotes had), so a striding leg parts the cloth instead of going through it
if S.get('slit'):
    st_=S['slit'];kill=[]
    for f in bm.faces:
        c=np.mean([gpos(v) for v in f.verts],0)
        if c[1]<st_ and abs(c[0]-JP['Hips'][0])<S.get('slitw',.012)*(1+(st_-c[1])*1.5):kill.append(f)
    bmesh.ops.delete(bm,geom=kill,context='FACES')
# drop stray bits: keep only the largest connected piece
bm.verts.ensure_lookup_table();seen=set();parts=[]
for v in bm.verts:
    if v.index in seen:continue
    st=[v];comp=[]
    while st:
        u=st.pop()
        if u.index in seen:continue
        seen.add(u.index);comp.append(u);st.extend(e.other_vert(u) for e in u.link_edges)
    parts.append(comp)
parts.sort(key=len);[bmesh.ops.delete(bm,geom=p_,context='VERTS') for p_ in parts[:-1]]
bm.to_mesh(g.data);bm.free()
bpy.context.view_layer.objects.active=g;bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='DESELECT');bpy.ops.object.mode_set(mode='OBJECT')
# the belt cinches the cloth in to the body: the band's vertices are drawn in to just off the skin and pinned there, so the spare
# width above and below gathers into folds as it does under a real belt
if S.get('belt'):
    by=S['belt'];m=(np.abs(P[:,1]-by)<.015)&(armw<.3)&(np.abs(P[:,0])<.3);Q=P[m];bc=np.array([Q[:,0].mean(),by,Q[:,2].mean()])
    angB=np.arctan2(Q[:,2]-bc[2],Q[:,0]-bc[0]);radB=np.hypot(Q[:,2]-bc[2],Q[:,0]-bc[0]);o_=np.argsort(angB);angB,radB=angB[o_],radB[o_]
    for v in g.data.vertices:
        c=gpos(v);dy=abs(c[1]-by)
        if dy<.03:
            ang=math.atan2(c[2]-bc[2],c[0]-bc[0]);rb=np.interp(ang,angB,radB,period=2*np.pi)+S.get('beltoff',.008);rc=math.hypot(c[2]-bc[2],c[0]-bc[0])
            k=max(0,1-dy/.03)**2;r=rc+(rb-rc)*k;v.co=toB(np.array([bc[0]+r*math.cos(ang),c[1],bc[2]+r*math.sin(ang)]))[0]
# pin groups: shoulders (and neck band) and the belt
vg=g.vertex_groups.new(name='pin')
pin=[]
for v in g.data.vertices:
    c=gpos(v)
    if c[1]>JP['LeftArm'][1]+.03 and abs(c[0])<JP['LeftArm'][0]:pin.append(v.index)
    elif S.get('belt') and abs(c[1]-S['belt'])<.012:pin.append(v.index)
vg.add(pin,1.0,'REPLACE')
cl=g.modifiers.new('cloth','CLOTH');cs=cl.settings;cs.vertex_group_mass='pin';cs.quality=S.get('q',6);cs.mass=S.get('mass',.25)
cs.tension_stiffness=S.get('tens',15);cs.compression_stiffness=S.get('tens',15);cs.shear_stiffness=5;cs.bending_stiffness=S.get('bend',.3)
cs.air_damping=1.5;cs.use_pressure=False;cs.shrink_min=S.get('shrink',0.)
cl.collision_settings.collision_quality=3;cl.collision_settings.distance_min=.004
cl.collision_settings.use_self_collision=S.get('self',True);cl.collision_settings.self_distance_min=.004
sc=bpy.context.scene;NF=S.get('frames',45);sc.frame_start=1;sc.frame_end=NF;cl.point_cache.frame_end=NF
t=time.time()
for f in range(1,NF+1):sc.frame_set(f)
bpy.ops.object.modifier_apply(modifier='cloth')
# settle the voxel grain and thin it out: a few smoothing passes (edges kept), then decimate to a game budget
sm=g.modifiers.new('sm','LAPLACIANSMOOTH');sm.iterations=S.get('smooth',2);sm.lambda_factor=.35;sm.use_volume_preserve=True;sm.use_normalized=True;bpy.ops.object.modifier_apply(modifier='sm')
dc=g.modifiers.new('dc','DECIMATE');dc.ratio=min(1,S.get('tris',9000)/max(1,len(g.data.polygons)*2));bpy.ops.object.modifier_apply(modifier='dc')
dg=bpy.context.evaluated_depsgraph_get();ev=g.evaluated_get(dg);me=ev.to_mesh()
V=fromB(np.array([v.co[:] for v in me.vertices]))
F=[];[F.extend([[p.vertices[0],p.vertices[k],p.vertices[k+1]] for k in range(1,len(p.vertices)-1)]) for p in me.polygons]
F=np.array(F)
print(GAR,BLD,'sim %.0fs'%(time.time()-t),'verts',len(V),'tris',len(F))
np.savez(SC+'gar_%s_%s.npz'%(GAR,BLD),V=V,F=F)
