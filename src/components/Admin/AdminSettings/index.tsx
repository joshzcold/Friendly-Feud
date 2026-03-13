import "@/i18n/i18n";
import ThemeSwitcher from "@/components/Admin/ThemeSwitcher";
import { Game, WSEvent } from "@/src/types/game";
import { Dispatch, SetStateAction } from "react";
import { WSAction } from "@/src/types/game";
import { useTranslation } from "react-i18next";
import ToolTipIcon from "../../ui/tooltip";
import BuzzerSoundSettings from "./BuzzerSoundSettings";
import FinalRoundTitleChanger from "./FinalRoundTitleChanger";

interface AdminSettingsProps {
  game: Game;
  setGame: Dispatch<SetStateAction<Game | null>>;
  send: (data: WSEvent) => void;
  hostPassword: string;
}

export default function AdminSettings({ game, setGame, send, hostPassword }: AdminSettingsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-2 gap-x-48 gap-y-10">
        <ThemeSwitcher game={game} setGame={setGame} send={send} />
        <FinalRoundTitleChanger game={game} setGame={setGame} send={send} />
        <BuzzerSoundSettings game={game} setGame={setGame} send={send} />
        <div className="flex flex-row items-center space-x-5">
          <div className="flex flex-row items-center space-x-2">
            <ToolTipIcon message={t("Hide the room code and team info on the title screen")} />
            <p className="text-xl normal-case text-foreground">{t("Hide Join Info")}</p>
          </div>
          <input
            className="size-4 rounded placeholder:text-secondary-900"
            checked={game.settings.hide_join_info}
            onChange={(e) => {
              const hideJoinInfo = e.target.checked;
              setGame((prevGame) => {
                if (prevGame === null) return prevGame;
                const updatedGame = {
                  ...prevGame,
                  settings: { ...prevGame.settings, hide_join_info: hideJoinInfo },
                };
                send({ action: WSAction.DATA, data: updatedGame });
                return updatedGame;
              });
            }}
            type="checkbox"
          />
        </div>
        <div className="flex flex-row items-center space-x-2">
          <ToolTipIcon message={t("Used when setting up buzzers on an external admin device.")} />
          <p className="text-xl capitalize text-foreground">{t("host password")}:</p>
          <p id="hostPassword" className="rounded-sm bg-secondary-500 p-2 text-xl text-foreground">
            {hostPassword}
          </p>
        </div>
      </div>
    </div>
  );
}
