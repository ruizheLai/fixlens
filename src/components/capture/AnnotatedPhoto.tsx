import { useRef, useState } from "react";
import type { AnnotationPoint, AnnotationTool, PhotoAnnotation, PhotoMetadata } from "../../types/evidence";
import { annotationColor } from "./annotationEditing";

export default function AnnotatedPhoto({ src, metadata, label, tool = null, text = "Note", color, selected, onSelect, onMove, onAdd }: {
  src: string; metadata: PhotoMetadata; label: string; tool?: AnnotationTool | null; text?: string;
  onAdd?: (annotation: PhotoAnnotation) => void;
  color?: string; selected?: number | null; onSelect?: (index: number | null) => void;
  onMove?: (index: number, point: AnnotationPoint) => void;
}) {
  const [draft, setDraft] = useState<PhotoAnnotation | null>(null);
  const gesture = useRef<PhotoAnnotation | null>(null);
  const move = useRef<{ index: number; start: AnnotationPoint; origin: AnnotationPoint; next: AnnotationPoint } | null>(null);
  const [moving, setMoving] = useState<{ index: number; point: AnnotationPoint } | null>(null);
  const width = metadata.width || 1000, height = metadata.height || 1000;
  const point = (e: React.PointerEvent<SVGSVGElement>): AnnotationPoint | null => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = Math.min(rect.width / width, rect.height / height);
    const x = (e.clientX - rect.left - (rect.width - width * scale) / 2) / (width * scale);
    const y = (e.clientY - rect.top - (rect.height - height * scale) / 2) / (height * scale);
    return x < 0 || y < 0 || x > 1 || y > 1 ? null : { x: Math.round(x * 10000) / 10000, y: Math.round(y * 10000) / 10000 };
  };
  const annotations = [...metadata.annotations, ...(draft ? [draft] : [])];
  const strokeWidth = Math.max(width, height) * 0.006;
  return <svg role="img" aria-label={label} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet"
    style={{ width: "100%", height: "100%", display: "block", touchAction: onAdd ? "none" : "auto" }}
    onPointerDown={e => {
      onSelect?.(null);
      if (!tool || !onAdd || metadata.annotations.length >= 50) return;
      const start = point(e); if (!start) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      gesture.current = { tool, points: [start, start], ...(color ? { color } : {}), ...(tool === "text" ? { text: text.trim().slice(0, 80) || "Note" } : {}) };
      setDraft(gesture.current);
    }}
    onPointerMove={e => {
      if (move.current) {
        const next = point(e); if (!next) return;
        const m = move.current;
        m.next = { x: Math.max(0.02,Math.min(0.92,m.origin.x+next.x-m.start.x)), y: Math.max(0.04,Math.min(0.96,m.origin.y+next.y-m.start.y)) };
        setMoving({index:m.index,point:m.next}); return;
      }
      const current = gesture.current, next = point(e); if (!current || !next) return;
      gesture.current = { ...current, points: current.tool === "draw" ? [...current.points.slice(0, 199), next] : [current.points[0], next] };
      setDraft(gesture.current);
    }}
    onPointerUp={() => {
      if (move.current) {
        const m = move.current;
        if (m.next.x !== m.origin.x || m.next.y !== m.origin.y) onMove?.(m.index,m.next);
        move.current=null;setMoving(null);return;
      }
      if (gesture.current) onAdd?.(gesture.current);
      gesture.current = null; setDraft(null);
    }} onPointerCancel={() => { gesture.current = null; move.current=null; setMoving(null); setDraft(null); }}>
    <image href={src} width={width} height={height} />
    {annotations.map((item, index) => {
      const start = item.points[0], end = item.points[item.points.length - 1];
      if (!start || !end) return null;
      const position = moving?.index === index ? moving.point : start;
      const x = position.x * width, y = position.y * height, x2 = end.x * width, y2 = end.y * height;
      const color = annotationColor(item.color);
      if (item.tool === "circle") return <ellipse key={index} cx={(x+x2)/2} cy={(y+y2)/2} rx={Math.max(Math.abs(x2-x)/2, width * 0.035)} ry={Math.max(Math.abs(y2-y)/2, height * 0.035)} fill="none" stroke={color} strokeWidth={strokeWidth} />;
      if (item.tool === "text") return <text key={index} x={x} y={y} fill={color} stroke={color === "#000000" ? "#fff" : "#000"} strokeWidth={selected === index ? strokeWidth / 2 : strokeWidth / 4} paintOrder="stroke" fontSize={Math.max(width, height) * 0.035} fontFamily="Inter,sans-serif"
        style={{ cursor: onSelect ? "move" : undefined }}
        onPointerDown={onSelect ? e => {
          e.stopPropagation();onSelect(index);
          const svg=e.currentTarget.ownerSVGElement!;
          const rect=svg.getBoundingClientRect(), scale=Math.min(rect.width/width,rect.height/height);
          const startPoint={x:(e.clientX-rect.left-(rect.width-width*scale)/2)/(width*scale),y:(e.clientY-rect.top-(rect.height-height*scale)/2)/(height*scale)};
          svg.setPointerCapture(e.pointerId);move.current={index,start:startPoint,origin:start,next:start};
        } : undefined}>{item.text}</text>;
      if (item.tool === "draw") return <polyline key={index} points={item.points.map(p => `${p.x*width},${p.y*height}`).join(" ")} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />;
      const angle = Math.atan2(y2-y, x2-x), length = strokeWidth * 5;
      return <g key={index} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round"><path d={`M${x},${y} L${x2},${y2} M${x2-length*Math.cos(angle-.5)},${y2-length*Math.sin(angle-.5)} L${x2},${y2} L${x2-length*Math.cos(angle+.5)},${y2-length*Math.sin(angle+.5)}`} /></g>;
    })}
  </svg>;
}
