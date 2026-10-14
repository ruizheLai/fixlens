import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../src/components/capture/AnnotatedPhoto.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText
  .replaceAll('"react/jsx-runtime"', JSON.stringify(import.meta.resolve("react/jsx-runtime")))
  .replaceAll('"react"', JSON.stringify(import.meta.resolve("react")));
const { default: AnnotatedPhoto } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
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
