import os
import sys;sys.path.insert(0,'$(dirname $0)')
from proxies import *
P=[('h_crop',G1+'hair/short02/','short02','short02_diffuse.png','short02_normal.png','hair'),
   ('h_messy',G2+'hair01_cc0/hair/cortu_short_messy_hair/','short_messy','short_messy_diff.png',None,'hair'),
   ('h_page',G2+'hair01_cc0/hair/littleright_bobcut_hair/','littleright_hair_bobcut','hairtex.png',None,'hair'),
   ('h_long',G2+'hair01_cc0/hair/o4saken_long01/','o4saken_long01','o4saken_long01.png','o4saken_long01_nrm.png','hair'),
   ('b_scruffy',G2+'bodyparts05_cc0/clothes/wdg_scruffy_beard/','scruffy_beard','beard2_texture-SMUDGE2.png',None,'beard'),
   ('b_full',G2+'bodyparts05_cc0/clothes/rehmanpolanski_beard_viking/','beardviking','BeardViking.png',None,'beard'),
   ('b_mous',G2+'bodyparts05_cc0/clothes/rehmanpolanski_moustache_viking/','moustacheviking','MoustacheViking.png',None,'beard'),
   ('brow1',G1+'eyebrows/eyebrow001/','eyebrow001','eyebrow001.png',None,'brow'),
   ('lash1',G1+'eyelashes/eyelashes01/','eyelashes01','eyelashes01.png',None,'lash')]
import glob
for pid,d,ob,dif,nrm,kind in P:
    mh=glob.glob(d+'*.mhclo')[0];tex={'d':texout(d+dif,pid+'_d.webp',1024 if kind in('hair','beard') else 512)}
    if nrm:tex['n']=texout(d+nrm,pid+'_n.webp',1024,False)
    write(pid,d+ob+'.obj',mh,tex,kind)
