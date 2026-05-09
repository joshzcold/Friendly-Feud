import { useEffect, useRef, type CSSProperties } from "react";

// Controls how aggressively vertical height shrinks when text is compressed horizontally.
// 0 = no vertical change; 1 = uniform scale.
// A balance keeps long answers readable without looking too small.
const VERTICAL_SHRINK_EXPONENT = 0.5;

interface FitTextProps {
  text: string;
  fontSize: number;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

/**
 * Renders text at a target font size, applying compression when the text overflows
 * the container width. Fits horizontally while scaling vertically less aggressively
 * so it doesn't look too small.
 */
export default function FitText({ text, fontSize, className = "", id, style }: FitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const fit = () => {
      const cw = container.clientWidth;
      if (cw === 0) return;

      textEl.style.transform = "none";

      const tw = textEl.scrollWidth;
      if (tw <= cw) return;

      const ratio = cw / tw;
      const scaleY = Math.pow(ratio, VERTICAL_SHRINK_EXPONENT);
      textEl.style.transform = `scale(${ratio}, ${scaleY})`;
    };

    document.fonts.ready.then(fit);

    const ro = new ResizeObserver(fit);
    ro.observe(container);
    return () => ro.disconnect();
  }, [text, fontSize]);

  return (
    <div ref={containerRef} className={`flex items-center justify-center ${className}`}>
      <h3 ref={textRef} id={id} className="whitespace-nowrap leading-none" style={{ fontSize, ...style }}>
        {text}
      </h3>
    </div>
  );
}
