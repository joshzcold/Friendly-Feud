import { useTranslation } from "react-i18next";

function TitleMusic() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row items-center space-x-5  p-5">
      <h3 className="text-2xl text-foreground">{t("Title Music")}</h3>
      <audio controls id="titleMusicAudio">
        <source src="title.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}

export default TitleMusic;