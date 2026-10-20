'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'aide-current-time-'));
try {
 const plugin=path.join(temporary,'current-time');fs.mkdirSync(plugin);
 for(const name of ['index.js','manifest.json','test.js'])fs.copyFileSync(path.join(root,name),path.join(plugin,name));
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 fs.writeFileSync(path.join(temporary,'registry.json'),JSON.stringify({plugins:[manifest]}));
 cp.execFileSync(process.execPath,[path.join(plugin,'test.js')],{stdio:'inherit'});
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
