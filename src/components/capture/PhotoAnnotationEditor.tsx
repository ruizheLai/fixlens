import { useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import type {
  AnnotationPoint,
  LocalPhoto,
  PhotoAnnotation,
  PhotoType,
} from "../../types/evidence"
import AnnotatedPhoto from "./AnnotatedPhoto"
import {
  ANNOTATION_COLORS,
  annotationColor,
  annotationTextLayout,
  annotationHistory,
  editAnnotations,
  undoAnnotations,
  redoAnnotations,
  type AnnotationHistory,
} from "./annotationEditing"
import "./annotationEditor.css"

type TextEdit = {
  index: number | null
  text: string
  color: string
  point: AnnotationPoint
}
function Icon({ kind }: { kind: "text" | "draw" | "trash" | "undo" | "redo" }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: kind === "redo" ? "scaleX(-1)" : undefined }}
    >
      {kind === "text" ? (
        <path d="M4 5h16M12 5v15M8 20h8" />
      ) : kind === "draw" ? (
        <path d="m4 20 4-1L20 7a2 2 0 0 0-3-3L5 16l-1 4ZM14 7l3 3" />
      ) : kind === "trash" ? (
        <path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7" />
      ) : (
        <path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 6 6v3" />
      )}
    </svg>
  )
}
export default function PhotoAnnotationEditor({
  photoType,
  photo,
  onRetake,
  onUse,
  onCancel,
  onAnnotations,
  title,
}: {
  photoType: PhotoType
  photo?: LocalPhoto
  onRetake: () => void
  onUse: () => void
  onCancel?: () => void
  onAnnotations?: (items: PhotoAnnotation[]) => void
  title?: string
}) {
  const [history, setHistory] = useState(() =>
    annotationHistory(photo?.annotations ?? []),
  )
  const current = useRef(history),
    root = useRef<HTMLDivElement>(null),
    header = useRef<HTMLElement>(null),
    footer = useRef<HTMLElement>(null),
    input = useRef<HTMLTextAreaElement>(null)
  const [tool, setTool] = useState<"draw" | null>(null),
    [color, setColor] = useState("#FACC15")
  const [editing, setEditing] = useState<TextEdit | null>(null),
    [error, setError] = useState("")
  const [bars, setBars] = useState({ top: 60, bottom: 60 })
  const [size, setSize] = useState({ width: 0, height: 0 }),
    [tip, setTip] = useState("Add notes with text or drawing.")
  const seen = useRef(new Set(["initial"]))
  const showTip = (id: string, message: string) => {
    if (!seen.current.has(id)) {
      seen.current.add(id)
      setTip(message)
    }
  }
  useEffect(() => {
    if (!tip) return
    const timer = window.setTimeout(() => setTip(""), 4000)
    return () => window.clearTimeout(timer)
  }, [tip])
  useEffect(() => {
    const element = root.current
    if (!element) return
    const measure = () =>
      setSize({ width: element.clientWidth, height: element.clientHeight })
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    const viewport = window.visualViewport
    const resize = () => {
      if (viewport && viewport.scale === 1 && viewport.height < window.innerHeight) {
        const parent = element.parentElement!.getBoundingClientRect();
        const visibleTop = Math.max(parent.top, viewport.offsetTop);
        const visibleBottom = Math.min(parent.bottom, viewport.offsetTop + viewport.height);
        element.style.top = Math.max(0, visibleTop - parent.top) + "px";
        element.style.height = Math.max(0, visibleBottom - visibleTop) + "px";
      } else {
        element.style.top = "0px";
        element.style.height = "100%";
      }
      measure()
    }
    viewport?.addEventListener("resize", resize)
    viewport?.addEventListener("scroll", resize)
    resize()
    return () => {
      observer.disconnect()
      viewport?.removeEventListener("resize", resize)
      viewport?.removeEventListener("scroll", resize)
    }
  }, [])
  useEffect(() => {
    const measure = () =>
      setBars({
        top: header.current?.offsetHeight ?? 60,
        bottom: footer.current?.offsetHeight ?? 60,
      })
    const observer = new ResizeObserver(measure)
    if (header.current) observer.observe(header.current)
    if (footer.current) observer.observe(footer.current)
    measure()
    return () => observer.disconnect()
  }, [!!editing])
  const publish = (next: AnnotationHistory) => {
    current.current = next
    setHistory(next)
    onAnnotations?.(next.present)
  }
  const commit = (next: PhotoAnnotation[]) => {
    if (JSON.stringify(next) === JSON.stringify(current.current.present))
      return true
    if (
      next.length > 50 ||
      new TextEncoder().encode(JSON.stringify(next)).length > 48000
    ) {
      setError(
        "This photo has enough marks. Undo or delete a mark before adding more.",
      )
      return false
    }
    setError("")
    publish(editAnnotations(current.current, next))
    return true
  }
  const beginText = (index: number | null) => {
    const item = index === null ? null : current.current.present[index]
    // Mount and focus within the initiating gesture, rather than an asynchronous effect (Safari).
    flushSync(() => {
      setTool(null)
      setTip("")
      setEditing({
        index,
        text: item?.text ?? "",
        color: item ? annotationColor(item.color) : color,
        point: item?.points[0] ?? { x: 0.3, y: 0.5 },
      })
    })
    input.current?.focus({ preventScroll: true })
  }
  const finishText = () => {
    if (!editing || !editing.text.trim()) return
    const annotation: PhotoAnnotation = {
      tool: "text",
      text: editing.text.trim(),
      color: editing.color,
      points: [editing.point],
    }
    const next =
      editing.index === null
        ? [...current.current.present, annotation]
        : current.current.present.map((a, i) =>
            i === editing.index ? { ...a, text: annotation.text, ...(editing.color !== annotationColor(a.color) ? {color: editing.color} : {}) } : a,
          )
    if (commit(next)) {
      if (ANNOTATION_COLORS.some(c => c.value === editing.color)) setColor(editing.color)
      setEditing(null)
      showTip("move", "Drag text to move it. Tap to edit.")
    }
  }
  if (!photo)
    return (
      <div className="absolute inset-0 bg-black text-white p-5">
        <p>No photo available.</p>
        <button onClick={onRetake}>Retake</button>
      </div>
    )
  // Keyboard layout changes only the display transform; normalized points never change.
  const canvasHeight = editing
    ? Math.max(1, size.height - bars.top - bars.bottom)
    : size.height
  const scale =
    Math.min(size.width / photo.width, canvasHeight / photo.height) || 1
  const imageWidth = photo.width * scale,
    imageHeight = photo.height * scale
  const left = (size.width - imageWidth) / 2,
    top = (canvasHeight - imageHeight) / 2 + (editing ? bars.top : 0)
  const layout = editing
    ? annotationTextLayout(
        editing.text,
        photo.width,
        photo.height,
        editing.point.x,
        editing.point.y,
      )
    : null
  const font =
    (layout?.fontSize ?? Math.max(photo.width, photo.height) * 0.035) * scale
  const palette = (
    <div className="annotation-palette" aria-label="Annotation colours">
      {ANNOTATION_COLORS.map((c) => (
        <button
          key={c.value}
          aria-label={`${c.name} annotation colour`}
          aria-pressed={(editing?.color ?? color) === c.value}
          onPointerDown={(e) => {
            if (editing) e.preventDefault()
          }}
          onClick={() =>
            editing
              ? setEditing({ ...editing, color: c.value })
              : setColor(c.value)
          }
        >
          <span style={{ background: c.value }} />
        </button>
      ))}
    </div>
  )
  return (
    <div ref={root} className="annotation-editor">
      <div
        className="annotation-canvas"
        style={{
          top: editing ? bars.top : 0,
          bottom: editing ? bars.bottom : 0,
        }}
      >
        <AnnotatedPhoto
          src={photo.previewUrl}
          metadata={{ ...photo, annotations: history.present }}
          label={`${photoType} photo annotation canvas`}
          tool={editing ? null : tool}
          color={color}
          hiddenIndex={editing?.index ?? undefined}
          onTextTap={editing ? undefined : beginText}
          onSelect={editing ? undefined : () => {}}
          onMove={(index, point) =>
            commit(
              current.current.present.map((a, i) =>
                i === index ? { ...a, points: [point] } : a,
              ),
            )
          }
          onAdd={
            editing ? undefined : (a) => commit([...current.current.present, a])
          }
        />
      </div>
      {editing && (
        <textarea
          ref={input}
          aria-label="Annotation text"
          maxLength={80}
          rows={Math.max(2, layout?.lines.length ?? 2)}
          value={editing.text}
          placeholder="Add text"
          onChange={(e) => setEditing({ ...editing, text: e.target.value })}
          className="annotation-input"
          style={{
            left: left + editing.point.x * imageWidth,
            top:
              top + editing.point.y * imageHeight - Math.max(16, font) * 0.85,
            width: Math.max(1, imageWidth * (1 - editing.point.x)),
            maxHeight: Math.max(24, imageHeight * (1 - editing.point.y)),
            fontSize: Math.max(16, font),
            color: editing.color,
            textShadow: editing.color === "#000000" ? "0 0 2px white, 0 1px 2px white" : undefined,
          }}
        />
      )}
      <header ref={header} className="annotation-header">
        {editing ? (
          <>
            <button
              onClick={() => {
                setEditing(null)
                setError("")
              }}
            >
              Cancel
            </button>
            <div className="annotation-delete">
              {editing.index !== null && (
                <button
                  aria-label="Delete text"
                  onClick={() => {
                    if (
                      commit(
                        current.current.present.filter(
                          (_, i) => i !== editing.index,
                        ),
                      )
                    )
                      setEditing(null)
                  }}
                >
                  <Icon kind="trash" />
                </button>
              )}
            </div>
            <button disabled={!editing.text.trim()} onClick={finishText}>
              Done
            </button>
          </>
        ) : (
          <>
            <button onClick={onRetake}>Retake</button>
            <p>
              {title ??
                (photoType === "overview"
                  ? "Overview — 1 of 2"
                  : "Close-up — 2 of 2")}
            </p>
            <div className="annotation-history">
              <button
                aria-label="Undo annotation"
                disabled={!history.past.length}
                onClick={() => publish(undoAnnotations(current.current))}
              >
                <Icon kind="undo" />
              </button>
              <button
                aria-label="Redo annotation"
                disabled={!history.future.length}
                onClick={() => publish(redoAnnotations(current.current))}
              >
                <Icon kind="redo" />
              </button>
            </div>
          </>
        )}
      </header>
      {tip && !editing && (
        <div className="annotation-tip">
          <span>{tip}</span>
          <button
            aria-label="Dismiss annotation tip"
            onClick={() => setTip("")}
          >
            ×
          </button>
        </div>
      )}
      <footer ref={footer} className="annotation-footer">
        {error && <p role="alert">{error}</p>}
        {(editing || tool === "draw") && palette}
        {editing ? null : (
          <div className="annotation-actions">
            <button aria-label="Add text" onClick={() => beginText(null)}>
              <Icon kind="text" />
            </button>
            <button
              aria-label="Draw on photo"
              aria-pressed={tool === "draw"}
              onClick={() => {
                setTool(tool ? null : "draw")
                if (!tool) showTip("draw", "Draw directly on the photo.")
              }}
            >
              <Icon kind="draw" />
            </button>
            {onCancel && <button onClick={onCancel}>Cancel</button>}
            <button className="annotation-use" onClick={onUse}>
              Use photo
            </button>
          </div>
        )}
      </footer>
    </div>
  )
}
