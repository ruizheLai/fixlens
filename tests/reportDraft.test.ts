import{test}from'node:test';import assert from'node:assert/strict';import{approvedDetails}from'../src/features/report/reportDraft.ts';
const report={issueType:'Water leak',location:'Kitchen',condition:'Kitchen tap leaks',description:'My words',safetyResponse:'No immediate danger reported'};
test('Approved details preserve original wording and safety, and clear an untouched stale interpretation',()=>{
 const edited=approvedDetails(report,{...report,issueType:'Fixture damage',location:'Bathroom',description:'My edited\nwording',condition:'Cracked basin'});
 assert.equal(edited.condition,'Cracked basin');assert.equal(edited.description,'My edited\nwording');assert.equal(edited.safetyResponse,report.safetyResponse);assert.equal(report.description,'My words');
 assert.equal(approvedDetails(report,{...report,description:'New facts'}).condition,null);
 assert.deepEqual(approvedDetails(report,report),report);assert.throws(()=>approvedDetails(report,{...report,issueType:' '}));
});
