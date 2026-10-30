# fighters.json -> per build: bind-pose body (positions in the skin's bind space = world at bind), normals, uv, joints, weights, faces;
# joint world bind matrices and names. Saved as npz for the garment builder.
import os
import json,base64,numpy as np,sys
g=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../')+'fighters.json'));buf=base64.b64decode(g['buffers'][0]['uri'].split(',',1)[1])
CT={5126:np.float32,5125:np.uint32,5123:np.uint16,5121:np.uint8};NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(i):
    a=g['accessors'][i];bv=g['bufferViews'][a['bufferView']];o=bv.get('byteOffset',0)+a.get('byteOffset',0);n=NC[a['type']];dt=CT[a['componentType']]
    st=bv.get('byteStride');cnt=a['count'];isz=np.dtype(dt).itemsize*n
    if st and st!=isz:
        raw=np.frombuffer(buf,np.uint8,count=st*cnt,offset=o).reshape(cnt,st)[:,:isz];return np.frombuffer(raw.tobytes(),dt).reshape(cnt,n)
    x=np.frombuffer(buf,dt,count=cnt*n,offset=o).reshape(cnt,n)
    if a.get('normalized'):x=x.astype(np.float32)/np.iinfo(dt).max
    return x
# world matrices of nodes at rest (node TRS)
import math
def trs(n):
    M=np.eye(4)
    if 'matrix' in n:return np.array(n['matrix']).reshape(4,4).T
    t=n.get('translation',[0,0,0]);r=n.get('rotation',[0,0,0,1]);s=n.get('scale',[1,1,1]);x,y,z,w=r
    R=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    M[:3,:3]=R*np.array(s);M[:3,3]=t;return M
par={};[par.__setitem__(c,i) for i,n in enumerate(g['nodes']) for c in n.get('children',[])]
def world(i):
    M=trs(g['nodes'][i]);p=par.get(i)
    return M if p is None else world(p)@M
for name,mi,si in [('A',0,0),('B',2,2),('C',4,4),('D',6,6)]:
    pr=g['meshes'][mi]['primitives'][0];A=pr['attributes'];sk=g['skins'][si]
    P=acc(A['POSITION']);N=acc(A['NORMAL']);UV=acc(A['TEXCOORD_0']);J=acc(A['JOINTS_0']);W=acc(A['WEIGHTS_0']).astype(np.float32);I=acc(pr['indices']).reshape(-1,3)
    IBM=acc(sk['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1);names=[g['nodes'][j]['name'].replace('mixamorig:','').replace('mixamorig','') for j in sk['joints']]
    node=[i for i,n in enumerate(g['nodes']) if n.get('mesh')==mi][0];MW=world(node)
    np.savez('$(dirname $0)/body_'+name+'.npz',P=P,N=N,UV=UV,J=J.astype(np.int32),W=W,I=I.astype(np.int32),IBM=IBM,names=np.array(names),MW=MW,COL=acc(A['COLOR_0']) if 'COLOR_0' in A else 0)
    BW=np.linalg.inv(IBM);print(name,P.shape,I.shape,'bbox',P.min(0).round(3),P.max(0).round(3),'hips',BW[names.index('Hips')][:3,3].round(3),'mesh node world scale',np.linalg.norm(MW[:3,0]).round(3))
