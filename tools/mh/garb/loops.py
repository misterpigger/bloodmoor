import os
import numpy as np,sys
from collections import defaultdict
d=np.load(sys.argv[1]);V,F=d['V'],d['F'];print('extent',V.min(0).round(3),V.max(0).round(3),'verts',len(V))
ec=defaultdict(int)
for t in F:
    for a,b in ((t[0],t[1]),(t[1],t[2]),(t[2],t[0])):ec[(min(a,b),max(a,b))]+=1
be=[e for e,c in ec.items() if c==1];nb=defaultdict(list)
for a,b in be:nb[a].append(b);nb[b].append(a)
seen=set();loops=[]
for v in nb:
    if v in seen:continue
    st=[v];comp=[]
    while st:
        u=st.pop()
        if u in seen:continue
        seen.add(u);comp.append(u);st.extend(nb[u])
    loops.append(comp)
for L in sorted(loops,key=len,reverse=True):print(' loop',len(L),V[L].mean(0).round(3))
