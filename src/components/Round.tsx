import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { Game } from "@/types/game";

interface RoundPointTallyProps {
  points: number;
  team: number | "total";
  fontWeight?: string;
}

function RoundPointTally({ points, team, fontWeight = "normal" }: RoundPointTallyProps) {
  const { t } = useTranslation();
  // start at font size 72 and get smaller as point values increase
  const size = 72 - `${points}`.length * 8;
  return (
    <div style={{ borderWidth: 12 }} className="border-black bg-gradient-to-tr from-primary-900 to-primary-500 p-1">
      {/* text within svg can resize the text based on container*/}
      <svg viewBox="-50 -50 100 100" height="100%" width="100%" preserveAspectRatio="xMidYMid meet">
        <text
          fontWeight={fontWeight}
          fontSize={size}
          pointerEvents="auto"
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
          id={`roundPointsTeam${team}`}
        >
          {t("number", { count: points })}
        </text>
      </svg>
    </div>
  );
}

interface RoundProps {
  game: Game;
}

export default function Round({ game }: RoundProps) {
  const { t } = useTranslation();
  const current_round = game.round;
  const round = game.rounds[current_round];
  return (
    <div className="flex w-auto flex-col items-center space-y-1">
      <div className="flex h-28 flex-row justify-around space-x-2">
        <RoundPointTally points={game.teams[0].points} team={1} />
        <RoundPointTally points={game.point_tracker[game.round]} fontWeight="bold" team="total" />
        <RoundPointTally points={game.teams[1].points} team={2} />
      </div>

      <div className="flex flex-row justify-center">
        {round.multiply > 1 ? (
          <div>
            <p id="roundMultiplyText" className="text-start text-2xl text-foreground">
              x{t("number", { count: round.multiply })}
            </p>
          </div>
        ) : null}
      </div>
      <div className="flex flex-row justify-center">
        {game.settings.hide_questions === false ? (
          <p id="roundQuestionText" className="sm:text-1xl text-end text-2xl text-foreground">
            {round.question}
          </p>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
