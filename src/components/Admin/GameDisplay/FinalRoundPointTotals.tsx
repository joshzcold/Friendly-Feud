import { FinalRound, Game } from "@/src/types/game";
import { useTranslation } from "react-i18next";

interface FinalRoundPointTotalsTextFunctionProps {
  title: string;
  total: number;
  isFinalSecond: boolean;
  place: number;
}

function FinalRoundPointTotalsTextFunction({
  title,
  total,
  isFinalSecond,
  place,
}: FinalRoundPointTotalsTextFunctionProps) {
  const { t } = useTranslation();
  const backgroundColor =
    (isFinalSecond && place === 1) || (!isFinalSecond && place === 0) ? "bg-primary-200" : "bg-secondary-300";
  return (
    <div
      className={`flex flex-row items-center space-x-2 rounded-3xl border-2 p-4 text-2xl text-foreground ${backgroundColor} text-foreground`}
    >
      <p id={`finalRoundPointTotal${place}TitleText`}>{t(title)}: </p>
      <p id={`finalRoundPointTotal${place}TotalText`}>{total}</p>
    </div>
  );
}

const calculateTotalPoints = (rounds: FinalRound[]) => rounds.reduce((total, round) => total + round.points, 0);

interface FinalRoundPointTotalsProps {
  game: Game;
}

export default function FinalRoundPointTotals({ game }: FinalRoundPointTotalsProps) {
  const roundOneTotal = calculateTotalPoints(game.final_round);
  const roundTwoTotal = calculateTotalPoints(game.final_round_2);
  return (
    <div className="flex flex-row items-center justify-start space-x-5 py-3">
      <FinalRoundPointTotalsTextFunction
        title="Round one"
        total={roundOneTotal}
        isFinalSecond={game.is_final_second}
        place={0}
      />
      <FinalRoundPointTotalsTextFunction
        title="Round two"
        total={roundTwoTotal}
        isFinalSecond={game.is_final_second}
        place={1}
      />
      <FinalRoundPointTotalsTextFunction
        title="Total"
        total={roundOneTotal + roundTwoTotal}
        isFinalSecond={game.is_final_second}
        place={2}
      />
    </div>
  );
}
