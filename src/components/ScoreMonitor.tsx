import { useTranslation } from "react-i18next";
import "@/i18n/i18n";

interface ScoreMonitorProps {
  points: number;
  id: string;
  className?: string;
  highlight?: boolean;
}

export default function ScoreMonitor({ points, id, className = "", highlight = false }: ScoreMonitorProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`font-oswald flex items-center justify-center rounded-lg
        bg-gradient-to-tr from-primary-900 to-primary-500 transition-[border-color,box-shadow] duration-300
        ${highlight ? "border-primary-200 ring-4 ring-primary" : "border-black"}
        ${className}`}
      style={{ borderWidth: 8, aspectRatio: "16/9", containerType: "size" }}
    >
      <span
        className="font-bold text-white"
        id={id}
        style={{
          fontSize: "67cqh",
          WebkitTextStroke: "3px black",
          paintOrder: "stroke fill",
        }}
      >
        {t("number", { count: points })}
      </span>
    </div>
  );
}
