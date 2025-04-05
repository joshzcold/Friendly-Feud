import ToolTipIcon from "@/components/ui/tooltip";
import { Game } from "@/src/types/game";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface BuzzerSoundSettingsProps {
  game: Game;
  setGame: Dispatch<SetStateAction<Game>>;
  send: (data: any) => void;
}

export default function BuzzerSoundSettings({ game, setGame, send }: BuzzerSoundSettingsProps) {
  const { t } = useTranslation();

  const handlePlayerBuzzerSoundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const playerBuzzerSound = e.target.checked;

    setGame((prevGame) => {
      if (prevGame === null) {
        return prevGame;
      }

      const updatedGame = {
        ...prevGame,
        settings: {
          ...prevGame.settings,
          player_buzzer_sound: playerBuzzerSound,
        },
      };

      send({ action: "data", data: updatedGame });

      return updatedGame;
    });
  };

  const handleFirstBuzzerSoundOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const firstBuzzerSoundOnly = e.target.checked;

    setGame((prevGame) => {
      if (prevGame === null) {
        return prevGame;
      }

      const updatedGame = {
        ...prevGame,
        settings: { ...prevGame.settings, first_buzzer_sound_only: firstBuzzerSoundOnly },
      };

      send({ action: "data", data: updatedGame });

      return updatedGame;
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col">
        <div className="flex flex-row items-center space-x-5">
          <div className="flex flex-row items-center space-x-2">
            <ToolTipIcon message={t("Allow players to hear sound on their devices when they press their buzzer")} />
            <p className="text-xl normal-case text-foreground">{t("Player Buzzer Sounds")}</p>
          </div>
          <input
            className="size-4 rounded placeholder:text-secondary-900"
            checked={game.settings.player_buzzer_sound}
            onChange={handlePlayerBuzzerSoundChange}
            type="checkbox"
          ></input>
        </div>
      </div>

      <div className={`flex flex-col ${!game.settings.player_buzzer_sound ? "opacity-50" : ""}`}>
        <div className="flex flex-row items-center space-x-5">
          <div className="flex flex-row items-center space-x-2">
            <ToolTipIcon message={t("Only play sound for the first player to buzz in")} />
            <p className="text-xl normal-case text-foreground">{t("First Press Only")}</p>
          </div>
          <input
            className="size-4 rounded placeholder:text-secondary-900"
            checked={game.settings.first_buzzer_sound_only}
            disabled={!game.settings.player_buzzer_sound}
            onChange={handleFirstBuzzerSoundOnlyChange}
            type="checkbox"
          ></input>
        </div>
      </div>
    </div>
  );
}
