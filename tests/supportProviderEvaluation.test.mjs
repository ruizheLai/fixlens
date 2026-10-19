import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFetch, estimatePass, usageCost, evaluationCases } from './supportProviderEvaluation.mjs';
import { MODEL } from '../supabase/functions/answer-maintenance-question/provider.ts';
import { createSupportHandler } from '../supabase/functions/answer-maintenance-question/handler.ts';
const options = { method:'POST',headers:{Authorization:'Bearer mock-never-recorded'},body:JSON.stringify({model:MODEL,store:false,max_output_tokens:400,text:{format:{name:'support_scope'}}}) };
const url = 'https://api.openai.com/v1/responses';
test('Evaluation planning and actual usage cost stay separate',()=>{
  const estimate=estimatePass(); assert.equal(estimate.maxCalls,44); assert.equal(estimate.maxOutputTokens,18700); assert.ok(estimate.planningUsd<0.50);
  assert.deepEqual(usageCost({input_tokens:1000,output_tokens:100,input_tokens_details:{cached_tokens:200}}),{inputTokens:1000,cachedInputTokens:200,outputTokens:100,estimatedUsd:0.0005});
  assert.throws(()=>usageCost({input_tokens:100,output_tokens:10,input_tokens_details:{cached_tokens:101}}));
});
test('No approval, insufficient allowance, wrong destination or unexpected model never reaches provider',async()=>{
  let calls=0; const fetcher=async()=>{calls++;return Response.json({})};
  for(const config of [{approved:false},{approved:true,ceilingUsd:0}])await assert.rejects(auditFetch(fetcher,config).request(url,options));
  await assert.rejects(auditFetch(fetcher,{approved:true}).request('https://unrelated.invalid',options));
  await assert.rejects(auditFetch(fetcher,{approved:true}).request(url,{...options,body:JSON.stringify({model:'other'})}));
  assert.equal(calls,0);
});
test('Observer records usage/classification without headers and stops after transport/usage failure',async()=>{
  const audit=auditFetch(async()=>Response.json({usage:{input_tokens:100,output_tokens:10},output:[{type:'message',content:[{type:'output_text',text:'{"scope":"out_of_scope"}'}]}]}),{approved:true,maxCalls:1});
  const response=await audit.request(url,options); assert.equal(response.status,200); assert.equal(audit.calls[0].classification.scope,'out_of_scope');assert.ok(!JSON.stringify(audit.calls).includes('mock-never-recorded'));
  await assert.rejects(audit.request(url,options));
  const bad=auditFetch(async()=>new Response(null,{status:401}),{approved:true});await assert.rejects(bad.request(url,options));assert.equal(bad.fatal,true);await assert.rejects(bad.request(url,options));assert.equal(bad.calls.length,1);
});
test('Actual handler/provider pipeline is observed without changing deployed provider code',async()=>{
  const native = globalThis.fetch;
  const audit = auditFetch(async(url,init)=>{
    const name=JSON.parse(init.body).text.format.name;
    const value=name==='support_scope'?{scope:'in_scope',maintenanceQuestion:'How do I document a leaking tap?',mixed:false,boundary:'none',faq:null}:{answer:'Describe where and when it leaks, without attempting repairs.'};
    return Response.json({status:'completed',usage:{input_tokens:200,output_tokens:50},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(value)}]}]});
  },{approved:true});
  globalThis.fetch=audit.request;
  try{
    const handler=createSupportHandler({apiKey:'test-not-real',clientKeys:['local'],origins:['http://localhost:5173'],budget:async()=>({allowed:true,retry_after:0})});
    const response=await handler(new Request('http://localhost/support',{method:'POST',headers:{origin:'http://localhost:5173',apikey:'local','Content-Type':'application/json'},body:JSON.stringify({question:'What photos should I include?',history:[]})}));
    assert.equal(response.status,200);assert.deepEqual(audit.calls.map(c=>c.stage),['support_scope','support_answer']);assert.equal(audit.calls[0].classification.scope,'in_scope');assert.equal(audit.calls[1].usage.inputTokens,200);
  }finally{globalThis.fetch=native;}
});

test('Focused suite preserves every original case and appends 14 independent held-out scenarios',async()=>{
  const original=await evaluationCases(); const focused=await evaluationCases('focused');
  assert.equal(original.length,22); assert.equal(focused.length,36); assert.deepEqual(focused.slice(0,22),original);
  assert.equal(new Set(focused.map(c=>c.id)).size,36);
  assert.equal(estimatePass(focused.length).maxCalls,72);
  assert.ok(estimatePass(focused.length).planningUsd<0.80);
  assert.equal(focused.filter(c=>c.scope.includes('safety_sensitive')).length>=4,true);
  await assert.rejects(evaluationCases('unknown'));
});

test('Final suite preserves all 36 previous cases and adds eight completeness probes within the unchanged two-call caps',async()=>{
  const focused=await evaluationCases('focused'); const final=await evaluationCases('final');
  assert.equal(final.length,44); assert.deepEqual(final.slice(0,36),focused);
  assert.equal(new Set(final.map(c=>c.id)).size,44);
  const estimate=estimatePass(final.length);
  assert.equal(estimate.maxCalls,88); assert.equal(estimate.maxOutputTokens,37400); assert.ok(estimate.planningUsd<1);
  assert.equal(final.find(c=>c.id==='F06').boundary,'legal_and_case_specific');
  assert.equal(final.find(c=>c.id==='F08').faq,null);
});
