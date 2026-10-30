# Downloads CC0 surface textures from Poly Haven (1k: colour, OpenGL normal, AO/rough/metal) whose names match TEXRE,
# plus the full catalogue. Run by .github/workflows/fetch-models.yml on GitHub's servers.
import json,os,re,urllib.request,time,sys,traceback
UA={'User-Agent':'bloodmoor-asset-fetch/1.0 (CC0 game assets)'}
def get(u):
    err=None
    for k in range(4):
        try:return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=90).read()
        except Exception as e:err=e;time.sleep(3)
    raise err
OUT=sys.argv[1];os.makedirs(OUT,exist_ok=True);LOG=open(os.path.join(OUT,'log.txt'),'w')
try:
    A=json.loads(get('https://api.polyhaven.com/assets?t=textures'))
except Exception:
    LOG.write(traceback.format_exc());LOG.close();sys.exit(0)
json.dump(A,open(os.path.join(OUT,'catalog.json'),'w'))
rx=re.compile(os.environ.get('TEXRE','plaster|timber|thatch|roof|cobble|brick|castle|medieval|plank|rough_wood|wooden|wood_|bark|sand|mud|dirt|forest_ground|stone_wall|stone_floor|flagstone|slate|rock_wall|gravel'))
n=0
for k,a in sorted(A.items()):
    s=(k+' '+str(a.get('name') or '')+' '+' '.join(a.get('tags') or [])).lower()
    if not rx.search(k+' '):continue
    try:
        f=json.loads(get('https://api.polyhaven.com/files/'+k));d=os.path.join(OUT,k);os.makedirs(d,exist_ok=True)
        for key,nm in [('Diffuse','d'),('nor_gl','n'),('arm','arm')]:
            u=((f.get(key) or {}).get('1k') or {}).get('jpg',{}).get('url')
            if u:open(os.path.join(d,nm+'.jpg'),'wb').write(get(u))
        n+=1;print('ok',k)
    except Exception as e:LOG.write('fail %s %s\n'%(k,e))
LOG.write('textures %d\n'%n);LOG.close();print('textures',n)
