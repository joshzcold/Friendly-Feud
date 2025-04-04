import ToolTipIcon from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

function BuzzerSoundSettings({ game, setGame, send }) {
  const { t } = useTranslation();

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
            onChange={(e) => {
              game.settings.player_buzzer_sound = e.target.checked;
              if (!e.target.checked) {
                game.settings.first_buzzer_sound_only = false;
              }
              setGame((prv) => ({ ...prv }));
              send({ action: "data", data: game });
            }}
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
            onChange={(e) => {
              game.settings.first_buzzer_sound_only = e.target.checked;
              setGame((prv) => ({ ...prv }));
              send({ action: "data", data: game });
            }}
            type="checkbox"
          ></input>
        </div>
      </div>
    </div>
  );
}

export default BuzzerSoundSettings;
