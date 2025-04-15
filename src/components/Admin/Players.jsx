import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { Eye, EyeOff } from "lucide-react";

function PlayerActionButtons({ player, game, setGame, ws, room, teamNumber, index }) {
  const { t } = useTranslation();

  const toggleVisibility = () => {
    game.registeredPlayers[player.id].hidden = !game.registeredPlayers[player.id].hidden;
    setGame((prev) => ({ ...prev }));
    ws.current.send(
      JSON.stringify({
        action: "data",
        data: game,
        room,
      })
    );
  };

  const removePlayer = () => {
    ws.current.send(
      JSON.stringify({
        action: "quit",
        host: false,
        id: player.id,
        room,
      })
    );
  };

  return (
    <div className="flex flex-row space-x-2">
      {/* Toggle visibility button */}
      <button
        className={`border-4 ${player.hidden ? "bg-secondary-300" : "bg-success-300"} rounded-lg p-2 hover:opacity-80`}
        id={`player${index}Team${teamNumber}HideGameButton`}
        onClick={toggleVisibility}
        title={t(player.hidden ? "Remove player's blindfold" : "Blindfold player")}
      >
        {player.hidden ? <EyeOff /> : <Eye />}
      </button>
      {/* Remove player button */}
      <button
        id={`player${index}Team${teamNumber}QuitButton`}
        className="rounded-lg border-4 bg-failure-300 p-2 hover:bg-failure-500"
        onClick={removePlayer}
        title={t("Remove player from game")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 717 718"
        >
          <path
            d="M651.22 154c98 139 85 334-40 459s-318 137-458 40c-16-12-34-26-49-40c-15-15-28-32-39-49c-98-139-86-334 39-459s319-137 459-40c16 12 33 26 48 40c15 15 29 32 40 49zm-522 345l370-370c-104-63-242-50-331 39c-90 90-102 228-39 331zm458-280l-370 369c104 63 242 50 331-39c90-90 102-227 39-330z"
            fill="#ffffff"
          />
          <rect x="0" y="0" width="717" height="718" fill="rgba(0, 0, 0, 0)" />
        </svg>
      </button>
    </div>
  );
}

function TeamSection({ team, teamNumber, game, setGame, ws, room }) {
  return (
    <div>
      {team.map((player, index) => (
        <div key={`teamSection-player-${player.id}`} className="m-2 flex flex-row items-center space-x-5 border-2">
          {/* Player information */}
          <div className="grow">
            <p className="uppercase text-foreground">{player.name}</p>
          </div>
          {/* Player action buttons */}
          <PlayerActionButtons
            player={player}
            game={game}
            setGame={setGame}
            ws={ws}
            room={room}
            teamNumber={teamNumber}
            index={index}
          />
        </div>
      ))}
    </div>
  );
}

export default function Players({ game, setGame, ws, room }) {
  const teams = [[], []];
  Object.entries(game.registeredPlayers || []).forEach(([id, player]) => {
    if ("team" in player) {
      teams[player.team]?.push({ id, name: player.name, hidden: player.hidden });
    }
  });

  return (
    <div className="grow">
      <div className="flex h-48 grow flex-row overflow-y-scroll rounded border-4 p-2 text-center">
        {/* Team 1 section */}
        <div className="grow">
          <p className="text-foreground">{game.teams[0].name}</p>
          <hr />
          <TeamSection team={teams[0]} teamNumber={1} game={game} setGame={setGame} ws={ws} room={room} />
        </div>
        {/* Separator */}
        <div className="h-full border bg-secondary-300" />
        {/* Team 2 section */}
        <div className="grow">
          <p className="text-foreground">{game.teams[1].name}</p>
          <hr />
          <TeamSection team={teams[1]} teamNumber={2} game={game} setGame={setGame} ws={ws} room={room} />
        </div>
      </div>
    </div>
  );
}
