import { Game, WSEvent } from "@/src/types/game";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface HideGameQuestionsProps {
  game: Game;
  setGame: Dispatch<SetStateAction<Game | null>>;
  send: (data: WSEvent) => void;
}

export default function HideGameQuestions({ game, setGame, send }: HideGameQuestionsProps) {
  const { t } = useTranslation();

  const textColor = game.settings.hide_questions ? "text-foreground" : "text-foreground";
  const buttonColor = game.settings.hide_questions ? "bg-secondary-500" : "bg-secondary-300";
  const textContent = game.settings.hide_questions ? t("Show questions") : t("Hide questions");
  const disabledOpacity = game.is_final_round ? "opacity-50" : "";

  return (
    <button
      id="hideQuestionsInput"
      className={`rounded border-4 p-10 text-2xl ${textColor} ${buttonColor} ${disabledOpacity}`}
      onClick={() => {
        setGame((prevGame) => {
          if (prevGame === null) {
            return prevGame;
          }

          const hideGame = !game.settings.hide_questions;

          const updatedGame = {
            ...prevGame,
            settings: {
              ...prevGame.settings,
              hide_questions: hideGame,
            },
          };

          send({ action: "data", data: updatedGame });

          return updatedGame;
        });
      }}
      type="button"
      disabled={game.is_final_round}
    >
      {textContent}
    </button>
  );
}
