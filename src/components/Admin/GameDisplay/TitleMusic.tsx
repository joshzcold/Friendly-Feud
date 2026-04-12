import { useTranslation } from "react-i18next";
import { WSEvent } from "@/types/game";

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
        onClick={() => send({ action: "play_title_music" })}
      >
        {t("play")}
      </button>
      <button
        id="pauseTitleMusicButton"
        className="rounded border-2 bg-secondary-300 px-4 py-2 text-foreground"
        onClick={() => send({ action: "pause_title_music" })}
      >
        {t("Pause")}
      </button>
    </div>
  );
}
