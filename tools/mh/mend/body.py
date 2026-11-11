# fighters.json -> body A in its bind space (as tools/mh/garb/extract.py)
import json,base64,numpy as np,os
ROOT=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../..'))+'/'
def load(name='A'):
    f='body_%s.npz'%name
    if os.path.exists(f):
        d=np.load(f,allow_pickle=True);return {k:d[k] for k in d.files}
    g=json.load(open(ROOT+'fighters.json'));buf=base64.b64decode(g['buffers'][0]['uri'].split(',',1)[1])
    CT={5126:np.float32,5125:np.uint32,5123:np.uint16,5121:np.uint8};NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
    def acc(i):
        a=g['accessors'][i];bv=g['bufferViews'][a['bufferView']];o=bv.get('byteOffset',0)+a.get('byteOffset',0);n=NC[a['type']];dt=CT[a['componentType']]
        st=bv.get('byteStride');cnt=a['count'];isz=np.dtype(dt).itemsize*n
        if st and st!=isz:
            raw=np.frombuffer(buf,np.uint8,count=st*cnt,offset=o).reshape(cnt,st)[:,:isz];x=np.frombuffer(raw.tobytes(),dt).reshape(cnt,n)
        else:x=np.frombuffer(buf,dt,count=cnt*n,offset=o).reshape(cnt,n)
        if a.get('normalized'):x=x.astype(np.float32)/np.iinfo(dt).max
        return x
    mi={'A':0,'B':2,'C':4,'D':6}[name]
    print([(n.get('name'),n.get('mesh'),n.get('skin')) for n in g['nodes'] if 'mesh' in n])
    pr=g['meshes'][mi]['primitives'][0];A=pr['attributes'];sk=g['skins'][mi]
    names=[g['nodes'][j]['name'].replace('mixamorig:','').replace('mixamorig','') for j in sk['joints']]
    d=dict(P=acc(A['POSITION']).astype(np.float64),N=acc(A['NORMAL']).astype(np.float64),J=acc(A['JOINTS_0']).astype(np.int32),W=acc(A['WEIGHTS_0']).astype(np.float32),I=acc(pr['indices']).reshape(-1,3).astype(np.int32),names=np.array(names),COL=acc(A['COLOR_0']) if 'COLOR_0' in A else np.zeros((1,4)))
    np.savez(f,**d);return d
if __name__=='__main__':
    d=load('A');P=d['P'];print(P.shape,d['I'].shape,P.min(0).round(3),P.max(0).round(3),'COL',d['COL'].shape,d['COL'].max(0))
    names=list(d['names']);hi=[names.index(n) for n in ['Head','HeadTop_End']]
    w=np.zeros(len(P))
    for k in range(4):w+=d['W'][:,k]*np.isin(d['J'][:,k],hi)
    H=P[w>.5];print('head verts',len(H),H.min(0).round(3),H.max(0).round(3))
    # profile: front-most z per height band, widest x
    for y in np.arange(1.56,1.82,.02):
        m=(H[:,1]>y)&(H[:,1]<y+.02)
        if m.sum():print('y %.2f  zmin %.3f zmax %.3f  xmax %.3f n %d'%(y,H[m,2].min(),H[m,2].max(),np.abs(H[m,0]).max(),m.sum()))
