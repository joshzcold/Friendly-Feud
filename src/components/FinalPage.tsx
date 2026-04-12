import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { FinalRound, Game } from "@/types/game";
import FitText from "@/components/FitText";

const TEXT_SHADOW = "3px 3px 0 black";

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
        className="relative flex min-w-0 grow items-center overflow-hidden border-4 border-white bg-gradient-to-t from-primary-900 via-primary-500 to-primary-700 px-3 uppercase"
        style={{ minHeight: 80 }}
      >
        {x.revealed && (
          <FitText
            id={`finalRound${finalRoundNumber}Answer${i}Text`}
            text={x.input}
            fontSize={54}
            className="w-full font-bold text-white"
            style={{
              textShadow: TEXT_SHADOW,
            }}
          />
        )}
      </div>
      <div
        className="flex w-24 shrink-0 items-center justify-center border-4 border-white bg-gradient-to-t from-primary-700 to-primary-500 font-extrabold uppercase text-white"
        style={{ textShadow: TEXT_SHADOW }}
      >
        {x.revealed && x.selection >= 0 && (
          <p
            id={`finalRound${finalRoundNumber}Answer${i}PointsTotalText`}
            className="text-5xl leading-none"
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
  const total = [...game.final_round, ...game.final_round_2].reduce((sum, round) => sum + round.points, 0);
  const showFirstRound = !game.hide_first_round;
  const showSecondRound = game.is_final_second;

  return (
    <div className="font-oswald flex w-full flex-col items-center gap-5">
      <div className="my-10 text-center">
        <p
          id="finalRoundTitle"
          className="text-3xl font-bold uppercase text-foreground"
        >
          {game.settings.final_round_title || t("Fast Money")}
        </p>
      </div>

      <div className="w-full max-w-[1060px] rounded-2xl border-8 border-white bg-black p-4">
        <div className={`grid gap-3 ${showFirstRound && showSecondRound ? "lg:grid-cols-2" : ""}`}>
          {showFirstRound && (
            <div className="grid min-w-0 gap-3 lg:grid-flow-row">
              <Answers finalRoundNumber={1} round={game.final_round} />
            </div>
          )}

          {showSecondRound && (
            <div className="grid min-w-0 gap-3 lg:grid-flow-row">
              <Answers finalRoundNumber={2} round={game.final_round_2} />
            </div>
          )}
        </div>
      </div>

      <div className="relative my-3 h-16 w-full max-w-[1060px]">
        {/* Timer */}
        <div className="absolute left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2 rounded-lg border-4 border-white bg-gradient-to-tr from-primary-900 to-primary-500 px-4 py-2 text-white">
          <p id="finalRoundTimerLabel" className="text-4xl font-bold uppercase" style={{ textShadow: TEXT_SHADOW }}>
            {t("timer")} <span id="finalRoundTimerValue">{t("number", { count: timer })}</span>
          </p>
        </div>

        {/* Total */}
        <div className="absolute right-0 top-1/2 w-fit -translate-y-1/2 rounded-lg border-4 border-white bg-gradient-to-tr from-primary-900 to-primary-500 px-4 py-2 text-white">
          <p id="finalRoundTotalPointsText" className="text-4xl font-bold uppercase" style={{ textShadow: TEXT_SHADOW }}>
            {t("total")} {t("number", { count: total })}
          </p>
        </div>
      </div>

      {/* WIN TEXT */}
      <div className="text-center">
        {total >= 200 ? (
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
