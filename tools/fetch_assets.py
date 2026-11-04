# Downloads 3D models for weapons and armour on GitHub's servers (the dev workspace can't reach these hosts).
#  PH_IDS:  Poly Haven model ids (CC0), fetched as glTF at PH_RES (default 2k)
#  URLS:    lines "name url" for direct files (e.g. Zenodo copies of CC BY / CC0 Sketchfab models); saved as <name>.<ext>
import json,os,sys,time,urllib.request
UA={'User-Agent':'bloodmoor-asset-fetch/1.0 (open-licence game assets)'}
def get(u):
    err=None
    for k in range(4):
        try:return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=120).read()
        except Exception as e:err=e;time.sleep(4)
    raise err
OUT=sys.argv[1] if len(sys.argv)>1 else 'out';os.makedirs(OUT,exist_ok=True);log=[]
res=os.environ.get('PH_RES','2k')
for k in os.environ.get('PH_IDS','').split():
    try:
        f=json.loads(get('https://api.polyhaven.com/files/'+k));g=f.get('gltf',{}).get(res,{}).get('gltf') or f.get('gltf',{}).get('1k',{}).get('gltf')
        d=os.path.join(OUT,'ph',k);os.makedirs(d,exist_ok=True)
        open(os.path.join(d,os.path.basename(g['url'])),'wb').write(get(g['url']))
        for rel,inf in g.get('include',{}).items():
            p=os.path.join(d,rel);os.makedirs(os.path.dirname(p),exist_ok=True);open(p,'wb').write(get(inf['url']))
        log.append('ok ph '+k)
    except Exception as e:log.append('fail ph %s %s'%(k,e))
for line in os.environ.get('URLS','').strip().splitlines():
    if not line.strip():continue
    name,u=line.split(None,1)
    try:
        b=get(u.strip());ext=os.path.splitext(u.split('?')[0])[1] or '.bin'
        d=os.path.join(OUT,'url');os.makedirs(d,exist_ok=True);open(os.path.join(d,name+ext),'wb').write(b);log.append('ok url %s %d'%(name,len(b)))
    except Exception as e:log.append('fail url %s %s'%(name,e))
open(os.path.join(OUT,'log.txt'),'w').write('\n'.join(log));print('\n'.join(log))
