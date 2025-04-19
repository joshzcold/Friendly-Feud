import { Game } from "@/src/types/game";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface FinalRoundButtonControlsProps {
  game: Game;
  send: (data: any) => void;
  setGame: Dispatch<SetStateAction<Game | null>>;
}

export default function FinalRoundButtonControls({ game, send, setGame }: FinalRoundButtonControlsProps) {
  const { t } = useTranslation();
  const controlRound = game.is_final_second ? game.final_round_2 : game.final_round;
  return controlRound?.map((x, i) => (
    <div
      key={`${game.is_final_second ? "final-round-2" : "final-round-1"}-question-${i}`}
      className="flex flex-col space-y-5 border-2 p-12"
    >
      <p className="text-3xl font-bold text-foreground">{x.question}</p>
      {game.is_final_second && (
        <div className="flex flex-row space-x-5 pb-2">
          {/* PARTNER'S ANSWER PROVIDED FINAL ROUND */}
          <div className="w-48 grow p-5 align-middle text-3xl text-foreground">
            <i>{t("Partner's Answer")}</i>: {game.final_round[i].input || `(${t("No Answer")})`}
          </div>
          {game.final_round[i].input && (
            <button
              id={`alreadyAnswered${i}Button`}
              className="grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground"
              onClick={() => send({ action: "duplicate" })}
            >
              {t("Already Answered")}
            </button>
          )}
        </div>
      )}
      <div className="flex flex-row space-x-5 pb-2">
        {/* ANSWER PROVIDED FINAL ROUND */}
        <input
          id={`finalRoundAnswer${i}Input`}
          className="w-48 grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground placeholder:text-secondary-900"
          placeholder={t("Answer")}
          value={x.input}
          onChange={(e) => {
            const xInput = e.target.value;
            setGame((prevGame) => {
              if (prevGame === null) {
                return prevGame;
              }

              const newValue = xInput;
              const propertyToUpdate = "input";

              const updatedGame = {
                ...prevGame,
                final_round: prevGame.is_final_second
                  ? prevGame.final_round
                  : prevGame.final_round.map((round, index) =>
                      index === i ? { ...round, [propertyToUpdate]: newValue } : round
                    ),
                final_round_2: prevGame.is_final_second
                  ? prevGame.final_round_2.map((round, index) =>
                      index === i ? { ...round, [propertyToUpdate]: newValue } : round
                    )
                  : prevGame.final_round_2,
              };

              send({ action: "data", data: updatedGame });

              return updatedGame;
            });
          }}
        />

        <button
          id={`finalRoundAnswer${i}RevealButton`}
          className="grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground"
          onClick={() => {
            setGame((prevGame) => {
              if (prevGame === null) {
                return prevGame;
              }

              const newValue = true;
              const propertyToUpdate = "revealed";

              const updatedGame = {
                ...prevGame,
                final_round: prevGame.is_final_second
                  ? prevGame.final_round
                  : prevGame.final_round.map((round, index) =>
                      index === i ? { ...round, [propertyToUpdate]: newValue } : round
                    ),
                final_round_2: prevGame.is_final_second
                  ? prevGame.final_round_2
                  : prevGame.final_round_2.map((round, index) =>
                      index === i ? { ...round, [propertyToUpdate]: newValue } : round
                    ),
              };

              send({ action: "data", data: updatedGame });
              send({ action: "final_reveal" });

              return updatedGame;
            });
          }}
        >
          {t("Reveal Answer")}
        </button>
      </div>
      <div className="flex flex-row space-x-5">
        {/* POINTS AWARDED FINAL ROUND */}
        <select
          id={`finalRoundAnswer${i}Selector`}
          value={x.selection}
          className="w-48 grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground"
          onChange={(e) => {
            const xSelection = parseInt(e.target.value);
            setGame((prevGame) => {
              if (prevGame === null) {
                return prevGame;
              }

              const newValue = xSelection;
              const propertyToUpdate = "selection";

              const updatedGame = {
                ...prevGame,
                final_round: prevGame.is_final_second
                  ? prevGame.final_round
                  : prevGame.final_round.map((round, index) =>
                      index === i ? { ...round, [propertyToUpdate]: newValue } : round
                    ),
                final_round_2: prevGame.is_final_second
                  ? prevGame.final_round_2
                  : prevGame.final_round_2.map((round, index) =>
                      index === i ? { ...round, [propertyToUpdate]: newValue } : round
                    ),
              };

              send({ action: "data", data: updatedGame });

              return updatedGame;
            });
          }}
        >
          <option value={0}>({t("No Answer")}) 0</option>
          {x.answers.map((key, index) => (
            <option key={`answers-${key}`} value={index + 1}>
              {x.answers[index][0]} {x.answers[index][1]}
            </option>
          ))}
        </select>

        <button
          className="grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground"
          id={`finalRoundAnswers${i}SubmitButton`}
          onClick={() => {
            const xPoints = x.selection !== 0 ? x.answers[x.selection - 1][1] : 0;
            setGame((prevGame) => {
              if (prevGame === null) {
                return prevGame;
              }

              const newValue = xPoints;
              const propertyToUpdate = "points";

              const updatedGame = {
                ...prevGame,
                final_round: prevGame.is_final_second
                  ? prevGame.final_round
                  : prevGame.final_round.map((round, index) =>
                      index === i ? { ...round, [propertyToUpdate]: newValue } : round
                    ),
                final_round_2: prevGame.is_final_second
                  ? prevGame.final_round_2
                  : prevGame.final_round_2.map((round, index) =>
                      index === i ? { ...round, [propertyToUpdate]: newValue } : round
                    ),
              };

              send({ action: "data", data: updatedGame });
              send({
                action: x.selection !== 0 ? "final_submit" : "mistake",
              });

              return updatedGame;
            });
          }}
        >
          {t("Award points")}
        </button>
      </div>
    </div>
  ));
}
