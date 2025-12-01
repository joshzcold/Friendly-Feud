import TitleLogoUpload from "@/components/Admin/TitleLogoUpload";
import { debounce } from "@/lib/utils";
import { Game, WSEvent } from "@/types/game";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface TitlesAndLogoSettingsProps {
  game: Game;
  send: (data: WSEvent) => void;
  room: string;
  setGame: Dispatch<SetStateAction<Game | null>>;
  setImageUploaded: Dispatch<SetStateAction<File | null>>;
  imageUploaded: File | null;
}

export default function TitlesAndLogoSettings({
  game,
  send,
  room,
  setGame,
  setImageUploaded,
  imageUploaded,
}: TitlesAndLogoSettingsProps) {
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
              onChange={debounce((e: React.ChangeEvent<HTMLInputElement>) => {
                setGame((prevGame) => {
                  if (prevGame === null) {
                    return prevGame;
                  }

                  const newTitleText = e.target.value;

                  const updatedGame = {
                    ...prevGame,
                    title_text: newTitleText,
                  };

                  send({ action: "data", data: updatedGame });

                  return updatedGame;
                });
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
          setImageUploaded={setImageUploaded}
          imageUploaded={imageUploaded}
        />
        <div className="w-80 flex-row items-center space-x-1">
          {/* TEAM 1 NAME CHANGER */}
          <input
            id="teamOneNameInput"
            className="w-52 rounded border-4 bg-secondary-500 p-1 text-3xl text-foreground placeholder:text-secondary-900"
            onChange={debounce((e: React.ChangeEvent<HTMLInputElement>) => {
              setGame((prevGame) => {
                if (prevGame === null) {
                  return prevGame;
                }

                const team1Name = e.target.value;

                const updatedGame = {
                  ...prevGame,
                  teams: [
                    {
                      ...prevGame.teams[0],
                      name: team1Name,
                    },
                    prevGame.teams[1],
                  ],
                };

                send({ action: "data", data: updatedGame });

                return updatedGame;
              });
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
              if (isNaN(number)) {
                number = 0
              }
              setGame((prevGame) => {
                if (prevGame === null) {
                  return prevGame;
                }

                const team1Points = number;

                const updatedGame = {
                  ...prevGame,
                  teams: [
                    {
                      ...prevGame.teams[0],
                      points: team1Points,
                    },
                    prevGame.teams[1],
                  ],
                };

                send({ action: "data", data: updatedGame });

                return updatedGame;
              });
            }}
            value={game.teams[0].points}
          ></input>
        </div>
        <div className="w-80 flex-row items-center space-x-1">
          {/* TEAM 2 NAME CHANGER */}
          <input
            id="teamTwoNameInput"
            className="w-52 rounded border-4 bg-secondary-500 p-1 text-3xl text-foreground placeholder:text-secondary-900"
            onChange={debounce((e: React.ChangeEvent<HTMLInputElement>) => {
              setGame((prevGame) => {
                if (prevGame === null) {
                  return prevGame;
                }

                const team2Name = e.target.value;

                const updatedGame = {
                  ...prevGame,
                  teams: [
                    prevGame.teams[0],
                    {
                      ...prevGame.teams[1],
                      name: team2Name,
                    },
                  ],
                };

                send({ action: "data", data: updatedGame });

                return updatedGame;
              });
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
              if (isNaN(number)) {
                number = 0
              }

              setGame((prevGame) => {
                if (prevGame === null) {
                  return prevGame;
                }

                const team2Points = number;

                const updatedGame = {
                  ...prevGame,
                  teams: [
                    prevGame.teams[0],
                    {
                      ...prevGame.teams[1],
                      points: team2Points,
                    },
                  ],
                };

                send({ action: "data", data: updatedGame });

                return updatedGame;
              });
            }}
            value={game.teams[1].points}
          ></input>
        </div>
      </div>
    </div>
  );
}
