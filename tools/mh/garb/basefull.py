# full MakeHuman base mesh (with helpers) for each fighter build, carried into the final (game) bind space:
# V_final[v] = V_mh[v]*.1 + delta, delta from the nearest body vertex (build_mh -> fighters.json moved limbs and joints)
import os
import sys,os,numpy as np
SC=os.environ.get('MH_SRC','src')+'/'
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../')+'tools/mh/build_mh.py').read();src=src[:src.index("HEIGHT = 1.78")]
sys.argv=['x',SC+'mh/mh/makehuman/data',SC+'mh/mpfb/src/mpfb/data',SC+'garb/tmp_out'];G={'__name__':'bm'};exec(src,G)
from scipy.spatial import cKDTree
rv=np.load(SC+'garb/rv_v.npy');body_idx=G['grp']('body')
def full(name):
    B=[b for b in G['BODIES'] if b['name']=='MH_Body_'+name][0]
    V=G['V0']+G['macro'](B['muscle'],B['weight'],B['race'])+G['face_variation'](B['seed'],.28)
    vb=V[body_idx];lo,hi=vb[:,1].min(),vb[:,1].max();V=(V-np.array([0,lo,0]))*(1.78*10/(hi-lo))*.1
    d=np.load(SC+'garb/body_%s.npz'%name);P=d['P'];delta=P-V[rv]
    acc=np.zeros_like(V);cnt=np.zeros(len(V));np.add.at(acc,rv,delta);np.add.at(cnt,rv,1)
    has=cnt>0;acc[has]/=cnt[has][:,None]
    t=cKDTree(V[has]);_,j=t.query(V[~has]);acc[~has]=acc[has][j]
    return V+acc
if __name__=='__main__':
    for n in 'ABCD':
        F=full(n);np.save(SC+'garb/full_%s.npy'%n,F);print(n,F.shape)
