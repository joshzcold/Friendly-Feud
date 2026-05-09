import RoomCode from "@/components/Title/RoomCode";
import Team from "@/components/Title/Team";
import TitleLogo from "@/components/TitleLogo";
import { Game } from "@/types/game";
import Image from "next/image";
import { useEffect, useState } from "react";

interface TitlePageProps {
  game: Game;
}

export default function TitlePage({ game }: TitlePageProps) {
  const [titleSize, setTitleSize] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      setTitleSize(
        window.innerWidth < 640
          ? 45 // Mobile
          : window.innerWidth < 1024
            ? 80 // Tablet
            : 90 // Desktop and larger
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function returnTeamMates(team: number) {
    const players: string[] = [];
    console.debug(game);
    Object.keys(game.registeredPlayers).forEach((k) => {
      console.debug(k);
      if (game.registeredPlayers[k].team === team) {
        players.push(game.registeredPlayers[k].name);
      }
    });
    console.debug(players);
    return players;
  }

  return (
    <div className="min-w-screen flex min-h-screen flex-col items-center justify-center bg-gradient-to-t from-primary-900 via-primary-200 to-primary-900 py-5">
      {/* Logo Section */}
      <div
        style={{
          width: `${titleSize}%`,
          transition: "width 2s",
        }}
        className="inline-block align-middle"
      >
        <div className="flex w-full justify-center">
          {game.settings.logo_url ? (
            <div className="relative mb-6 w-full max-h-[40vh] aspect-[16/9]">
              <Image
                fill
                style={{ objectFit: "contain" }}
                src={`${game.settings.logo_url}?v=${Date.now()}`}
                alt="Game logo"
                priority
                unoptimized
              />
            </div>
          ) : (
            <TitleLogo insert={game.title_text} />
          )}
        </div>
      </div>

      {!game.settings.hide_join_info && (
        <div
          className="grid h-[200px] grid-cols-3 gap-4 2xl:h-[250px]"
          style={{
            width: `${titleSize}%`,
            transition: "width 2s",
          }}
        >
          <Team team={game.teams[0].name} players={returnTeamMates(0)} />
          <RoomCode code={game.room} />
          <Team team={game.teams[1].name} players={returnTeamMates(1)} />
        </div>
      )}
    </div>
  );
}
