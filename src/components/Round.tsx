import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { Game } from "@/types/game";
import ScoreMonitor from "@/components/ScoreMonitor";

interface RoundProps {
  game: Game;
}

export default function Round({ game }: RoundProps) {
  const { t } = useTranslation();
  const round = game.rounds[game.round];
  const points = game.point_tracker[game.round];

  return (
    <div className="font-oswald flex flex-col items-center">
      <div className="relative inline-block">
        <ScoreMonitor points={points} id="roundPointsTeamtotal" className="w-60" />
        {round.multiply > 1 && (
          <span
            id="roundMultiplyText"
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 rounded bg-yellow-500 px-2 py-0.5 text-2xl font-bold text-black shadow"
          >
            x{t("number", { count: round.multiply })}
          </span>
        )}
      </div>
      {game.settings.hide_questions === false && (
        <p
          id="roundQuestionText"
          className="mt-1 max-w-[1060px] text-center text-2xl text-foreground opacity-80"
        >
          {round.question}
        </p>
      )}
    </div>
  );
}
