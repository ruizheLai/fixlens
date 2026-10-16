import {test} from "node:test";import assert from "node:assert/strict";
import {ANNOTATION_COLORS,annotationColor,annotationHistory,editAnnotations,undoAnnotations,redoAnnotations} from "../src/components/capture/annotationEditing.ts";
test("Six colours, safe optional legacy colour",()=>{
 assert.deepEqual(ANNOTATION_COLORS.map(c=>c.value),['#FFFFFF','#000000','#FACC15','#2563EB','#EF4444','#22C55E']);
 assert.equal(annotationColor(),"#F59E0B");assert.equal(annotationColor("url(bad)"),"#F59E0B");
});
test("All text edits, colour, movement, deletion and draw undo atomically without losing historical marks",()=>{
 const historical={tool:'circle' as const,points:[{x:.1,y:.1},{x:.2,y:.2}]};
 let h=annotationHistory([historical]);const states=[h.present];
 const text={tool:'text' as const,text:'Leak',color:'#FFFFFF',points:[{x:.5,y:.5}]};
 for(const next of [[historical,text],[historical,{...text,text:'Tap leak'}],[historical,{...text,color:'#2563EB'}],[historical,{...text,points:[{x:.7,y:.4}]}],[historical],[historical,{tool:'draw' as const,color:'#22C55E',points:[{x:.2,y:.3},{x:.4,y:.5}]}]]) {h=editAnnotations(h,next);states.push(next)}
 for(let i=states.length-2;i>=0;i--){h=undoAnnotations(h);assert.deepEqual(h.present,states[i]);assert.deepEqual(h.present[0],historical)}
 for(let i=1;i<states.length;i++){h=redoAnnotations(h);assert.deepEqual(h.present,states[i])}
 h=undoAnnotations(h);h=editAnnotations(h,[historical,text]);assert.equal(h.future.length,0);assert.deepEqual(redoAnnotations(h),h);
});
