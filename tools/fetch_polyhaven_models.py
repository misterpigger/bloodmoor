# Downloads CC0 3D models from Poly Haven (glTF, 1k textures) for the maps and props, plus a catalogue of every model.
# Run by .github/workflows/fetch-models.yml on GitHub's servers (the dev workspace can't reach Poly Haven).
import json,os,re,urllib.request,time,sys
UA={'User-Agent':'bloodmoor-asset-fetch/1.0 (CC0 game assets)'}
def get(u):
    err=None
    for k in range(4):
        try:return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=90).read()
        except Exception as e:err=e;time.sleep(3)
    raise err
OUT=sys.argv[1] if len(sys.argv)>1 else 'models'
os.makedirs(OUT,exist_ok=True)
assets=json.loads(get('https://api.polyhaven.com/assets?t=models'))
json.dump({k:{'name':a.get('name'),'tags':a.get('tags'),'categories':a.get('categories'),'polycount':a.get('polycount')} for k,a in assets.items()},open(os.path.join(OUT,'catalog.json'),'w'),indent=0)
want=re.compile(r'\b(barrel|crate|chair|table|stool|bench|lantern|candle|rock|boulder|stump|log|bucket|sack|cart|wagon|anvil|shield|chest|pot|jug|bottle|rope|plank|fence|well|cauldron|basket|firewood|shelf|cabinet|door|beam|ruin|statue|pillar|column|vase|bowl|cup|mug|plate|tankard|lamp|torch|hay|straw|ladder|wheel|boat|anchor|oar|axe|hammer|sword|dagger|stone|wooden|medieval|bush|fern|tree|grass)')
picked=[]
for k,a in assets.items():
    s=(a.get('name','')+' '+' '.join(a.get('tags',[]))+' '+' '.join(a.get('categories',[]))).lower()
    if want.search(s):picked.append(k)
if os.environ.get('IDS'):picked=[k for k in os.environ['IDS'].split() if k in assets]
picked.sort();print(len(picked),'match of',len(assets))
total=0;n=0;LIM=int(os.environ.get('LIMIT_MB','700'))*1e6
for k in picked:
    try:
        f=json.loads(get('https://api.polyhaven.com/files/'+k));g=f.get('gltf',{}).get('1k',{}).get('gltf')
        if not g:continue
        size=g.get('size',0)+sum(v.get('size',0) for v in g.get('include',{}).values())
        if size>40e6 or total+size>LIM:print('skip big',k,size);continue
        d=os.path.join(OUT,k);os.makedirs(d,exist_ok=True)
        open(os.path.join(d,os.path.basename(g['url'])),'wb').write(get(g['url']))
        for rel,inf in g.get('include',{}).items():
            p=os.path.join(d,rel);os.makedirs(os.path.dirname(p),exist_ok=True);open(p,'wb').write(get(inf['url']))
        total+=size;n+=1;print('ok',k,round(size/1e6,1),'MB')
    except Exception as e:print('fail',k,e)
print('downloaded',n,'models',round(total/1e6),'MB')
