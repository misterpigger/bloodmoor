# how much the trunk moves in a dump326 dump: shoulder line vs hip line turn, trunk lean fwd/side (Hips->Neck vs vertical, body frame), head pitch vs chest
import json,sys,math
def pct(a,p): b=sorted(a); return b[min(len(b)-1,int(len(b)*p))] if b else 0
for f in sys.argv[1:]:
  d=json.load(open(f)); tw=[];fw=[];sd=[];hd=[]
  for fr in d:
    if fr['d']: continue
    j=fr['j'];y=fr['y'];F=(math.sin(y),math.cos(y));Rt=(math.cos(y),-math.sin(y))
    def v(a,b): return [j[b][i]-j[a][i] for i in range(3)]
    s=v('LeftArm','RightArm');h=v('LeftUpLeg','RightUpLeg')
    tw.append(abs(math.degrees(math.atan2(s[0]*h[2]-s[2]*h[0],s[0]*h[0]+s[2]*h[2]))))
    t=v('Hips','Neck');L=math.hypot(*t);fwc=(t[0]*F[0]+t[2]*F[1])/L;sdc=(t[0]*Rt[0]+t[2]*Rt[1])/L
    fw.append(math.degrees(math.asin(max(-1,min(1,fwc)))));sd.append(abs(math.degrees(math.asin(max(-1,min(1,sdc))))))
    n=v('Neck','Head');c=v('Spine2','Neck');ca=math.degrees(math.acos(max(-1,min(1,sum(n[i]*c[i] for i in range(3))/math.hypot(*n)/math.hypot(*c)))));hd.append(ca)
  print(f.split('/')[-1],'twist p50/p90/max %.0f/%.0f/%.0f'%(pct(tw,.5),pct(tw,.9),max(tw)),'lean fwd p10/p50/p90 %.0f/%.0f/%.0f'%(pct(fw,.1),pct(fw,.5),pct(fw,.9)),'side p90 %.0f'%pct(sd,.9),'neck bend p50/p90 %.0f/%.0f'%(pct(hd,.5),pct(hd,.9)))
