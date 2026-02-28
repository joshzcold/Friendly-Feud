import AvatarDisplay from "@/components/AvatarDisplay";
import { RegisteredPlayer } from "@/types/game";

interface TeamProps {
  team: string;
  players: Array<{ name: string; player: RegisteredPlayer }>;
}

export default function Team({ team, players }: TeamProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-secondary-500 text-center shadow-lg">
      <p className="rounded-t-xl bg-secondary-700 py-2 text-4xl font-bold text-foreground shadow-sm" id="team-name">
        {team}
      </p>
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 overflow-y-auto">
          <div className="flex flex-row flex-wrap justify-center px-2">
            {players.map((m, index) => (
              <div
                key={`${m.name}-${index}`}
                className="m-2 flex flex-col items-center gap-1 w-20 rounded-lg bg-primary-200 p-2 xl:w-28"
              >
                <AvatarDisplay avatar={m.player.avatar} size="small" />
                <p className="truncate font-bold text-foreground text-xs">{m.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
