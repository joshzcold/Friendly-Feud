import ToolTipIcon from "@/components/ui/tooltip";
import { Game, Settings, WSAction, WSEvent } from "@/src/types/game";
import { Dispatch, SetStateAction, useId } from "react";
import { useTranslation } from "react-i18next";

interface SettingsCheckboxProps {
  game: Game;
  setGame: Dispatch<SetStateAction<Game | null>>;
  send: (data: WSEvent) => void;
  label: string;
  tooltip: string;
  settingKey: { [K in keyof Settings]: Settings[K] extends boolean ? K : never }[keyof Settings];
  disabled?: boolean;
}

export default function SettingsCheckbox({
  game,
  setGame,
  send,
  label,
  tooltip,
  settingKey,
  disabled,
}: SettingsCheckboxProps) {
  const { t } = useTranslation();
  const id = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const updatedGame = {
      ...game,
      settings: { ...game.settings, [settingKey]: checked },
    };
    send({ action: WSAction.DATA, data: updatedGame });
    setGame(updatedGame);
  };

  return (
    <div className={`flex flex-row items-center space-x-5 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex flex-row items-center space-x-2">
        <ToolTipIcon message={t(tooltip)} />
        <label htmlFor={id} className="text-xl normal-case text-foreground">
          {t(label)}
        </label>
      </div>
      <input
        id={id}
        className="size-4 rounded placeholder:text-secondary-900"
        checked={game.settings[settingKey] as boolean}
        disabled={disabled}
        onChange={handleChange}
        type="checkbox"
      />
    </div>
  );
}
