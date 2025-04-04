import { Game } from "@/src/types/game";
import { Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface ThemeSwitcherProps {
  game: Game;
  setGame: Dispatch<SetStateAction<Game>>;
  send: (data: any) => void;
}

export default function ThemeSwitcher({ game, setGame, send }: ThemeSwitcherProps) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const availableThemes = {
    default: {
      bgcolor: "white",
      fgcolor: "text-black",
      title: "default",
    },
    darkTheme: {
      bgcolor: "#18181B",
      fgcolor: "text-white",
      title: "dark theme",
    },
    slate: {
      bgcolor: "#18181B",
      fgcolor: "text-white",
      title: "slate",
    },
    educational: {
      bgcolor: "#fffbf0",
      fgcolor: "text-black",
      title: "educational",
    },
    red: {
      bgcolor: "#7B2C35",
      fgcolor: "text-white",
      title: "red",
    },
  };

  const handleThemeChange = (newTheme: string) => {
    try {
      setTheme(newTheme);

      // Create deep copy of game state
      const updatedGame = JSON.parse(JSON.stringify(game));
      updatedGame.settings.theme = newTheme;

      // Update local state
      setGame(updatedGame);

      // Send update to server
      send({
        action: "data",
        data: updatedGame,
      });
    } catch (error) {
      console.error("Error updating theme:", error);
      // Revert theme on error
      setTheme(game.settings.theme);
    }
  };

  return (
    <div className="flex flex-row items-center space-x-5">
      <Palette color="gray" />
      <select
        id="themeSwitcherInput"
        className="w-full rounded-lg bg-secondary-300 p-2 capitalize text-foreground sm:w-fit"
        value={theme || "default"}
        onChange={(e) => handleThemeChange(e.target.value)}
        aria-label={t("Select theme")}
      >
        {Object.keys(availableThemes).map((key) => (
          <option
            value={key}
            key={`theme-${key}`}
            style={{
              backgroundColor: availableThemes[key as keyof typeof availableThemes].bgcolor,
            }}
            className={`${availableThemes[key as keyof typeof availableThemes].fgcolor} capitalize`}
          >
            {availableThemes[key as keyof typeof availableThemes].title}
          </option>
        ))}
      </select>
    </div>
  );
}
