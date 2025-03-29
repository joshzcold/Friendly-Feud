import { useTranslation } from "react-i18next";

function TeamControls({ game, setGame, team, send, setPointsGiven, pointsGiven }) {
  const { t } = useTranslation();

  function TeamGetsPointsButton() {
    return (
      <button
        disabled={pointsGiven.state}
        id={`team${team}GivePointsButton`}
        className={`border-4 text-2xl ${pointsGiven.color} rounded p-10 ${pointsGiven.textColor}`}
        onClick={() => {
          game.teams[team].points =
            game.point_tracker[game.round] + game.teams[team].points;
            setPointsGiven({
            state: true,
            color: "bg-secondary-500",
            textColor: "text-foreground",
          });
          setGame((prv) => ({ ...prv }));
          send({ action: "data", data: game });
        }}
      >
        {t("team")} {t("number", { count: team + 1 })}: {game.teams[team].name} {t("Gets Points")}
      </button>
    );
  }

  function TeamMistakeButton() {
    return (
      <button
        id={`team${team}MistakeButton`}
        className="rounded border-4 bg-failure-500 p-10 text-2xl text-foreground"
        onClick={() => {
          if (game.teams[team].mistakes < 3) game.teams[team].mistakes++;
          setGame((prv) => ({ ...prv }));
          send({ action: "data", data: game });
          send({
            action: "mistake",
            data: game.teams[team].mistake,
          });
        }}
      >
        {t("team")} {t("number", { count: team + 1 })}: {game.teams[team].name} {t("mistake")}
      </button>
    );
  }

  return (
    <>
      <TeamGetsPointsButton />
      <TeamMistakeButton />
    </>
  );
}

export default TeamControls;