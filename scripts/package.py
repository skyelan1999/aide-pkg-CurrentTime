#!/usr/bin/env python3
import hashlib,json,zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1];m=json.loads((root/'manifest.json').read_text());out=root/'packages'/('v'+m['version']);out.mkdir(parents=True,exist_ok=True);archive=out/(root.name+'-v'+m['version']+'.zip')
files=['LICENSE','README.md','CHANGELOG.md','THIRD_PARTY_NOTICES.md','manifest.json','index.js','workbench.html']
if m['id']=='lunar-calendar':files+=['lib/calendar.js','vendor/hko-reference.json','vendor/hko-provenance.json']
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for name in sorted(files):
  info=zipfile.ZipInfo(name,(2026,10,21,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,(root/name).read_bytes())
digest=hashlib.sha256(archive.read_bytes()).hexdigest();(out/'SHA256SUMS').write_text(digest+'  '+archive.name+'\n');print(json.dumps({'file':str(archive),'sha256':digest,'bytes':archive.stat().st_size}))
