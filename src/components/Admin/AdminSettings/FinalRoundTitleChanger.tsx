import { debounce } from "@/lib/utils";
import { Game } from "@/types/game";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface FinalRoundTitleChangerProps {
  game: Game;
  setGame: Dispatch<SetStateAction<Game>>;
  send: (data: any) => void;
}

export default function FinalRoundTitleChanger({ game, setGame, send }: FinalRoundTitleChangerProps) {
  const { t } = useTranslation();

  const finalRoundTitle = game.settings.final_round_title ?? t("Final Round");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGame((prevGame) => {
      const finalRoundTitle = e.target.value;

      if (prevGame === null) {
        return prevGame;
      }

      const updatedGame = {
        ...prevGame,
        settings: {
          ...prevGame.settings,
          final_round_title: finalRoundTitle,
        },
      };

      send({ action: "data", data: updatedGame });

      return updatedGame;
    });
  };

  return (
    <div className="flex flex-row items-center space-x-5">
      <p className="text-xl text-foreground">{t("Final Round Title")}:</p>
      <input
        id="finalRoundTitleChangerInput"
        className="w-32 rounded border-4 bg-secondary-500 p-1 text-xl text-foreground placeholder:text-secondary-900"
        onChange={debounce(handleChange)}
        defaultValue={finalRoundTitle}
      ></input>
    </div>
  );
}
