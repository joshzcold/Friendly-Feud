import "@/i18n/i18n";
import ThemeSwitcher from "@/components/Admin/ThemeSwitcher";
import { Game } from "@/src/types/game";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import ToolTipIcon from "../../ui/tooltip";
import BuzzerSoundSettings from "./BuzzerSoundSettings";
import FinalRoundTitleChanger from "./FinalRoundTitleChanger";

interface AdminSettingsProps {
  game: Game;
  setGame: Dispatch<SetStateAction<Game | null>>;
  send: (data: any) => void;
  hostPassword: String;
}

export default function AdminSettings({ game, setGame, send, hostPassword }: AdminSettingsProps) {
  const { i18n, t } = useTranslation();
  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-2 gap-x-48 gap-y-10">
        <ThemeSwitcher game={game} setGame={setGame} send={send} />
        <FinalRoundTitleChanger game={game} setGame={setGame} send={send} />
        <BuzzerSoundSettings game={game} setGame={setGame} send={send} />
        <div className="flex flex-row items-center space-x-2">
          <ToolTipIcon message={t("Used when setting up buzzers on an external admin device.")} />
          <p className="text-xl capitalize text-foreground">{t("host password")}:</p>
          <p className="rounded-sm bg-secondary-500 p-2 text-xl text-foreground">{hostPassword}</p>
        </div>
      </div>
    </div>
  );
}
