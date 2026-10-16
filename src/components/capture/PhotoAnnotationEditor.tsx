import { useEffect, useRef, useState } from "react";
import type { LocalPhoto, PhotoAnnotation, PhotoType } from "../../types/evidence";
import AnnotatedPhoto from "./AnnotatedPhoto";
import { ANNOTATION_COLORS, annotationHistory, editAnnotations, undoAnnotations, redoAnnotations, type AnnotationHistory } from "./annotationEditing";

function TextDialog({ initial, onSave, onCancel }: { initial: string; onSave:(text:string)=>void; onCancel:()=>void }) {
  const [text,setText]=useState(initial), ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{ref.current?.showModal();return()=>ref.current?.close()},[]);
  return <dialog ref={ref} aria-label="Edit annotation text" onCancel={e=>{e.preventDefault();onCancel()}} style={{margin:"auto",width:"min(340px, calc(100% - 32px))",maxHeight:"80dvh",padding:20,borderRadius:16,background:"#fff",color:"#171717"}}>
    <form onSubmit={e=>{e.preventDefault();if(text.trim())onSave(text.trim())}} className="flex flex-col gap-3">
      <label>Annotation text<textarea autoFocus aria-label="Annotation text" maxLength={80} value={text} onChange={e=>setText(e.target.value)} className="w-full rounded-lg border p-3" style={{fontSize:16}}/></label>
      <div className="flex gap-3"><button type="button" onClick={onCancel} className="min-h-11 flex-1">Cancel</button><button disabled={!text.trim()} className="min-h-11 flex-1 rounded-xl disabled:opacity-40" style={{background:"var(--color-blue)",color:"white"}}>Save text</button></div>
    </form>
  </dialog>;
}
function HistoryIcon({ redo=false }: {redo?:boolean}) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform:redo?"scaleX(-1)":undefined}}><path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 6 6v3"/></svg> }
export default function PhotoAnnotationEditor({ photoType, photo, onRetake, onUse, onCancel, onAnnotations, title }: {photoType:PhotoType;photo?:LocalPhoto;onRetake:()=>void;onUse:()=>void;onCancel?:()=>void;onAnnotations?:(items:PhotoAnnotation[])=>void;title?:string}) {
  const [history,setHistory]=useState(()=>annotationHistory(photo?.annotations??[]));
  const current=useRef(history);
  const [tool,setTool]=useState<"draw"|null>(null),[color,setColor]=useState<string>("#FACC15");
  const [selected,setSelected]=useState<number|null>(null),[editing,setEditing]=useState<{index:number|null;text:string}|null>(null),[error,setError]=useState("");
  const publish=(next:AnnotationHistory)=>{current.current=next;setHistory(next);onAnnotations?.(next.present)};
  const commit=(next:PhotoAnnotation[])=>{
    if(JSON.stringify(next)===JSON.stringify(current.current.present))return;
    if(next.length>50||new TextEncoder().encode(JSON.stringify(next)).length>48000){setError("This photo has enough marks. Undo or delete a mark before adding more.");return}
    setError("");publish(editAnnotations(current.current,next));
  };
  const select=(index:number|null)=>{setSelected(index);if(index!==null){setTool(null);const c=current.current.present[index]?.color;if(c) setColor(c)}};
  const updateColor=(value:string)=>{setColor(value);if(selected!==null)commit(current.current.present.map((a,i)=>i===selected?{...a,color:value}:a))};
  if(!photo)return <div className="absolute inset-0 bg-black text-white p-5"><p>No photo available.</p><button onClick={onRetake}>Retake</button></div>;
  const button="min-h-11 min-w-11 rounded-xl px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-30";
  return <div className="absolute inset-0 flex flex-col bg-black text-white min-h-0">
    <header className="shrink-0 flex items-center justify-between gap-1 px-3 py-3">
      <button className={button} onClick={onRetake}>Retake</button><p style={{fontSize:14,fontWeight:600}}>{title??(photoType==="overview"?"Overview — 1 of 2":"Close-up — 2 of 2")}</p>
      <button className={button} aria-label="Undo annotation" disabled={!history.past.length} onClick={()=>{publish(undoAnnotations(current.current));setSelected(null)}}><HistoryIcon/></button>
      <button className={button} aria-label="Redo annotation" disabled={!history.future.length} onClick={()=>{publish(redoAnnotations(current.current));setSelected(null)}}><HistoryIcon redo/></button>
    </header>
    <div className="flex-1 min-h-0">
      <AnnotatedPhoto src={photo.previewUrl} metadata={{...photo,annotations:history.present}} label={`${photoType} photo annotation canvas`} tool={tool} color={color} selected={selected} onSelect={select}
        onMove={(index,point)=>commit(current.current.present.map((a,i)=>i===index?{...a,points:[point]}:a))} onAdd={a=>commit([...current.current.present,a])}/>
    </div>
    <div className="shrink-0 px-3 py-2" style={{background:"#171717",paddingBottom:"max(12px, env(safe-area-inset-bottom))"}}>
      <p style={{fontSize:12,marginBottom:4}}>{selected!==null?"Drag selected text to move it.":"Add text or draw. Tap text to select it."}</p>
      <div className="flex items-center gap-2 min-h-11">{selected!==null?<><button className={button} onClick={()=>setEditing({index:selected,text:history.present[selected].text??""})}>Edit text</button><button className={button} onClick={()=>{commit(current.current.present.filter((_,i)=>i!==selected));setSelected(null)}}>Delete text</button></>:<span style={{fontSize:12,color:'#aaa'}}>Select text to edit, move or delete.</span>}</div>
      <div className="flex items-center justify-between gap-1">{ANNOTATION_COLORS.map(c=><button key={c.value} aria-label={`${c.name} annotation colour`} aria-pressed={color===c.value} className={button+" flex items-center justify-center"} onClick={()=>updateColor(c.value)}><span style={{width:24,height:24,borderRadius:"50%",background:c.value,border:"1px solid #777",outline:color===c.value?"2px solid white":undefined,outlineOffset:3}}/></button>)}</div>
      {error&&<p role="alert" style={{fontSize:12}}>{error}</p>}
      <div className="flex items-center gap-2"><button className={button} onClick={()=>{setTool(null);setSelected(null);setEditing({index:null,text:""})}}>Text</button><button aria-pressed={tool==="draw"} className={button} style={{background:tool==="draw"?"#444":undefined}} onClick={()=>{setSelected(null);setTool(tool==="draw"?null:"draw")}}>Draw</button>{onCancel&&<button className={button} onClick={onCancel}>Cancel</button>}<button className={button+" ml-auto"} style={{background:"var(--color-blue)"}} onClick={onUse}>Use photo</button></div>
    </div>
    {editing&&<TextDialog initial={editing.text} onCancel={()=>setEditing(null)} onSave={text=>{
      if(editing.index===null){commit([...current.current.present,{tool:"text",text,color,points:[{x:.5,y:.5}]}]);setSelected(null)}
      else commit(current.current.present.map((a,i)=>i===editing.index?{...a,text}:a));setEditing(null);
    }}/>}
  </div>;
}
