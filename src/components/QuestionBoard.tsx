import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { Round } from "@/types/game";
import FitText from "@/components/FitText";

interface QuestionBoardProps {
  round: Round;
}

const TEXT_SHADOW = "3px 3px 0 black";
// Thickness of the 3D card
const FLIP_DEPTH = 70;
// Virtual camera distance for the 3D effect
const PERSPECTIVE = 800;
// Counteract the size distortion that the perspective introduces
const DEPTH_SCALE = (PERSPECTIVE - FLIP_DEPTH / 2) / PERSPECTIVE;

function EmptySlot() {
  return (
    <div className="h-full border-4 border-white bg-gradient-to-t from-primary-700 to-primary-500" />
  );
}

function UnrevealedFace({ index }: { index: number }) {
  const { t } = useTranslation();
  return (
    <div
      className="flip-face absolute inset-0 flex items-center justify-center border-4 border-white bg-gradient-to-t from-primary-700 to-primary-500"
      style={{
        backfaceVisibility: "hidden",
        transform: `translateZ(${FLIP_DEPTH / 2}px)`,
      }}
    >
      <div
        className="flex aspect-square h-3/5 items-center justify-center rounded-full border-2 border-primary-900 bg-gradient-to-tr from-primary-900 to-primary-700"
        style={{ boxShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
      >
        <span
          id={`answer${index}UnAnswered`}
          className="text-[54px] font-bold text-white"
          style={{ textShadow: TEXT_SHADOW }}
        >
          {t("number", { count: index + 1 })}
        </span>
      </div>
    </div>
  );
}

function RevealedFace({ index, ans, pnt }: { index: number; ans: string; pnt: number }) {
  const { t } = useTranslation();
  return (
    <div
      className="flip-face absolute inset-0 flex border-4 border-white bg-gradient-to-t from-primary-900 via-primary-500 to-primary-700"
      style={{
        backfaceVisibility: "hidden",
        transform: `rotateX(-180deg) translateZ(${FLIP_DEPTH / 2}px)`,
      }}
    >
      <div className="flex h-full min-w-0 flex-1 items-center overflow-hidden pl-3 pr-1">
        <FitText
          text={ans}
          fontSize={72}
          className="w-full font-bold text-white"
          id={`answer${index}Answered`}
          style={{ textShadow: TEXT_SHADOW }}
        />
      </div>
      <div
        className="flex shrink-0 items-center justify-center border-l-2 border-primary-900 bg-gradient-to-t from-primary-700 to-primary-500"
        style={{ aspectRatio: "9 / 10", textShadow: TEXT_SHADOW }}
      >
        <span
          className="text-[64px] font-bold text-white"
          id={`answer${index}PointsText`}
        >
          {t("number", { count: pnt })}
        </span>
      </div>
    </div>
  );
}

function CardEdge() {
  return (
    <div
      className="absolute left-0 top-0 w-full border-y-4 border-white bg-primary-900"
      style={{
        height: FLIP_DEPTH,
        transformOrigin: "top center",
        transform: `translateZ(${FLIP_DEPTH / 2}px) rotateX(-90deg)`,
      }}
    />
  );
}

function FlipCard({ index, ans, pnt, trig }: { index: number; ans: string; pnt: number; trig: boolean }) {
  return (
    <div
      className="flip-card-inner relative h-full w-full"
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.33s ease-in-out",
        transform: `scale(${DEPTH_SCALE}) ${trig ? "rotateX(-180deg)" : "rotateX(0deg)"}`,
      }}
    >
      <UnrevealedFace index={index} />
      <RevealedFace index={index} ans={ans} pnt={pnt} />
      <CardEdge />
    </div>
  );
}

export default function QuestionBoard({ round }: QuestionBoardProps) {
  const slots = Array.from({ length: 8 }, (_, i) =>
    i < round.answers.length ? { ...round.answers[i], index: i } : null,
  );

  return (
    <div
      className="w-[1060px] aspect-[16/9] rounded-2xl bg-black p-[26px] grid grid-cols-2 grid-rows-4 grid-flow-col gap-x-3 gap-y-6 font-oswald"
    >
      {slots.map((slot, i) => (
        <div
          key={`qboard-slot-${i}`}
          className="uppercase"
          style={{ perspective: PERSPECTIVE }}
        >
          {slot === null ? (
            <EmptySlot />
          ) : (
            <FlipCard index={slot.index} ans={slot.ans} pnt={slot.pnt} trig={slot.trig} />
          )}
        </div>
      ))}
    </div>
  );
}
