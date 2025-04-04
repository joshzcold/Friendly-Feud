import { Game } from "@/types/game";
import { useTranslation } from "react-i18next";

interface BuzzerTableProps {
  game: Game;
}

export default function BuzzerTable({ game }: BuzzerTableProps) {
  const { t } = useTranslation();

  if (!game?.buzzed) return null;

  return (
    <table className="w-full">
      <thead>
        <tr className="text-left text-foreground">
          <th>#</th>
          <th>{t("team")}</th>
          <th>{t("player")}</th>
          <th>{t("time")}</th>
        </tr>
      </thead>
      <tbody>
        {game.buzzed.length > 0 &&
          game.buzzed.map((buzz, index) => {
            const player = game.registeredPlayers[buzz.id];
            const teamIndex = player?.team;

            let teamName = t("Team not found");
            if (player && typeof teamIndex === "number" && teamIndex >= 0 && teamIndex < 2) {
              const team = game.teams[teamIndex];
              if (team?.name) {
                teamName = team.name;
              }
            }

            const playerName = player?.name ?? t("User not found");

            return (
              <tr key={`buzzer-${buzz.id}-${index}`}>
                <td id={`playerBuzzed${index}NumberText`} className="text-left text-foreground">
                  {t("number", { count: index + 1 })}
                </td>

                <td id={`playerBuzzed${index}TeamNameText`} className="text-left text-foreground">
                  {teamName}
                </td>

                <td id={`playerBuzzed${index}NameText`} className="text-left text-foreground">
                  {playerName}
                </td>

                <td id={`playerBuzzer${index}BuzzerTimeText`} className="text-left text-foreground">
                  {((buzz.time - game.round_start_time) / 1000).toFixed(2)}s
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
