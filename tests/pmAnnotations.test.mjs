import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../src/components/capture/AnnotatedPhoto.tsx", import.meta.url), "utf8");
const helperSource = readFileSync(new URL("../src/components/capture/annotationEditing.ts", import.meta.url), "utf8");
const helperCode = ts.transpileModule(helperSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const helperUrl = `data:text/javascript;base64,${Buffer.from(helperCode).toString("base64")}`;
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText
  .replaceAll('"react/jsx-runtime"', JSON.stringify(import.meta.resolve("react/jsx-runtime")))
  .replaceAll('"./annotationEditing"', JSON.stringify(helperUrl))
  .replaceAll('"react"', JSON.stringify(import.meta.resolve("react")));
const { default: AnnotatedPhoto } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
test("Optional per-annotation colours render while legacy Circle/Arrow retain amber", () => {
  const annotations = [
    {tool:"circle",points:[{x:.1,y:.1},{x:.2,y:.2}]},
    {tool:"arrow",points:[{x:.1,y:.1},{x:.3,y:.3}]},
    ...["#FFFFFF","#000000","#FACC15","#2563EB","#EF4444","#22C55E"].map(color=>({tool:"draw",color,points:[{x:.1,y:.1},{x:.4,y:.4}]})),
    {tool:"text",text:"Note",color:"#EF4444",points:[{x:.5,y:.5}]},
  ];
  const html=renderToStaticMarkup(React.createElement(AnnotatedPhoto,{src:"blob:test",metadata:{width:800,height:600,annotations},label:"Saved evidence"}));
  for(const color of ["#FFFFFF","#000000","#FACC15","#2563EB","#EF4444","#22C55E","#F59E0B"]) assert.ok(html.includes(`stroke="${color}"`)||html.includes(`fill="${color}"`));
  assert.ok(html.includes('<ellipse'));assert.ok(html.includes('M80,60 L240,180'));assert.ok(html.includes('x="400" y="300"'));
});
for (const [width, height] of [[600, 900], [1200, 600]]) {
  test(`Read-only PM evidence preserves all normalized annotations at ${width}×${height}`, () => {
    const metadata = { width, height, annotations: [
      { tool: "circle", points: [{ x: .2, y: .2 }, { x: .6, y: .6 }] },
      { tool: "arrow", points: [{ x: .1, y: .1 }, { x: .9, y: .8 }] },
      { tool: "text", points: [{ x: .3, y: .4 }], text: "Frame corner" },
      { tool: "draw", points: [{ x: .2, y: .3 }, { x: .4, y: .5 }] },
    ] };
    const before = JSON.stringify(metadata);
    const render = label => renderToStaticMarkup(React.createElement(AnnotatedPhoto, { src: "blob:test-photo", metadata, label }));
    const thumb = render("Overview photo"), full = render("Close-up photo");
    for (const html of [thumb, full]) {
      assert.ok(html.includes(`viewBox="0 0 ${width} ${height}"`));
      assert.ok(html.includes('preserveAspectRatio="xMidYMid meet"'));
      assert.ok(html.includes(`<image href="blob:test-photo" width="${width}" height="${height}"`));
      assert.ok(html.includes(`cx="${width * .4}" cy="${height * .4}"`));
      assert.ok(html.includes(`M${width * .1},${height * .1} L${width * .9},${height * .8}`));
      assert.ok(html.includes(`x="${width * .3}" y="${height * .4}"`));
      assert.ok(html.includes(`points="${width * .2},${height * .3} ${width * .4},${height * .5}"`));
    }
    assert.equal(JSON.stringify(metadata), before);
    assert.equal(thumb.replace('Overview photo', ''), full.replace('Close-up photo', ''));
  });
}

test("Editing hides only the active text; persisted multiline text renders in both shared viewers", () => {
  const annotations = [
    {
      tool: "text",
      text: "Lower frame\nLeak here",
      points: [{ x: 0.3, y: 0.4 }],
      color: "#FFFFFF",
    },
    {
      tool: "circle",
      points: [
        { x: 0.1, y: 0.1 },
        { x: 0.2, y: 0.2 },
      ],
    },
  ]
  const props = {
    src: "blob:fixture",
    metadata: { width: 600, height: 900, annotations },
    label: "Evidence",
  }
  const saved = renderToStaticMarkup(React.createElement(AnnotatedPhoto, props))
  assert.ok(saved.includes("Lower frame</tspan>"))
  assert.ok(saved.includes("Leak here</tspan>"))
  const editing = renderToStaticMarkup(
    React.createElement(AnnotatedPhoto, { ...props, hiddenIndex: 0 }),
  )
  assert.ok(!editing.includes("<text"))
  assert.ok(editing.includes("<ellipse"))
  assert.equal(annotations[0].text, "Lower frame\nLeak here")
})
