import { useEffect, useRef, type ReactNode } from "react";

interface ScaleToFitProps {
  children: ReactNode;
  className?: string;
  /** Scale to fit within both axes. When false, scale to fit width only. */
  contain?: boolean;
}

/**
 * Wraps arbitrary content and uniformly scales it down so it fits within
 * the parent's width (default) or both width and height (`contain`).
 */
export default function ScaleToFit({ children, className = "", contain = false }: ScaleToFitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const update = () => {
      // Reset transform so measurements reflect natural content size.
      content.style.transform = "scale(1)";
      content.style.transformOrigin = "center center";

      const naturalW = content.scrollWidth;
      if (naturalW === 0) return;
      let scale = container.clientWidth / naturalW;

      if (contain) {
        const naturalH = content.scrollHeight;
        if (naturalH === 0) return;
        scale = Math.min(scale, container.clientHeight / naturalH);
      }

      content.style.transform = `scale(${scale})`;
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, [contain, children]);

  return (
    <div ref={containerRef} className={className}>
      <div
        ref={contentRef}
        style={{ width: "max-content" }}
      >
        {children}
      </div>
    </div>
  );
}
