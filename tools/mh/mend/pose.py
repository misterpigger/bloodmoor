import os
# pose a body and a garment by linear-blend skinning, offline: arms brought down / forward from the T-pose
import json,base64,numpy as np,math
from body import load
ROOT=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../..'))+'/'
_g=None
def skel(b):
    global _g
    if _g is None:_g=json.load(open(ROOT+'fighters.json'))
    g=_g;si={'A':0,'B':2,'C':4,'D':6}[b];sk=g['skins'][si];joints=sk['joints'];names=[g['nodes'][j]['name'].replace('mixamorig:','').replace('mixamorig','') for j in joints]
    buf=base64.b64decode(g['buffers'][0]['uri'].split(',',1)[1]) if not hasattr(skel,'buf') else skel.buf;skel.buf=buf
    a=g['accessors'][sk['inverseBindMatrices']];bv=g['bufferViews'][a['bufferView']];o=bv.get('byteOffset',0)+a.get('byteOffset',0)
    IBM=np.frombuffer(buf,np.float32,count=a['count']*16,offset=o).reshape(-1,4,4).transpose(0,2,1).astype(np.float64);BW=np.linalg.inv(IBM)
    par={}
    for i,n in enumerate(g['nodes']):
        for c in n.get('children',[]):par[c]=i
    jp=[joints.index(par[j]) if par.get(j) in joints else -1 for j in joints]
    return names,BW,jp
def rotm(axis,ang):
    axis=np.asarray(axis,float);axis/=np.linalg.norm(axis);x,y,z=axis;c,s=math.cos(ang),math.sin(ang);C=1-c
    return np.array([[c+x*x*C,x*y*C-z*s,x*z*C+y*s],[y*x*C+z*s,c+y*y*C,y*z*C-x*s],[z*x*C-y*s,z*y*C+x*s,c+z*z*C]])
def deltas(b,pose):
    # pose: list of (bone, axis (world), angle) applied at the bone's joint to it and everything below it, in order
    names,BW,jp=skel(b);n=len(names);D=[np.eye(4) for _ in range(n)]
    def subtree(i):
        out=[i];k=0
        while k<len(out):
            out+=[c for c in range(n) if jp[c]==out[k]];k+=1
        return out
    for bone,axis,ang in pose:
        i=names.index(bone);piv=(D[i]@BW[i])[:3,3];M=np.eye(4);M[:3,:3]=rotm(axis,ang);M[:3,3]=piv-M[:3,:3]@piv
        for c in subtree(i):D[c]=M@D[c]
    return names,np.array(D)
def skin(V,W,D):
    Vh=np.concatenate([V,np.ones((len(V),1))],1);out=np.zeros((len(V),3))
    for bidx in np.flatnonzero(W.sum(0)>1e-6):out+=W[:,bidx:bidx+1]*(Vh@D[bidx].T)[:,:3]
    return out
POSES={'down':lambda s:[('LeftShoulder',[0,0,1],-.2),('RightShoulder',[0,0,1],.2),('LeftArm',[0,0,1],-1.05),('RightArm',[0,0,1],1.05)],
       'guard':lambda s:[('LeftShoulder',[0,0,1],-.15),('RightShoulder',[0,0,1],.15),('LeftArm',[0,0,1],-1.0),('RightArm',[0,0,1],1.0),('LeftArm',[0,1,0],-.7),('RightArm',[0,1,0],.7),('LeftForeArm',[0,1,0],-1.2),('RightForeArm',[0,1,0],1.2)],
       'up':lambda s:[('LeftArm',[0,0,1],.9),('RightArm',[0,0,1],-.9)]}
def body_w(B):
    nb=len(B['names']);W=np.zeros((len(B['P']),nb))
    for k in range(4):np.add.at(W,(np.arange(len(W)),B['J'][:,k]),B['W'][:,k])
    return W/W.sum(1,keepdims=True)
