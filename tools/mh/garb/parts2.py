import os
import sys;sys.path.insert(0,'$(dirname $0)')
from proxies import *
import glob
P=[('h_maxwell',G2+'hair02_ccby/hair/elvs_maxwell_hair/','hair'),('h_alpha7',G2+'hair03_ccby/hair/punkduck_alpha7_long/','hair'),('h_sidedo',G2+'hair02_ccby/hair/elvs_short_side_do/','hair'),
   ('h_cl01',G2+'hair01_cc0/hair/culturalibre_hair_01/','hair'),('b_sigmund',G2+'bodyparts05_cc0/clothes/grinsegold_beard_sigmund_wip/','beard')]
import re
for pid,d,kind in P:
    mh=glob.glob(d+'*.mhclo')[0];txt=open(mh,encoding='utf8',errors='ignore').read();ob=re.search(r'obj_file\s+(\S+)',txt).group(1)
    mm=glob.glob(d+'*.mhmat');dif=nrm=None
    if mm:
        t=open(mm[0],encoding='utf8',errors='ignore').read();m1=re.search(r'diffuseTexture\s+(\S+)',t);m2=re.search(r'normalmapTexture\s+(\S+)',t)
        dif=m1 and os.path.basename(m1.group(1));nrm=m2 and os.path.basename(m2.group(1))
    if not dif or not os.path.exists(d+dif):dif=[os.path.basename(f) for f in glob.glob(d+'*.png') if 'norm' not in f.lower() and 'nrm' not in f.lower()][0]
    tex={'d':texout(d+dif,pid+'_d.webp',1024)}
    if nrm and os.path.exists(d+nrm):tex['n']=texout(d+nrm,pid+'_n.webp',1024,False)
    write(pid,d+ob,mh,tex,kind)
