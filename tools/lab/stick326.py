# draw dumps from dump326.mjs as stick figures in the body's own frame, side by side (one column per dump), every EVERY frames
# usage: python3 stick326.py out.png every view a.json [b.json ...]   view: side|back
import json,sys,math
from PIL import Image,ImageDraw
out,every,view=sys.argv[1],int(sys.argv[2]),sys.argv[3];dumps=[json.load(open(f)) for f in sys.argv[4:]]
B=[('Hips','Spine1'),('Spine1','Spine2'),('Spine2','Neck'),('Neck','Head'),('Spine2','RightArm'),('RightArm','RightForeArm'),('RightForeArm','RightHand'),('Spine2','LeftArm'),('LeftArm','LeftForeArm'),('LeftForeArm','LeftHand'),
   ('Hips','RightUpLeg'),('RightUpLeg','RightLeg'),('RightLeg','RightFoot'),('RightFoot','RightToeBase'),('Hips','LeftUpLeg'),('LeftUpLeg','LeftLeg'),('LeftLeg','LeftFoot'),('LeftFoot','LeftToeBase')]
CW,CH,S=150,190,85
n=min(len(d) for d in dumps);idx=list(range(0,n,every));cols=10;rows=math.ceil(len(idx)/cols)
img=Image.new('RGB',(cols*CW*len(dumps)+10*(len(dumps)-1),rows*CH),(250,250,250));dr=ImageDraw.Draw(img)
for di,d in enumerate(dumps):
  ox0=di*(cols*CW+10)
  for k,i in enumerate(idx):
    f=d[i];r=f['r'];y=f['y'];fw=(math.sin(y),math.cos(y));rt=(math.cos(y),-math.sin(y))
    def P(p):
      dx,dy,dz=p[0]-r[0],p[1],p[2]-r[2];a=dx*fw[0]+dz*fw[1];b=dx*rt[0]+dz*rt[1]
      u=a if view=='side' else -b
      return (ox0+(k%cols)*CW+CW/2+u*S,(k//cols)*CH+CH-12-dy*S)
    cx,cy=ox0+(k%cols)*CW,(k//cols)*CH
    dr.line([(cx,cy+CH-12),(cx+CW,cy+CH-12)],fill=(200,200,200))
    for a,b in B:
      col=(200,40,40) if 'Right' in a+b else (40,80,200) if 'Left' in a+b else (30,30,30)
      dr.line([P(f['j'][a]),P(f['j'][b])],fill=col,width=2)
    if 'h' in f: dr.line([P(f['h']),P(f['t'])],fill=(120,120,120),width=1)
    dr.text((cx+3,cy+2),str(i)+(' D' if f['d'] else ''),fill=(0,0,0))
img.save(out)
