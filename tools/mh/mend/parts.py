# read / write assets/mhparts/<id>.bin
import json,struct,numpy as np
def read(path):
    b=open(path,'rb').read();assert b[:4]==b'BMP1';hl=struct.unpack('<I',b[4:8])[0];H=json.loads(b[8:8+hl]);base=8+hl;A={}
    for k,(o,t,sh) in H['layout'].items():
        n=int(np.prod(sh));A[k]=np.frombuffer(b,dtype=np.dtype(t),count=n,offset=base+o).reshape(sh).copy()
    return H,A
def write(path,H,A):
    o=0;lay={};order=list(H['layout'].keys())
    for k in order:
        a=A[k];lay[k]=[o,str(a.dtype),list(a.shape)];o+=a.nbytes;o+=(-o)%4
    H=dict(H);H['layout']=lay;hj=json.dumps(H).encode();hj+=b' '*((-len(hj))%4)
    with open(path,'wb') as f:
        f.write(b'BMP1'+struct.pack('<I',len(hj))+hj)
        for k in order:a=A[k];f.write(a.tobytes());f.write(b'\0'*((-a.nbytes)%4))
if __name__=='__main__':
    import sys
    H,A=read(sys.argv[1]);print({k:v for k,v in H.items() if k!='layout'});[print(k,v.dtype,v.shape) for k,v in A.items()]
