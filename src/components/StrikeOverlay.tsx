import Image from "next/image";
import { useRef } from "react";

interface StrikeOverlayProps {
  count: number | null;
}

export default function StrikeOverlay({ count }: StrikeOverlayProps) {
  const visible = !!count;

  const displayCount = useRef(0);
  if (visible) displayCount.current = count;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center gap-[1vw] ${
        visible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-300 ease-in-out`}
      aria-hidden={!visible}
    >
      {Array.from({ length: displayCount.current }, (_, i) => (
        <Image
          key={i}
          width={1000}
          height={1000}
          src="/x.svg"
          alt="Strike"
          className="h-[50vh] max-w-[30vw] w-auto"
        />
      ))}
    </div>
  );
}
