import { test } from "node:test";
import assert from "node:assert/strict";
import { demoPersona, caseRenterIdentity } from "../src/utils/demoPersona.ts";
import { homeCases } from "../src/data/homeCases.ts";
import { canRespondToRequest, requestResponsePath } from "../src/data/evidenceRequestPresentation.ts";
import type { CaseListItem } from "../src/types/case.ts";
const session="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const other="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const make=(key:string,owner:string|null,status:CaseListItem["status"]="under_review",updated="2026-10-14T10:00:00Z"):CaseListItem=>({
  caseKey:key,demoSessionId:owner,issueType:"Leak",title:"Leak "+key,location:"Kitchen",locationLabel:"Kitchen",status,updatedAt:updated,evidenceRequests:[],
});
const pending=(c:CaseListItem,kind="written_details")=>({id:"request-"+c.caseKey,caseKey:c.caseKey,requestType:kind as any,instruction:"Exact instruction",status:"requested" as const,createdAt:c.updatedAt});
test("Persona is deterministic, fictional, and identical for PM case attribution",()=>{
  const person=demoPersona(session);
  assert.deepEqual(demoPersona(session),person);
  assert.deepEqual(demoPersona(session.toUpperCase()),person);
  assert.deepEqual(caseRenterIdentity(session,{name:"Historical renter",email:null,phone:null}),person);
  assert.equal(person.email.endsWith("@example.com"),true);
  assert.equal(person.phone,"Not provided (Demo)");
  assert.equal(person.initials.length,2);
  assert.equal(person.name.includes(session),false);
  assert.notDeepEqual(demoPersona(other),person);
  const names=new Set(Array.from({length:1000},(_,i)=>demoPersona(`00000000-0000-4000-8000-${i.toString(16).padStart(12,"0")}`).name));
  assert.ok(names.size>900);
});
test("Shared seed retains historical identity and is not claimed by current persona",()=>{
  const historic={name:"Brad Lai",email:null,phone:null};
  assert.deepEqual(caseRenterIdentity(null,historic),historic);
  const c=make("seed",null);c.evidenceRequests=[pending(c,"legacy_photo")];
  assert.equal(homeCases([c],session).actions.length,0);
  assert.equal(canRespondToRequest(c,c.evidenceRequests[0],session),false);
});
test("Recent prefers owned cases, then authoritative recency and deterministic key order",()=>{
  const owned=make("owned",session,"completed","2026-10-10T00:00:00Z");
  const seed=make("seed",null,"completed");
  const foreign=make("private",other,"submitted","2026-10-15T00:00:00Z");
  assert.equal(homeCases([seed,foreign,owned],session).recent?.caseKey,"owned");
  assert.equal(homeCases([seed,foreign],session).recent?.caseKey,"seed");
  assert.equal(homeCases([foreign],session).recent,null);
  const newest=make("newest",session,"repair_scheduled","2026-10-15T00:00:00Z");
  assert.equal(homeCases([owned,newest],session).recent?.status,"repair_scheduled");
  assert.equal(homeCases([owned,newest],session).recent?.updatedAt,newest.updatedAt);
});
test("All four request types use owner/status eligibility and one action per case",()=>{
  for(const kind of ["overview_photo","closeup_photo","written_details","legacy_photo"]){
    const c=make(kind,session);c.evidenceRequests=[pending(c,kind)];
    assert.equal(homeCases([c],session).actions.length,1);
    assert.equal(canRespondToRequest(c,c.evidenceRequests[0],other),false);
    for(const status of ["submitted","resolved"] as const){
      c.evidenceRequests[0].status=status;
      assert.equal(homeCases([c],session).actions.length,0);
    }
  }
  const completed=make("done",session,"completed");completed.evidenceRequests=[pending(completed)];
  assert.equal(homeCases([completed],session).actions.length,0);
  const one=make("one",session),two=make("two",session,"under_review","2026-10-15T00:00:00Z");
  one.evidenceRequests=[pending(one),{...pending(one),id:"second"}];two.evidenceRequests=[pending(two)];
  const result=homeCases([one,two],session);
  assert.equal(result.actions.length,2);assert.equal(result.actions[0].case.caseKey,"two");
  assert.equal(result.recent?.caseKey,result.actions[0].case.caseKey);
  assert.equal(requestResponsePath("case / x","req ? y"),"/cases/case%20%2F%20x?request=req%20%3F%20y");
});
