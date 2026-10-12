"""Verify original-file integrity, transparent output and untouched character RGB."""
from pathlib import Path
from PIL import Image
import json,hashlib
import numpy as np
root=Path(__file__).resolve().parents[1]/'public/assets/works/ip'
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
for name,digest in manifest['originals'].items():
    assert hashlib.sha256((root/'originals'/name).read_bytes()).hexdigest()==digest,name
    source=Path(manifest['sourceFolder'])/name
    if source.exists():assert source.read_bytes()==(root/'originals'/name).read_bytes(),name
for record in manifest['characters']:
    source=Image.open(root/'originals'/record['source']).crop(record['crop']).convert('RGB')
    output=Image.open(root/record['display'])
    assert output.mode=='RGBA'
    assert np.array_equal(np.array(source),np.array(output)[:,:,:3]),record['id']
    alpha=np.array(output)[:,:,3]
    assert alpha.min()==0 and alpha.max()==255
    assert (alpha==0).sum()>alpha.size*.2
print(f"Verified {len(manifest['originals'])} unchanged originals and {len(manifest['characters'])} original-pixel RGBA characters.")
