import { Game, WSEvent } from "@/src/types/game";
import { Dispatch, SetStateAction } from "react";
import SettingsCheckbox from "./SettingsCheckbox";

interface BuzzerSoundSettingsProps {
  game: Game;
  setGame: Dispatch<SetStateAction<Game | null>>;
  send: (data: WSEvent) => void;
}

export default function BuzzerSoundSettings({ game, setGame, send }: BuzzerSoundSettingsProps) {
  return (
    <div className="flex flex-col space-y-4">
      <SettingsCheckbox
        game={game}
        setGame={setGame}
        send={send}
        label="Player Buzzer Sounds"
        tooltip="Allow players to hear sound on their devices when they press their buzzer"
        settingKey="player_buzzer_sound"
      />
      <SettingsCheckbox
        game={game}
        setGame={setGame}
        send={send}
        label="First Press Only"
        tooltip="Only play sound for the first player to buzz in"
        settingKey="first_buzzer_sound_only"
        disabled={!game.settings.player_buzzer_sound}
      />
    </div>
  );
}
