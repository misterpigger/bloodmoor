import sys,json
from PIL import Image,ImageDraw
outs=[]
for f,lab in zip(sys.argv[2::2],sys.argv[3::2]):
    d=json.load(open(f));S=7;W=560;im=Image.new('RGB',(W,W),(18,16,14));D=ImageDraw.Draw(im);P=lambda x,z:(W/2+x*S,W/2+z*S)
    for x0,x1,z0,z1 in d['cors']:D.rectangle([P(x0,z0),P(x1,z1)],fill=(92,84,72))
    for c in d['cells']:
        col={'start':(120,140,110),'exit':(150,110,90),'hall':(128,118,100),'node':(100,92,80)}.get(c['type'],(140,128,108))
        D.rectangle([P(c['cx']-c['hx'],c['cz']-c['hz']),P(c['cx']+c['hx'],c['cz']+c['hz'])],fill=col)
        if c['sunk']:D.rectangle([P(c['cx']-c['sunk'][0],c['cz']-c['sunk'][1]),P(c['cx']+c['sunk'][0],c['cz']+c['sunk'][1])],fill=(70,62,52))
        D.text(P(c['cx']-c['hx']+.5,c['cz']-c['hz']+.3),c['kind'] or c['type'],fill=(20,18,16))
    for x,z in d['ways']:D.ellipse([P(x-.7,z-.7),P(x+.7,z+.7)],fill=(230,190,90))
    if d.get('key'):D.rectangle([P(d['key'][0]-.6,d['key'][1]-.6),P(d['key'][0]+.6,d['key'][1]+.6)],outline=(240,230,120),width=2)
    D.text((8,6),lab,fill=(240,240,200));outs.append(im)
S2=Image.new('RGB',(560*len(outs),560))
for i,im in enumerate(outs):S2.paste(im,(i*560,0))
S2.save(sys.argv[1],quality=92)
