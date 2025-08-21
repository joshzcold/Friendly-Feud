import { TranslateFunction } from "@/src/types";

/**
 * Gets the display name for a team based on these rules:
 * - If team name is empty: show "Team 1"/"Team 2"
 * - If team name has value: show the actual team name
 *
 * @param teamName - The current team name (could be empty, "Alpha", "Bravo", or custom)
 * @param teamIndex - Zero-based team index (0 or 1)
 * @param t - Translation function from useTranslation()
 * @returns Formatted team display name
 */
export function getTeamDisplayName(teamName: string, teamIndex: number, t: TranslateFunction): string {
  if (teamName === "") {
    return `${t("team")} ${teamIndex + 1}`;
  }

  return `${t("team")} ${teamName}`;
}
