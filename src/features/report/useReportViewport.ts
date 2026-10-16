import { useEffect, useRef } from "react";
/** Resize only the report conversation on a mobile visual-viewport keyboard resize.
 * Never reset zoom or assume a keyboard height. Capture screens are unaffected. */
export function useReportViewport() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      const element = ref.current;
      if (!element) return;
      if (window.innerWidth >= 768 || viewport.scale !== 1 || viewport.height >= window.innerHeight) {
        element.style.height = "100%";
        return;
      }
      const top = element.getBoundingClientRect().top;
      element.style.height = `${Math.max(0, viewport.offsetTop + viewport.height - top)}px`;
    };
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    update();
    return () => { viewport.removeEventListener("resize", update); viewport.removeEventListener("scroll", update); };
  }, []);
  return ref;
}
