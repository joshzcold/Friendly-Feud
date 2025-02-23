import { useTranslation } from "react-i18next";
import { debounce } from "@/lib/utils";
import TitleLogoUpload from "@/components/Admin/TitleLogoUpload";

function TitlesAndLogoSettings({
  game,
  send,
  room,
  setGame,
  setError,
  setImageUploaded,
  imageUploaded,
  error
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center space-y-5">
      <div className="grid grid-cols-2 gap-x-48 gap-y-10">
        <div className="flex flex-row justify-between space-x-5">
          {/* TITLE TEXT INPUT */}
          <div className="flex flex-row items-center space-x-5">
            <p className="text-2xl text-foreground">{t("Title Text")}:</p>
            <input
              id="titleTextInput"
              className="w-44 rounded border-4 bg-secondary-500 p-1 text-2xl text-foreground placeholder:text-secondary-900"
              onChange={debounce((e) => {
                game.title_text = e.target.value;
                setGame((prv) => ({ ...prv }));
                send({ action: "data", data: game });
              })}
              placeholder={t("My Family")}
              defaultValue={game.title_text}
            ></input>
          </div>
        </div>
        <TitleLogoUpload
          send={send}
          room={room}
          setGame={setGame}
          game={game}
          setError={setError}
          setImageUploaded={setImageUploaded}
          imageUploaded={imageUploaded}
        />
        <div className="w-80 flex-row items-center space-x-1">
          {/* TEAM 1 NAME CHANGER */}
          <input
            id="teamOneNameInput"
            className="w-52 rounded border-4 bg-secondary-500 p-1 text-3xl text-foreground placeholder:text-secondary-900"
            onChange={debounce((e) => {
              game.teams[0].name = e.target.value;
              setGame((prv) => ({ ...prv }));
              send({ action: "data", data: game });
            })}
            placeholder={t("Team Name")}
            defaultValue={game.teams[0].name}
          ></input>
          {/* TEAM 1 POINTS CHANGER */}
          <input
            id="teamOnePointsInput"
            type="number"
            min="0"
            required
            className="w-20 rounded border-4 bg-secondary-500 p-1 text-center text-3xl text-foreground placeholder:text-secondary-900"
            onChange={(e) => {
              let number = parseInt(e.target.value);
              console.debug(number);
              isNaN(number) ? (number = 0) : null;
              game.teams[0].points = number;
              setGame((prv) => ({ ...prv }));
              send({ action: "data", data: game });
            }}
            value={game.teams[0].points}
          ></input>
        </div>
        <div className="w-80 flex-row items-center space-x-1">
          {/* TEAM 2 NAME CHANGER */}
          <input
            id="teamTwoNameInput"
            className="w-52 rounded border-4 bg-secondary-500 p-1 text-3xl text-foreground placeholder:text-secondary-900"
            onChange={debounce((e) => {
              game.teams[1].name = e.target.value;
              setGame((prv) => ({ ...prv }));
              send({ action: "data", data: game });
            })}
            placeholder={t("Team Name")}
            defaultValue={game.teams[1].name}
          ></input>
          {/* TEAM 2 POINTS CHANGER */}
          <input
            id="teamTwoPointsInput"
            type="number"
            min="0"
            required
            className="w-20 rounded border-4 bg-secondary-500 p-1 text-center text-3xl text-foreground placeholder:text-secondary-900"
            onChange={(e) => {
              let number = parseInt(e.target.value);
              isNaN(number) ? (number = 0) : null;
              game.teams[1].points = number;
              setGame((prv) => ({ ...prv }));
              send({ action: "data", data: game });
            }}
            value={game.teams[1].points}
          ></input>
        </div>
      </div>
      <p id="errorText" className="text-xl text-failure-700">
        {error.code ? t(error.code, { message: error.message }) : t(error)}
      </p>
    </div>
  );
}

export default TitlesAndLogoSettings;