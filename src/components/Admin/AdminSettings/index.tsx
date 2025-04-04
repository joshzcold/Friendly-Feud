import "@/i18n/i18n";
import ThemeSwitcher from "@/components/Admin/ThemeSwitcher";
import BuzzerSoundSettings from "./BuzzerSoundSettings";
import FinalRoundTitleChanger from "./FinalRoundTitleChanger";

export default function AdminSettings({ game, setGame, send }) {
  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-2 gap-x-48 gap-y-10">
        <ThemeSwitcher game={game} setGame={setGame} send={send} />
        <FinalRoundTitleChanger game={game} setGame={setGame} send={send} />
        <BuzzerSoundSettings game={game} setGame={setGame} send={send} />
      </div>
    </div>
  );
}
