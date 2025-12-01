import { getTeamDisplayName } from "@/lib/utils";
import { Game, WSAction, WSEvent } from "@/types/game";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface HostBuzzerPageProps {
  game: Game | null;
  send: (data: WSEvent) => void;
  buzzed: boolean;
}

export default function HostBuzzersPage({ game, send, buzzed }: HostBuzzerPageProps) {
  const { t } = useTranslation();
  let buzzColors = ["bg-failure-500", "bg-primary-500"];
  const writingDirection = ["[writing-mode:vertical-lr]", "[writing-mode:vertical-lr] rotate-180"];
  if (buzzed) {
    buzzColors = ["bg-secondary-900", "bg-secondary-900"];
  }

  const triggerBuzzKeyPress = useCallback(
    (evt: KeyboardEvent) => {
      if (buzzed) {
        return;
      }
      if (evt.key == "j") {
        send({ action: WSAction.BUZZER_SCREEN_BUZZ, team: 0 });
        return;
      }
      if (evt.key == "k") {
        send({ action: WSAction.BUZZER_SCREEN_BUZZ, team: 1 });
        return;
      }
      return;
    },
    [buzzed, send]
  );

  useEffect(() => {
    window.addEventListener("keydown", triggerBuzzKeyPress, false);
    return () => window.removeEventListener("keydown", triggerBuzzKeyPress, false);
  }, [triggerBuzzKeyPress]);
  return (
    <>
      {buzzed ? (
        <div className="absolute z-50 flex min-h-screen min-w-full items-center justify-center">
          <div id="buzzersInfo" className="rounded-xl bg-warning-900 p-5 text-6xl capitalize text-white">
            {game && game.buzzed[0]?.team !== undefined
              ? getTeamDisplayName(game.teams[game.buzzed[0].team].name, game.buzzed[0].team, t)
              : ""}
          </div>
        </div>
      ) : null}
      <div className="flex min-h-screen flex-row justify-between space-x-12 p-5">
        {Array(2)
          .fill(1)
          .map((_, i) => (
            <button
              key={i}
              id={`buzzersButtonTeam${i}`}
              className={`
                  ${buzzColors[i]}
                  ${writingDirection[i]}
                  w-full
                  rounded-full
                  text-6xl
                  font-extrabold
                  capitalize
                  text-white
              `}
              onClick={() => {
                if (buzzed) {
                  return;
                }
                send({ action: WSAction.BUZZER_SCREEN_BUZZ, team: i });
              }}
            >
              {game ? getTeamDisplayName(game.teams[i].name, i, t) : ""}
            </button>
          ))}
      </div>
    </>
  );
}
