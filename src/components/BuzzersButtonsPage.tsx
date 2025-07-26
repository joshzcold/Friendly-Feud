import { Game, WSAction } from "@/types/game";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface BuzzersButtonsPageProps {
  game: Game | null;
  send: (data: any) => void;
  buzzed: boolean;
}

export default function BuzzersButtonsPage({ game, send, buzzed }: BuzzersButtonsPageProps) {
  const { t } = useTranslation();
  let buzzColors = ["bg-failure-500", "bg-primary-500"];
  let writingDirection = ["[writing-mode:vertical-lr]", "[writing-mode:vertical-lr] rotate-180"];
  if (buzzed) {
    buzzColors = ["bg-secondary-900", "bg-secondary-900"];
  }

  const triggerBuzzKeyPress = (evt: KeyboardEvent) => {
    if (buzzed) {
      return;
    }
    if (evt.key == "j") {
      send({ action: WSAction.BUZZER_SCREEN_BUZZ.valueOf(), team: 0 });
      return;
    }
    if (evt.key == "k") {
      send({ action: WSAction.BUZZER_SCREEN_BUZZ.valueOf(), team: 1 });
      return;
    }
    return;
  };

  useEffect(() => {
    window.addEventListener("keydown", triggerBuzzKeyPress, false);
  }, []);
  return (
    <>
      {buzzed ? (
        <div id="buzzersInfo" className="absolute z-50 flex min-h-screen min-w-full items-center justify-center">
          <div className="rounded-xl bg-warning-900 p-5 text-6xl capitalize text-white">
            {game?.teams[game?.buzzed[0]?.team]?.name}
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
                  text-white
              `}
              onClick={() => {
                if (buzzed) {
                  return;
                }
                send({ action: WSAction.BUZZER_SCREEN_BUZZ.valueOf(), team: i });
              }}
            >
              {game?.teams[i].name}
            </button>
          ))}
      </div>
    </>
  );
}
