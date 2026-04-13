import { useTranslation } from "react-i18next";
import { WSAction, WSEvent } from "@/types/game";

interface TitleMusicProps {
  send: (data: WSEvent) => void;
}

export default function TitleMusic({ send }: TitleMusicProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row items-center space-x-5 p-5">
      <h3 className="text-2xl text-foreground">{t("Title Music")}</h3>
      <button
        id="playTitleMusicButton"
        className="rounded border-2 bg-secondary-300 px-4 py-2 text-foreground"
        onClick={() => send({ action: WSAction.PLAY_TITLE_MUSIC })}
      >
        {t("Play")}
      </button>
      <button
        id="pauseTitleMusicButton"
        className="rounded border-2 bg-secondary-300 px-4 py-2 text-foreground"
        onClick={() => send({ action: WSAction.PAUSE_TITLE_MUSIC })}
      >
        {t("Pause")}
      </button>
    </div>
  );
}
