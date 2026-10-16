import {test} from 'node:test';import assert from 'node:assert/strict';import{readFileSync,existsSync}from'node:fs';import ts from'typescript';
function moduleUrl(url){let source=ts.transpileModule(readFileSync(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;source=source.replace(/from\s+(["'])([^"']+)\1/g,(_,q,s)=>{if(!s.startsWith('.'))return `from ${JSON.stringify(import.meta.resolve(s))}`;const target=new URL(existsSync(new URL(s,url))?s:s+'.ts',url);return `from ${JSON.stringify(moduleUrl(target))}`});return `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`}
const {checkedMetadata}=await import(moduleUrl(new URL('../src/services/evidence.ts',import.meta.url)));
test('Evidence validation preserves optional six-colour annotations and historical geometry',()=>{
 const legacy={tool:'arrow',points:[{x:.1,y:.2},{x:.3,y:.4}]};
 const metadata={version:1,width:800,height:600,annotations:[legacy,...['#FFFFFF','#000000','#FACC15','#2563EB','#EF4444','#22C55E'].map(color=>({tool:'text',text:'Note',color,points:[{x:.5,y:.5}]}))]};
 const serialized=JSON.stringify(metadata);assert.equal(checkedMetadata(metadata),metadata);assert.equal(JSON.stringify(metadata),serialized);assert.equal(metadata.annotations[0].color,undefined);
});
test('Evidence validation still rejects invalid colours and non-normalized points',()=>{
 const metadata={version:1,width:800,height:600,annotations:[{tool:'draw',points:[{x:.5,y:.5}],color:'url(unsafe)'}]};
 assert.throws(()=>checkedMetadata(metadata));assert.throws(()=>checkedMetadata({...metadata,annotations:[{tool:'draw',color:'#FFFFFF',points:[{x:2,y:.5}]}]}));
});
