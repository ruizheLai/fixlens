import { useEffect, useRef, useState } from "react";
import type { MaintenanceReportInput } from "../../types/report";
import type { LocalPhoto, PhotoType } from "../../types/evidence";
import Btn from "../../components/common/Btn";
import LogoAvatar from "../../components/brand/LogoAvatar";
import AssistantBubble from "../../components/chat/AssistantBubble";
import AnnotatedPhoto from "../../components/capture/AnnotatedPhoto";
import { approvedDetails } from "./reportDraft";
import { useReportViewport } from "./useReportViewport";

function DetailsEditor({report,onSave,onCancel}:{report:MaintenanceReportInput;onSave:(report:MaintenanceReportInput)=>void;onCancel:()=>void}) {
  const [draft,setDraft]=useState(report),[error,setError]=useState("");const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{ref.current?.showModal();return()=>ref.current?.close()},[]);
  return <dialog ref={ref} aria-label="Edit details" onCancel={e=>{e.preventDefault();onCancel()}} style={{margin:"auto",width:"min(380px, calc(100% - 24px))",maxHeight:"85dvh",overflowY:"auto",padding:20,borderRadius:16,background:"var(--color-surface)"}}>
    <form className="flex flex-col gap-3" onSubmit={e=>{e.preventDefault();try{onSave(approvedDetails(report,draft))}catch(e){setError((e as Error).message)}}}>
      <h2 className="font-semibold">Edit details</h2>
      <p className="text-xs">If you change the issue, location or original description, unchanged observed details will be cleared to avoid retaining an outdated summary. Update that field if you want to keep it.</p>
      {([['issueType','Issue type',200],['location','Location',200],['condition','Observed details / summary',3000],['description','Original issue description',6000]] as const).map(([key,label,maxLength])=><label key={key} className="text-sm">{label}<textarea autoFocus={key==='issueType'} aria-label={label} maxLength={maxLength} required={key==='issueType'||key==='description'} value={draft[key]??''} onChange={e=>setDraft({...draft,[key]:e.target.value})} rows={key==='description'?4:2} className="w-full border rounded-lg p-2" style={{fontSize:16,resize:'vertical'}}/></label>)}
      {error&&<p role="alert">{error}</p>}
      <div className="flex gap-2"><button type="button" onClick={onCancel} className="w-full min-h-11 rounded-2xl border font-semibold">Cancel</button><button className="w-full min-h-11 rounded-2xl text-white font-semibold" style={{background:'var(--color-blue)'}}>Save details</button></div>
    </form>
  </dialog>;
}
export default function FinalReportReview({report,photos,submitting,error,uploading,locked,onSubmit,onReplace,onEdit}:{report:MaintenanceReportInput;photos:Partial<Record<PhotoType,LocalPhoto>>;submitting:boolean;error:string;uploading:boolean;locked:boolean;onSubmit:()=>void;onReplace:(role:PhotoType)=>void;onEdit:(value:MaintenanceReportInput)=>void}) {
  const [editing,setEditing]=useState(false),[view,setView]=useState<PhotoType|null>(null);const ref=useReportViewport();
  return <div ref={ref} className="flex flex-col h-full min-h-0">
    <div className="shrink-0 flex items-center gap-3 px-5 py-4" style={{borderBottom:'1px solid var(--color-border)',background:'var(--color-surface)'}}><div className="flex-1"><p style={{fontFamily:'var(--font-display)',fontWeight:600,fontSize:17}}>Report an Issue</p><p style={{fontSize:12,color:'var(--color-muted)'}}>FixLens Assistant · Final Review</p></div><LogoAvatar size={32}/></div>
    <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col gap-4">
      <AssistantBubble>Your two photos are ready. Check your details and evidence before submitting.</AssistantBubble>
      <div className="ml-9 shrink-0 rounded-2xl overflow-hidden" style={{background:'var(--color-surface)',border:'1px solid var(--color-border)'}}>
        {[["Issue type",report.issueType],["Location",report.location],["Observed details / summary",report.condition],["Original issue description",report.description],["Safety",report.safetyResponse]].map(([label,value])=><div key={label} className="px-4 py-3" style={{borderBottom:'1px solid var(--color-border)',overflowWrap:'anywhere'}}><p style={{fontSize:10,color:'var(--color-muted)',textTransform:'uppercase'}}>{label}</p><p style={{fontSize:13,whiteSpace:'pre-wrap',lineHeight:1.5}}>{value||'Not provided'}</p></div>)}
        <div className="px-4 py-2"><Btn disabled={locked} variant="secondary" onClick={()=>setEditing(true)}>Edit details</Btn></div>
        {(['overview','closeup'] as const).map(role=>{const photo=photos[role],label=role==='overview'?'Overview photo':'Close-up photo';return <div key={role} className="px-4 py-3" style={{borderTop:'1px solid var(--color-border)'}}>
          <div className="flex items-center gap-3"><button aria-label={`View ${label}`} disabled={!photo} className="shrink-0 rounded-xl overflow-hidden" style={{width:60,height:48,background:'#111'}} onClick={()=>setView(role)}>{photo&&<AnnotatedPhoto src={photo.previewUrl} metadata={photo} label={label}/>}</button><p className="text-sm font-semibold">{label}</p></div>
          <button disabled={locked} aria-label={`Replace ${label}`} className="min-h-11 text-sm font-semibold disabled:opacity-40" style={{color:'var(--color-blue)'}} onClick={()=>onReplace(role)}>Replace photo</button>
        </div>})}
        <p className="px-4 py-3 text-sm font-semibold" style={{color:'var(--color-success)'}}>Ready for initial review</p>
      </div>
      {error&&<p role="alert" className="ml-9 text-sm">{error}</p>}
      <div className="ml-9 shrink-0"><Btn disabled={submitting||!photos.overview||!photos.closeup} onClick={onSubmit}>{submitting?uploading?'Uploading photos…':'Submitting…':error?'Retry':'Submit report'}</Btn></div>
    </div>
    {editing&&<DetailsEditor report={report} onCancel={()=>setEditing(false)} onSave={value=>{onEdit(value);setEditing(false)}}/>}
    {view&&photos[view]&&<PhotoViewer photo={photos[view]} onClose={()=>setView(null)}/>}
  </div>;
}
function PhotoViewer({photo,onClose}:{photo:LocalPhoto;onClose:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{ref.current?.showModal();return()=>ref.current?.close()},[]);
  return <dialog ref={ref} aria-label="Photo preview" onCancel={e=>{e.preventDefault();onClose()}} style={{margin:'auto',width:'min(600px, 95vw)',height:'80dvh',padding:12,background:'#111',color:'white',borderRadius:16}}><div className="h-full flex flex-col"><button className="min-h-11 self-end" onClick={onClose}>Close photo</button><div className="flex-1 min-h-0"><AnnotatedPhoto src={photo.previewUrl} metadata={photo} label={`${photo.role} photo full preview`}/></div></div></dialog>;
}
