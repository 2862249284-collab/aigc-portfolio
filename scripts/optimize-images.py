"""Create display-only WebP derivatives. Original artwork is never modified."""
from pathlib import Path
from PIL import Image,ImageOps
import json
root=Path(__file__).resolve().parent.parent
out=root/'public/assets/previews';out.mkdir(exist_ok=True)
index={};before=after=0
for category in ['posters','banners']:
 text=(root/f'src/data/{category}.js').read_text(encoding='utf-8')
 records=json.loads(text[text.index('['):text.rindex(']')+1])
 for record in records:
  source=root/'public/assets/works'/record['category']/record['sourceFile']
  image=ImageOps.exif_transpose(Image.open(source));image.thumbnail((1600,1400),Image.Resampling.LANCZOS)
  dest=out/(record['id']+'.webp');image.save(dest,'WEBP',quality=88,method=6)
  index[record['media']]='/assets/previews/'+dest.name
  before+=source.stat().st_size;after+=dest.stat().st_size
(root/'src/data/display-images.js').write_text('// Display derivatives only; fullscreen retains original assets.\nexport const displayImages = '+json.dumps(index,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print(json.dumps({'images':len(index),'originalBytes':before,'displayBytes':after}))
