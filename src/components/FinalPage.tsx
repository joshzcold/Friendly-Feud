import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { FinalRound, Game } from "@/types/game";
import FitText from "@/components/FitText";

const TEXT_SHADOW = "2px 2px 0 black";

interface AnswersProps {
  round: FinalRound[];
  finalRoundNumber: number;
}

function Answers({ round, finalRoundNumber }: AnswersProps) {
  const { t } = useTranslation();
  return round.map((x, i) => (
    <div
      key={`final-round-answers-${i}`}
      className="flex h-20 flex-row gap-2"
      style={{
        minWidth: 0,
      }}
    >
      <div
        className="relative flex min-w-0 grow items-center overflow-hidden border-2  bg-black px-4 uppercase"
        style={{ minHeight: 80 }}
      >
        {x.revealed && (
          <div
            className="final-reveal w-full"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <FitText
              id={`finalRound${finalRoundNumber}Answer${i}Text`}
              text={x.input}
              fontSize={54}
              className="w-full font-bold text-white"
              style={{
                textShadow: TEXT_SHADOW,
              }}
            />
          </div>
        )}
      </div>
      <div
        className="flex w-24 shrink-0 items-center justify-center border-2  bg-black font-extrabold uppercase text-white"
        style={{ textShadow: TEXT_SHADOW }}
      >
        {x.revealed && x.selection >= 0 && (
          <p
            id={`finalRound${finalRoundNumber}Answer${i}PointsTotalText`}
            className="text-5xl leading-none"
            style={{ animationDelay: `${i * 60 + 80}ms` }}
          >
            {t("number", { count: x.points })}
          </p>
        )}
      </div>
    </div>
  ));
}

interface FinalPageProps {
  game: Game;
  timer: number;
}

export default function FinalPage({ game, timer }: FinalPageProps) {
  const { t } = useTranslation();
  const hasConfettiRef = useRef(false);
  const total = [...game.final_round, ...game.final_round_2].reduce((sum, round) => sum + round.points, 0);
  const showFirstRound = !game.hide_first_round;
  const showSecondRound = true;
  const showWin = total >= 200;
  const showConfetti = total > 200;

  const emptyFinalRound: FinalRound =
    {
      answers: [],
      question: "",
      input: "",
      selection: 0,
      points: 0,
      revealed: false
    }

  const emptyFinalRounds: FinalRound[] = Array.from(
    { length: game.final_round.length },
    () => emptyFinalRound
  );

  useEffect(() => {
    if (!showConfetti) {
      return;
    }

    if (hasConfettiRef.current) {
      return;
    }

    let cancelled = false;

    const runConfetti = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const { default: confetti } = await import("@hiseb/confetti");
      if (cancelled) {
        return;
      }

      confetti({});
      hasConfettiRef.current = true;
    };

    void runConfetti();

    return () => {
      cancelled = true;
    };
  }, [showConfetti]);

  return (
    <div className="font-oswald flex w-full flex-col items-center gap-5">
      <div className="relative w-full max-w-[1060px]">
        <svg
          className="absolute inset-x-0 top-4 h-24 w-full text-blue-900"
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,200 L140,200 Q200,200 240,160 L360,40 Q380,20 400,20 L600,20 Q620,20 640,40 L760,160 Q800,200 860,200 L1000,200 Z"
            fill="currentColor"
          />
        </svg>
        <div className="relative flex items-center top-2 justify-center pt-12 text-center">
          <p
            id="finalRoundTitle"
            className="text-4xl font-bold uppercase text-white"
          >
            {game.settings.final_round_title || t("Fast Money")}
          </p>
        </div>
      </div>

      <div className="relative w-full max-w-[1060px] overflow-hidden rounded-2xl bg-blue-900 px-5 pb-6 pt-8">
        <div className={`grid gap-4 lg:grid-cols-2`}>
          {showFirstRound? (
            <div className="grid min-w-0 gap-3 lg:grid-flow-row">
              <Answers finalRoundNumber={1} round={game.final_round} />
            </div>
          ) : (
            <div className="grid min-w-0 gap-3 lg:grid-flow-row">
              <Answers finalRoundNumber={1} round={emptyFinalRounds} />
            </div>
            )
          }

          <div className="grid min-w-0 gap-3 lg:grid-flow-row">
            <Answers finalRoundNumber={2} round={game.final_round_2} />
          </div>
        </div>
        <div className="w-full max-w-[1060px] items-center mt-6">
          <div className="justify-self-end rounded-lg border-2  bg-black px-5 py-2 text-white">
            <p id="finalRoundTotalPointsText" className="text-4xl font-bold uppercase" style={{ textShadow: TEXT_SHADOW }}>
              {t("total")} {t("number", { count: total })}
            </p>
          </div>
        </div>
      </div>

      {/* TIMER */}
      <div className="justify-self-center rounded-full border-4  bg-blue-900 bottom-16 relative px-8 py-4 text-white">
        <p id="finalRoundTimerLabel" className="text-5xl font-bold uppercase" style={{ textShadow: TEXT_SHADOW }}>
          <span id="finalRoundTimerValue">{t("number", { count: timer })}</span>
        </p>
      </div>

      {/* WIN TEXT */}
      <div className="text-center">
        {showWin ? (
          <p
            id="finalRoundWinText"
            className="text-7xl font-bold uppercase leading-none text-foreground"
          >
            {t("win")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
