import { Game } from "@/types/game";
import Image from "next/image";
import FitText from "@/components/FitText";
import ScoreMonitor from "@/components/ScoreMonitor";

interface TeamNameProps {
  team: number;
  game: Game;
}

export default function TeamName({ team, game }: TeamNameProps) {
  const teamData = game.teams[team];
  const firstBuzz = game.buzzed.length > 0 ? game.buzzed[0] : null;
  const firstBuzzedTeam = firstBuzz
    ? (game.registeredPlayers[firstBuzz.id]?.team ?? firstBuzz.team ?? null)
    : null;

  return (
    <div className="font-oswald flex w-full min-w-0 flex-col items-center">
      <ScoreMonitor
        points={teamData.points}
        id={`roundPointsTeam${team + 1}`}
        className="w-full max-w-48"
        highlight={firstBuzzedTeam === team}
      />

      <FitText
        text={teamData.name}
        fontSize={32}
        id={`team${team}TeamName`}
        className="my-2 h-8 w-full font-bold uppercase text-foreground"
      />

      <div
        id={`team${team}MistakesList`}
        className="flex h-12 space-x-1"
      >
        {Array.from({ length: teamData.mistakes }, (_, i) => (
          <div key={`mistake-${i}-${team}`} className="h-full">
            <Image width={100} height={100} src="/x.svg" alt="Team Mistake Indicator" className="h-full w-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
