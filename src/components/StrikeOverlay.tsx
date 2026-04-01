import Image from "next/image";

interface StrikeOverlayProps {
  count: number | null;
}

export default function StrikeOverlay({ count }: StrikeOverlayProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center gap-4 ${
        count ? "opacity-100" : "opacity-0"
      } transition-opacity duration-300 ease-in-out`}
      aria-hidden={!count}
    >
      {Array.from({ length: count ?? 0 }, (_, i) => (
        <Image
          key={i}
          width={200}
          height={220}
          src="/x.svg"
          alt="Strike"
          className="h-[50vh] w-auto"
        />
      ))}
    </div>
  );
}
