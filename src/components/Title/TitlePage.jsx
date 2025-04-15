import RoomCode from "@/components/Title/RoomCode";
import Team from "@/components/Title/Team";
import TitleLogo from "@/components/TitleLogo";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function TitlePage({ game }) {
  const [titleSize, setTitleSize] = useState("10%");

  useEffect(() => {
    const handleResize = () => {
      if (game.settings.logo_url) {
        setTitleSize(window.innerWidth * 0.75);
      } else {
        setTitleSize(
          window.innerWidth *
            (window.innerWidth < 640
              ? 0.8
              : window.innerWidth < 1024
                ? 0.8
                : window.innerWidth < 1280
                  ? 0.7
                  : window.innerWidth < 1536
                    ? 0.75
                    : 0.75)
        );
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [game.settings.logo_url]);

  function returnTeamMates(team) {
    let players = [];
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
          width: titleSize,
          transition: "width 2s",
        }}
        className="inline-block align-middle"
      >
        <div className="flex w-full justify-center ">
          {game.settings.logo_url ? (
            <Image
              width={300}
              height={300}
              style={{ objectFit: "contain" }}
              src={`${game.settings.logo_url}?v=${Date.now()}`}
              alt="Game logo"
              priority // Load image immediately
              unoptimized // Skip caching
            />
          ) : (
            <TitleLogo insert={game.title_text} size={titleSize} />
          )}
        </div>
      </div>

      <div
        className="grid h-[200px] grid-cols-3 gap-4 2xl:h-[250px]"
        style={{
          width: titleSize,
          transition: "width 2s",
        }}
      >
        <Team team={game.teams[0].name} players={returnTeamMates(0)} />
        <RoomCode code={game.room} />
        <Team team={game.teams[1].name} players={returnTeamMates(1)} />
      </div>
    </div>
  );
}
