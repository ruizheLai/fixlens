import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

// Transpile the actual small presentation tree without adding a test dependency.
const cache = new Map();
function moduleUrl(url) {
  if (cache.has(url.href)) return cache.get(url.href);
  let source = ts.transpileModule(readFileSync(url,"utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  source = source.replace(/from\s+(["'])([^"']+)\1/g, (_, quote, specifier) => {
    if (!specifier.startsWith(".")) return `from ${JSON.stringify(import.meta.resolve(specifier))}`;
    let target = new URL(specifier,url);
    if (!existsSync(target)) target = new URL(specifier + (existsSync(new URL(specifier+".tsx",url)) ? ".tsx" : ".ts"),url);
    return `from ${JSON.stringify(moduleUrl(target))}`;
  });
  const result = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  cache.set(url.href,result);return result;
}
const { default: SafetyNotice } = await import(moduleUrl(new URL("../src/components/common/SafetyNotice.tsx",import.meta.url)));
const { default: SafetyReportReview } = await import(moduleUrl(new URL("../src/features/report/SafetyReportReview.tsx",import.meta.url)));
const { default: IssueComposer } = await import(moduleUrl(new URL("../src/features/report/IssueComposer.tsx",import.meta.url)));
test("Safety notice depends on the explicit renter answer, with no fake media",()=>{
  assert.equal(renderToStaticMarkup(React.createElement(SafetyNotice,{response:"No immediate danger reported"})),"");
  const html=renderToStaticMarkup(React.createElement(SafetyNotice,{response:"Immediate danger reported",noPhotos:true}));
  assert.match(html,/No photos collected for safety reasons/);assert.match(html,/not an emergency response service/);assert.doesNotMatch(html,/<img|<video/);
});
test("Safety review shows original wording and fields without ordinary evidence readiness",()=>{
  const report={issueType:"Leak",location:"Kitchen",condition:"Water on floor",description:"My original\nwords <unchanged>",safetyResponse:"Immediate danger reported"};
  const html=renderToStaticMarkup(React.createElement(SafetyReportReview,{report,submitting:true,error:"",onSubmit:()=>{}}));
  assert.match(html,/My original\nwords &lt;unchanged&gt;/);assert.match(html,/Kitchen/);assert.match(html,/Water on floor/);assert.match(html,/disabled/);
  assert.doesNotMatch(html,/Overview photo|Close-up photo|Ready for initial review|<img|<video/);
});
test("Composer renders editable multiline text at a non-zooming font size",()=>{
  const html=renderToStaticMarkup(React.createElement(IssueComposer,{value:"First line\nSecond line",onChange:()=>{},disabled:false,maxLength:3000,label:"Describe the issue",placeholder:"Describe…"}));
  assert.match(html,/<textarea/);assert.match(html,/font-size:16px/);assert.match(html,/First line\nSecond line/);assert.doesNotMatch(html,/disabled/);
});
