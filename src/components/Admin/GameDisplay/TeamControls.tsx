import { getTeamDisplayName } from "@/src/lib/utils";
import { Game, WSEvent } from "@/src/types/game";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface TeamControlsProps {
  game: Game;
  setGame: Dispatch<SetStateAction<Game | null>>;
  team: number;
  send: (data: WSEvent) => void;
  setPointsGiven: Dispatch<SetStateAction<{ state: boolean; color: string; textColor: string }>>;
  pointsGiven: { state: boolean; color: string; textColor: string };
}

export default function TeamControls({ game, setGame, team, send, setPointsGiven, pointsGiven }: TeamControlsProps) {
  const { t } = useTranslation();

  function TeamGetsPointsButton() {
    return (
      <button
        disabled={pointsGiven.state}
        id={`team${team}GivePointsButton`}
        className={`border-4 text-2xl ${pointsGiven.color} rounded p-10 ${pointsGiven.textColor}`}
        onClick={() => {
          game.teams[team].points = game.point_tracker[game.round] + game.teams[team].points;
          setPointsGiven({
            state: true,
            color: "bg-secondary-500",
            textColor: "text-foreground",
          });
          // @ts-expect-error: need a better way to update these values
          setGame((prv) => ({ ...prv }));
          send({ action: "data", data: game });
        }}
      >
        {getTeamDisplayName(game.teams[team].name, team, t)}: {t("Gets Points")}
      </button>
    );
  }

  function TeamMistakeButton() {
    return (
      <button
        id={`team${team}MistakeButton`}
        className="rounded border-4 bg-failure-500 p-10 text-2xl text-foreground"
        onClick={() => {
          if (game.teams[team].mistakes < 3) game.teams[team].mistakes++;
          // @ts-expect-error: need a better way to update these values
          setGame((prv) => ({ ...prv }));
          send({ action: "data", data: game });
          send({
            action: "mistake",
          });
        }}
      >
        {getTeamDisplayName(game.teams[team].name, team, t)}: {t("mistake")}
      </button>
    );
  }

  return (
    <>
      <TeamGetsPointsButton />
      <TeamMistakeButton />
    </>
  );
}
